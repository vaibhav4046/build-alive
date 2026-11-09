"""Original score for the BUILD ALIVE film. Pure numpy/scipy synthesis: no samples, no third-party music.
Writes assets/score.wav (44.1 kHz, 16-bit stereo, raw gain; loudness is normalised afterwards with ffmpeg).
Usage: python tools/gen-score.py <out.wav> [duration_s]
"""
import sys
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
import wave

SR = 44100
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 141.2
OUT = sys.argv[1]
N = int(SR * DUR)
rng = np.random.default_rng(7)  # fixed seed: deterministic output


def hz(m):  # midi -> Hz
    return 440.0 * 2 ** ((m - 69) / 12)


def env_adsr(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] = np.minimum(e[-nr:], np.linspace(1, 0, nr))
    return e


L = np.zeros(N)
R = np.zeros(N)


def add(sig, t0, pan=0.0, gain=1.0):
    i0 = int(t0 * SR)
    if i0 >= N:
        return
    s = sig[: N - i0]
    gl = gain * np.cos((pan + 1) * np.pi / 4)
    gr = gain * np.sin((pan + 1) * np.pi / 4)
    L[i0:i0 + len(s)] += s * gl
    R[i0:i0 + len(s)] += s * gr


# ---- pad: slow chord loop, soft detuned sines + 2nd/3rd partial ------------------------------------------
CHORDS = [
    [45, 52, 55, 59, 60],   # Am9-ish
    [41, 48, 52, 57, 64],   # Fmaj7
    [48, 55, 59, 64, 67],   # Cmaj7
    [43, 50, 55, 59, 62],   # G6add9
]
STEP = 8.0
XF = 3.5
k = 0
t = -XF / 2
while t < DUR:
    chord = CHORDS[k % len(CHORDS)]
    n = int((STEP + XF) * SR)
    tt = np.arange(n) / SR
    env = np.minimum(1, tt / XF) * np.minimum(1, (STEP + XF - tt) / XF)
    env = np.sin(env * np.pi / 2) ** 2
    for vi, m in enumerate(chord):
        for det, pan in ((-0.07, -0.6 + 0.25 * vi), (0.07, 0.6 - 0.25 * vi)):
            f = hz(m) * 2 ** (det / 12)
            ph = rng.uniform(0, 2 * np.pi)
            s = np.sin(2 * np.pi * f * tt + ph) + 0.35 * np.sin(2 * np.pi * 2 * f * tt + ph) + 0.12 * np.sin(2 * np.pi * 3 * f * tt)
            lfo = 0.85 + 0.15 * np.sin(2 * np.pi * (0.07 + 0.013 * vi) * tt + ph)
            add(s * env * lfo * 0.05, max(t, 0) if t >= 0 else 0, pan) if t >= 0 else add((s * env * lfo * 0.05)[int(-t * SR):], 0, pan)
    k += 1
    t += STEP

# ---- chime: soft bell (sine + inharmonic partial) -------------------------------------------------------
def chime(midi, t0, gain=0.5, pan=0.0, decay=1.4):
    n = int(SR * (decay * 4))
    tt = np.arange(n) / SR
    f = hz(midi)
    s = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.01 * tt) * np.exp(-tt * 5)
         + 0.2 * np.sin(2 * np.pi * f * 3.97 * tt) * np.exp(-tt * 9))
    s *= np.exp(-tt / decay) * np.minimum(1, tt / 0.004)
    add(s, t0, pan, gain * 0.35)


def blip(midi, t0, gain=0.2, pan=0.0):  # tiny square pixel blip
    n = int(SR * 0.07)
    tt = np.arange(n) / SR
    s = np.sign(np.sin(2 * np.pi * hz(midi) * tt)) * np.exp(-tt * 38)
    add(s, t0, pan, gain * 0.25)


def sub(midi, t0, dur, gain=0.3):
    n = int(SR * dur)
    tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * hz(midi) * tt) * env_adsr(n, 0.8, 1.5)
    add(s, t0, 0, gain * 0.3)


