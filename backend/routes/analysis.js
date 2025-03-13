const express = require('express');
const multer = require('multer');
const { PythonShell } = require('python-shell');
const DyslexiaData = require('../models/DyslexiaData');
const Questionnaire = require('../models/Questionnaire');
const axios = require('axios');
const { execSync } = require('child_process');
const path = require('path');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

router.post('/questionnaire', auth, async (req, res) => {
  const { responses } = req.body;
  try {
    const questionnaire = new Questionnaire({ userId: req.user, responses });
    await questionnaire.save();
    res.json({ msg: 'Questionnaire submitted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/upload', auth, upload.fields([{ name: 'video' }, { name: 'handwriting' }]), async (req, res) => {
  try {
    const videoPath = path.join(__dirname, '../uploads', req.files['video'][0].filename);
    const handwritingPath = path.join(__dirname, '../uploads', req.files['handwriting'][0].filename);
    const audioPath = path.join(__dirname, '../uploads', `${req.files['video'][0].filename}.wav`);

    execSync(`python -c "from moviepy.editor import VideoFileClip; VideoFileClip('${videoPath}').audio.write_audiofile('${audioPath}')"`);

    const eyeFeatures = await new Promise((resolve, reject) => {
      PythonShell.run('python_scripts/eye_detection.py', { args: [videoPath] }, (err, results) => {
        if (err) reject(err);
        resolve(JSON.parse(results[0]));
      });
    });

    const speechFeatures = await new Promise((resolve, reject) => {
      PythonShell.run('python_scripts/speech_analysis.py', { args: [audioPath] }, (err, results) => {
        if (err) reject(err);
        resolve(JSON.parse(results[0]));
      });
    });

    const handwritingFeatures = await new Promise((resolve, reject) => {
      PythonShell.run('python_scripts/handwriting_model.py', { args: [handwritingPath] }, (err, results) => {
        if (err) reject(err);
        resolve(JSON.parse(results[0]));
      });
    });

    const llmResponse = await axios.post('https://api.xai.com/generate-report', {
      eyeFeatures,
      speechFeatures,
      handwritingFeatures,
    }, {
      headers: { Authorization: `Bearer ${process.env.XAI_API_KEY}` },
    });

    const report = llmResponse.data.report;
    const isDyslexic = llmResponse.data.isDyslexic;

    const dyslexiaData = new DyslexiaData({
      userId: req.user,
      videoUrl: videoPath,
      audioUrl: audioPath,
      handwritingUrl: handwritingPath,
      eyeFeatures,
      speechFeatures,
      handwritingFeatures,
      report,
      isDyslexic,
    });
    await dyslexiaData.save();

    res.json({ report, isDyslexic });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/dashboard', auth, async (req, res) => {
  try {
    const data = await DyslexiaData.find({ userId: req.user });
    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;