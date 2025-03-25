import sys
import json
import speech_recognition as sr
import sounddevice as sd
import scipy.io.wavfile as wav
import numpy as np
import librosa
import logging
from Levenshtein import distance as lev_distance
import time

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DyslexiaAnalyzer:
    def __init__(self, reference_text=None):
        self.recognizer = sr.Recognizer()
        self.reference_text = reference_text or "The quick brown fox jumps over the lazy dog. She sells seashells by the seashore. Peter Piper picked a peck of pickled peppers."
        logger.info("Speech recognition initialized.")

    def record_audio(self, duration=10, sample_rate=16000, filename="temp_audio.wav"):
        """Record audio for a specified duration and save it as a .wav file."""
        logger.info("Recording audio...")
        for i in range(3, 0, -1):
            logger.info(f"Starting in {i}...")
            time.sleep(1)
        
        logger.info(f"Repeat this statement: {self.reference_text}")
        audio = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1, dtype='int16')
        sd.wait()
        wav.write(filename, sample_rate, audio)
        logger.info(f"Recording saved as {filename}")
        return filename

    def load_audio_from_wav(self, file_path):
        """Load audio from a .wav file."""
        logger.info(f"Loading audio from {file_path}...")
        with sr.AudioFile(file_path) as source:
            audio = self.recognizer.record(source)
        return audio

    def preprocess_audio(self, audio):
        """Preprocess audio using librosa."""
        raw_data = audio.get_raw_data(convert_rate=16000, convert_width=2)
        waveform = np.frombuffer(raw_data, dtype=np.int16).astype(np.float32)
        waveform = librosa.util.normalize(waveform)
        waveform = librosa.effects.preemphasis(waveform)
        return waveform, 16000

    def extract_features(self, waveform, sr):
        """Extract spectral and temporal features using librosa."""
        mfccs = librosa.feature.mfcc(y=waveform, sr=sr, n_mfcc=13)
        spectral_contrast = librosa.feature.spectral_contrast(y=waveform, sr=sr)
        zero_crossing_rate = librosa.feature.zero_crossing_rate(waveform)
        rms_energy = librosa.feature.rms(y=waveform)

        return {
            "mfcc_mean": np.mean(mfccs, axis=1).tolist(),
            "mfcc_std": np.std(mfccs, axis=1).tolist(),
            "spectral_contrast_mean": np.mean(spectral_contrast, axis=1).tolist(),
            "spectral_contrast_std": np.std(spectral_contrast, axis=1).tolist(),
            "zero_crossing_rate_mean": float(np.mean(zero_crossing_rate)),
            "zero_crossing_rate_std": float(np.std(zero_crossing_rate)),
            "rms_energy_mean": float(np.mean(rms_energy)),
            "rms_energy_std": float(np.std(rms_energy))
        }

    def analyze_speech(self, file_path=None):
        """Analyze speech from a .wav file or record new audio."""
        try:
            if file_path:
                audio = self.load_audio_from_wav(file_path)
            else:
                file_path = self.record_audio()
                audio = self.load_audio_from_wav(file_path)

            waveform, sr = self.preprocess_audio(audio)
            features = self.extract_features(waveform, sr)

            hypothesis = self.recognizer.recognize_google(audio)
            logger.info(f"Recognized text: {hypothesis}")

            word_error_rate = lev_distance(self.reference_text.split(), hypothesis.split()) / len(self.reference_text.split())
            dyslexia_probability = self._assess_dyslexia_probability(word_error_rate, features)

            return {
                "reference_text": self.reference_text,
                "hypothesis": hypothesis,
                "word_error_rate": float(word_error_rate),
                "features": features,
                "dyslexia_probability": dyslexia_probability
            }
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return {"error": str(e)}

    def _assess_dyslexia_probability(self, word_error_rate, features):
        """Assess dyslexia probability based on word error rate and features."""
        WER_THRESHOLD = 0.5
        MFCC_STD_THRESHOLD = 50.0
        ZCR_STD_THRESHOLD = 0.02

        red_flags = 0
        if word_error_rate > WER_THRESHOLD:
            red_flags += 1
        if np.mean(features["mfcc_std"]) > MFCC_STD_THRESHOLD:
            red_flags += 1
        if features["zero_crossing_rate_std"] > ZCR_STD_THRESHOLD:
            red_flags += 1

        if red_flags >= 2:
            return "High Probability of Dyslexia"
        elif red_flags == 1:
            return "Moderate Probability of Dyslexia"
        else:
            return "Low Probability of Dyslexia"

if __name__ == "__main__":
    try:
        file_path = sys.argv[1]
        reference_text = sys.argv[2] if len(sys.argv) > 2 else None
        
        analyzer = DyslexiaAnalyzer(reference_text=reference_text)
        results = analyzer.analyze_speech(file_path)
        print(json.dumps(results))
    except Exception as e:
        print(json.dumps({"error": str(e)}))