PENT = [69, 72, 74, 76, 79, 81]  # A minor pentatonic
# intro (0-22): blocks building 3-10 s -> staggered blips; agent walk 10-17; fault 14.5; repair 16.5; glasses 17-19; title 19-21
for i in range(18):
    blip(PENT[(i * 3) % len(PENT)] - 12 + (i % 2) * 12, 3.0 + i * 0.38, 0.22, pan=-0.7 + 1.4 * (i % 3) / 2)
for j, m in enumerate([76, 79, 81, 79, 76, 74]):
    chime(m, 10.2 + j * 1.0, 0.45, pan=-0.5 + 0.2 * j)
sub(33, 14.3, 2.6, 0.5)                 # soft low tone under the fault
chime(52, 14.5, 0.35, decay=1.8)
for j, m in enumerate([69, 72, 76, 81]):  # repair arpeggio
    chime(m, 16.5 + j * 0.12, 0.5, pan=-0.3 + 0.2 * j)
for j, m in enumerate([81, 84, 88, 93]):  # glasses shimmer
    chime(m, 17.4 + j * 0.22, 0.3, pan=0.3 - 0.2 * j, decay=1.0)
for m in (57, 64, 69, 72, 76):
    chime(m, 19.6, 0.42, pan=0.0, decay=3.0)
# footage: sparse motif at each pass start and gentle marker chimes at key events
MOTIF = [76, 79, 74, 81]
for t0 in (22.2, 56.8, 94.4):
    for j, m in enumerate(MOTIF):
        chime(m, t0 + j * 0.9, 0.38, pan=-0.4 + 0.27 * j)
for t0 in (38.6, 48.4, 69.2, 111.8):    # INSPECT card / Learn card appear
    chime(88, t0, 0.22, pan=0.4, decay=0.9)
for t0 in (45.6, 103.0):                # failure alert + fault marker appear: lower, softer
    chime(64, t0, 0.35, pan=-0.2, decay=1.6)
# ambient sprinkle between: one soft note every ~7 s, deterministic pattern
for i, t0 in enumerate(np.arange(28, 123, 7.3)):
    chime(PENT[(i * 5 + 2) % len(PENT)] + 12, float(t0), 0.16, pan=float(np.sin(i)), decay=1.8)
# end card 124.8: warm resolve
for m in (45, 57, 64, 69, 72, 76):
    chime(m, 125.0, 0.42, decay=4.0)
sub(33, 124.9, 12, 0.6)

# ---- reverb (synthetic exponential noise IR) + dry/wet --------------------------------------------------
ir_n = int(SR * 2.6)
tt = np.arange(ir_n) / SR
ir = rng.standard_normal(ir_n) * np.exp(-tt / 0.75)
sos = butter(2, 5200, "low", fs=SR, output="sos")
ir = sosfilt(sos, ir)
ir /= np.sqrt(np.sum(ir ** 2))


def wet(x):
    return fftconvolve(x, ir)[: len(x)]


Lw, Rw = wet(L), wet(np.roll(R, 11))
mixL = 0.78 * L + 0.55 * Lw
mixR = 0.78 * R + 0.55 * Rw
# gentle low-pass for softness, global fades
sos = butter(2, 9000, "low", fs=SR, output="sos")
mixL, mixR = sosfilt(sos, mixL), sosfilt(sos, mixR)
g = np.ones(N)
fi, fo = int(1.5 * SR), int(3.0 * SR)
g[:fi] = np.linspace(0, 1, fi)
g[-fo:] = np.linspace(1, 0, fo)
mixL *= g
mixR *= g
peak = max(np.abs(mixL).max(), np.abs(mixR).max())
mixL, mixR = mixL / peak * 0.5, mixR / peak * 0.5  # raw headroom; loudness is set later
pcm = (np.stack([mixL, mixR], 1) * 32767).astype("<i2")
with wave.open(OUT, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", OUT, DUR, "s")
