const mongoose = require('mongoose');

const questionnaireSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  responses: { type: Object, required: true },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Questionnaire', questionnaireSchema);