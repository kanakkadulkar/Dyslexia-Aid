const mongoose = require('mongoose');

const dyslexiaDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assessmentStage: {
    type: String,
    enum: ['questionnaire', 'video', 'handwriting', 'complete'],
    default: 'questionnaire'
  },
  questionnaireData: {
    responses: { type: Object },
    initialProbability: { type: Number }
  },
  videoUrl: { type: String },
  audioUrl: { type: String },
  handwritingUrl: { type: String },
  eyeFeatures: { type: Object },
  speechFeatures: {
    reference_text: { type: String },
    hypothesis: { type: String },
    word_error_rate: { type: Number },
    features: {
      mfcc_mean: { type: [Number] },
      mfcc_std: { type: [Number] },
      spectral_contrast_mean: { type: [Number] },
      spectral_contrast_std: { type: [Number] },
      zero_crossing_rate_mean: { type: Number },
      zero_crossing_rate_std: { type: Number },
      rms_energy_mean: { type: Number },
      rms_energy_std: { type: Number }
    },
    dyslexia_probability: { type: String }
  },
  handwritingFeatures: { type: Object },
  report: { type: String },
  isDyslexic: { type: Boolean },
  subscription: {
    active: { type: Boolean, default: false },
    plan: { type: String },
    expiresAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now },
  referenceText: { 
    type: String,
    default: "The quick brown fox jumps over the lazy dog. She sells seashells by the seashore. Peter Piper picked a peck of pickled peppers."
  },
  analysisDetails: {
    handwriting: {
      probability: Number,
      confidence: Number,
      interpretation: [String]
    },
    speech: {
      wordErrorRate: Number,
      dyslexiaProbability: String,
      interpretation: [String]
    },
    eyeTracking: {
      abnormalMovements: {
        irregularMovements: Number,
        fixationIssues: Number,
        regressions: Number
      },
      interpretation: [String]
    },
    questionnaire: {
      initialProbability: Number,
      significantResponses: [String]
    }
  },
  overallProbability: Number,
  testHistory: [{
    date: { type: Date, default: Date.now },
    overallProbability: { type: Number, default: 0 },
    report: String,
    analysisDetails: {
      handwriting: { type: Object, default: {} },
      speech: { type: Object, default: {} },
      eyeTracking: { type: Object, default: {} },
      questionnaire: { type: Object, default: {} }
    }
  }],
  gameProgress: {
    gamesPlayed: { type: Number, default: 0 },
    lastPlayed: { type: Date },
    scores: {
      wordScramble: [{ type: Number }],
      memoryMatch: [{ type: Number }],
      speedReading: [{ type: Number }],
      phonemeBlending: [{ type: Number }]
    }
  }
});

module.exports = mongoose.model('DyslexiaData', dyslexiaDataSchema);