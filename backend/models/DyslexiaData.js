const mongoose = require('mongoose');

const dyslexiaDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DyslexiaData', dyslexiaDataSchema);