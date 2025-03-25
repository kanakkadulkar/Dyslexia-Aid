const express = require('express');
const multer = require('multer');
const { PythonShell } = require('python-shell');
const DyslexiaData = require('../models/DyslexiaData');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { execSync } = require('child_process');
const path = require('path');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const config = require('../config/keys');
const fs = require('fs');

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

function calculateInitialProbability(responses) {
  const yesResponses = Object.values(responses).filter(v => v === true).length;
  return yesResponses / Object.keys(responses).length;
}

router.post('/questionnaire', auth, async (req, res) => {
  const { responses } = req.body;
  try {
    const initialProbability = calculateInitialProbability(responses);
    
    let dyslexiaData = await DyslexiaData.findOne({ userId: req.user });
    if (!dyslexiaData) {
      dyslexiaData = new DyslexiaData({
        userId: req.user,
        questionnaireData: {
          responses,
          initialProbability
        },
        assessmentStage: 'video'
      });
      await dyslexiaData.save();
    }

    res.json({ 
      probability: initialProbability,
      nextStage: 'video',
      shouldProceed: initialProbability > 0.3
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/save-video', auth, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files.video || !req.files.audio) {
      console.error('Missing files:', req.files);
      return res.status(400).json({ msg: 'Both video and audio files are required' });
    }

    console.log('Received files:', req.files); // Debug log

    // Normalize paths for cross-platform compatibility
    const videoPath = path.join(__dirname, '../uploads', req.files.video[0].filename).replace(/\\/g, '/');
    const audioPath = path.join(__dirname, '../uploads', req.files.audio[0].filename).replace(/\\/g, '/');

    console.log('Video path:', videoPath); // Debug log
    console.log('Audio path:', audioPath); // Debug log

    // Verify files exist and are readable
    if (!fs.existsSync(videoPath) || !fs.existsSync(audioPath)) {
      console.error('Files not found:', { videoPath, audioPath });
      return res.status(400).json({ msg: 'Uploaded files not found' });
    }

    try {
      // Get existing data first
      const dyslexiaData = await DyslexiaData.findOne({ userId: req.user });
      if (!dyslexiaData) {
        console.error('No dyslexia data found for user:', req.user);
        return res.status(400).json({ msg: 'Please complete questionnaire first' });
      }

      console.log('Processing video for eye tracking...');
      // Process video for eye tracking
      const eyeFeatures = await new Promise((resolve, reject) => {
        PythonShell.run('python_scripts/eye_detection.py', 
          { 
            args: [videoPath],
            pythonPath: 'python',
            pythonOptions: ['-u']
          }, 
          (err, results) => {
            if (err) {
              console.error('Eye detection error:', err);
              reject(err);
            }
            try {
              if (!results || results.length === 0) {
                reject(new Error('No results from eye detection script'));
                return;
              }
              const parsed = JSON.parse(results[0]);
              console.log('Eye detection results:', parsed);
              resolve(parsed);
            } catch (parseErr) {
              console.error('Parse error:', parseErr, 'Results:', results);
              reject(parseErr);
            }
          }
        );
      });

      console.log('Processing audio for speech analysis...');
      // Process audio for speech analysis
      const speechFeatures = await new Promise((resolve, reject) => {
        PythonShell.run('python_scripts/speech_analysis.py', 
          { 
            args: [audioPath, dyslexiaData.referenceText],
            pythonPath: 'python',
            pythonOptions: ['-u']
          }, 
          (err, results) => {
            if (err) {
              console.error('Speech analysis error:', err);
              reject(err);
            }
            try {
              if (!results || results.length === 0) {
                reject(new Error('No results from speech analysis script'));
                return;
              }
              const parsed = JSON.parse(results[0]);
              console.log('Speech analysis results:', parsed);
              resolve(parsed);
            } catch (parseErr) {
              console.error('Parse error:', parseErr, 'Results:', results);
              reject(parseErr);
            }
          }
        );
      });

      // Update assessment data
      dyslexiaData.videoUrl = videoPath;
      dyslexiaData.audioUrl = audioPath;
      dyslexiaData.eyeFeatures = eyeFeatures;
      dyslexiaData.speechFeatures = speechFeatures;
      dyslexiaData.assessmentStage = 'handwriting';
      
      await dyslexiaData.save();
      console.log('Successfully saved assessment data');

      res.json({ success: true });

    } catch (processError) {
      console.error('Processing error:', processError);
      // Cleanup files on error
      try {
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
      throw processError;
    }

  } catch (err) {
    console.error('Route error:', err);
    res.status(500).json({ 
      msg: 'Server error', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

router.post('/save-handwriting', auth, upload.single('handwriting'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No handwriting image uploaded' });
    }

    console.log('Received handwriting file:', req.file); // Debug log

    // Normalize path for cross-platform compatibility
    const handwritingPath = path.join(__dirname, '../uploads', req.file.filename).replace(/\\/g, '/');
    console.log('Handwriting path:', handwritingPath); // Debug log

    try {
      // Get existing data
      const dyslexiaData = await DyslexiaData.findOne({ userId: req.user });
      if (!dyslexiaData) {
        return res.status(400).json({ msg: 'Please complete previous steps first' });
      }

      // Process handwriting image
      const handwritingFeatures = await new Promise((resolve, reject) => {
        PythonShell.run('python_scripts/handwriting_analysis.py', 
          { 
            args: [handwritingPath],
            pythonPath: 'python',
            pythonOptions: ['-u']
          }, 
          (err, results) => {
            if (err) {
              console.error('Handwriting analysis error:', err);
              reject(err);
            }
            try {
              resolve(JSON.parse(results[0]));
            } catch (parseErr) {
              console.error('Parse error:', parseErr, 'Results:', results);
              reject(parseErr);
            }
          }
        );
      });

      // Update assessment data with handwriting features
      dyslexiaData.handwritingUrl = handwritingPath;
      dyslexiaData.handwritingFeatures = handwritingFeatures;
      dyslexiaData.assessmentStage = 'complete';

      // Generate comprehensive report using Groq API
      const reportPrompt = `Analyze the following dyslexia assessment data and generate a comprehensive report:

Eye Tracking Analysis:
${JSON.stringify(dyslexiaData.eyeFeatures, null, 2)}

Speech Analysis:
${JSON.stringify(dyslexiaData.speechFeatures, null, 2)}

Handwriting Analysis:
${JSON.stringify(handwritingFeatures, null, 2)}

Please provide:
1. Overall analysis and probability of dyslexia
2. Detailed analysis of each component (eye tracking, speech, handwriting)
3. Specific observations and patterns
4. Recommendations for improvement
5. Next steps and follow-up actions`;

      const groqResponse = await axios.post(
        'https://api.groq.com/v1/completions',
        {
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: reportPrompt }],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${config.get('groqApiKey')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const report = groqResponse.data.choices[0].message.content;
      
      // Parse the report into structured data
      const analysis = {
        overallAnalysis: report.split('Overall analysis')[1]?.split('Detailed analysis')[0]?.trim() || '',
        detailedAnalysis: [
          {
            title: 'Eye Tracking Analysis',
            description: dyslexiaData.eyeFeatures.interpretation.join('. '),
            observations: dyslexiaData.eyeFeatures.observations || []
          },
          {
            title: 'Speech Analysis',
            description: `Word Error Rate: ${(dyslexiaData.speechFeatures.word_error_rate * 100).toFixed(2)}%`,
            observations: dyslexiaData.speechFeatures.observations || []
          },
          {
            title: 'Handwriting Analysis',
            description: handwritingFeatures.interpretation.join('. '),
            observations: handwritingFeatures.observations || []
          }
        ],
        recommendations: report.split('Recommendations')[1]?.split('Next steps')[0]?.trim().split('\n').filter(line => line.trim()) || [],
        nextSteps: report.split('Next steps')[1]?.trim().split('\n').filter(line => line.trim()) || []
      };

      // Update assessment data with report
      dyslexiaData.report = report;
      dyslexiaData.analysis = analysis;
      dyslexiaData.overallProbability = calculateOverallProbability(
        dyslexiaData.eyeFeatures,
        dyslexiaData.speechFeatures,
        handwritingFeatures
      );

      // Add to test history
      dyslexiaData.testHistory.push({
        date: new Date(),
        overallProbability: dyslexiaData.overallProbability,
        analysis: analysis
      });

      await dyslexiaData.save();

      res.json({ 
        success: true,
        report: analysis
      });

    } catch (processError) {
      console.error('Processing error:', processError);
      // Cleanup file on error
      try {
        if (fs.existsSync(handwritingPath)) fs.unlinkSync(handwritingPath);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
      throw processError;
    }

  } catch (err) {
    console.error('Route error:', err);
    res.status(500).json({ 
      msg: 'Server error', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Helper function to calculate overall probability
function calculateOverallProbability(eyeFeatures, speechFeatures, handwritingFeatures) {
  const weights = {
    eyeTracking: 0.3,
    speech: 0.3,
    handwriting: 0.4
  };

  const eyeProbability = eyeFeatures.probability || 0;
  const speechProbability = speechFeatures.probability || 0;
  const handwritingProbability = handwritingFeatures.probability || 0;

  return (
    eyeProbability * weights.eyeTracking +
    speechProbability * weights.speech +
    handwritingProbability * weights.handwriting
  );
}

router.post('/complete-assessment', auth, upload.single('handwriting'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No handwriting file uploaded' });
    }

    const handwritingPath = path.join(__dirname, '../uploads', req.file.filename).replace(/\\/g, '/');

    try {
      // Get existing assessment data
      let dyslexiaData = await DyslexiaData.findOne({ userId: req.user });
      if (!dyslexiaData || !dyslexiaData.videoUrl) {
        return res.status(400).json({ msg: 'Please complete video assessment first' });
      }

      // Process handwriting
      const handwritingFeatures = await new Promise((resolve, reject) => {
        PythonShell.run('python_scripts/handwriting_model.py', 
          { 
            args: [handwritingPath],
            pythonPath: 'python',
            pythonOptions: ['-u']
          }, 
          (err, results) => {
            if (err) reject(err);
            try {
              resolve(JSON.parse(results[0]));
            } catch (parseErr) {
              reject(parseErr);
            }
          }
        );
      });

      // Prepare detailed analysis for each component
      const analysisDetails = {
        handwriting: {
          probability: handwritingFeatures.dyslexia_probability,
          confidence: handwritingFeatures.confidence_score,
          interpretation: getHandwritingInterpretation(handwritingFeatures.dyslexia_probability)
        },
        speech: {
          wordErrorRate: dyslexiaData.speechFeatures.word_error_rate,
          dyslexiaProbability: dyslexiaData.speechFeatures.dyslexia_probability,
          interpretation: getSpeechInterpretation(dyslexiaData.speechFeatures)
        },
        eyeTracking: {
          abnormalMovements: calculateEyeTrackingAnomalies(dyslexiaData.eyeFeatures),
          interpretation: getEyeTrackingInterpretation(dyslexiaData.eyeFeatures)
        },
        questionnaire: {
          initialProbability: dyslexiaData.questionnaireData.initialProbability,
          significantResponses: getSignificantQuestionnaireResponses(dyslexiaData.questionnaireData)
        }
      };

      // Calculate weighted probabilities
      const weights = {
        handwriting: 0.3,
        speech: 0.3,
        eyeTracking: 0.2,
        questionnaire: 0.2
      };

      const overallProbability = calculateOverallProbability(analysisDetails, weights);

      // Generate comprehensive report using Groq
      const llmResponse = await axios.post('https://api.groq.com/v1/completions', {
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "system",
            content: `You are a dyslexia assessment expert. Generate a detailed report with separate sections for each analysis component and a final conclusion. Include specific observations and recommendations.`
          },
          {
            role: "user",
            content: `Please analyze these detailed test results and provide a comprehensive report:

1. Handwriting Analysis:
${JSON.stringify(analysisDetails.handwriting, null, 2)}

2. Speech Analysis:
${JSON.stringify(analysisDetails.speech, null, 2)}

3. Eye Tracking Analysis:
${JSON.stringify(analysisDetails.eyeTracking, null, 2)}

4. Initial Questionnaire:
${JSON.stringify(analysisDetails.questionnaire, null, 2)}

Overall Probability: ${overallProbability}

Please structure the report with:
- Individual analysis of each component
- Specific observations and patterns
- Combined analysis
- Recommendations for support and intervention
- Suggested next steps`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }, {
        headers: { 
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
      });

      // Update assessment data
      dyslexiaData.handwritingUrl = handwritingPath;
      dyslexiaData.handwritingFeatures = handwritingFeatures;
      dyslexiaData.analysisDetails = analysisDetails;
      dyslexiaData.overallProbability = overallProbability;
      dyslexiaData.report = llmResponse.data.choices[0].message.content;
      dyslexiaData.isDyslexic = overallProbability > 0.6;
      dyslexiaData.assessmentStage = 'complete';
      
      await dyslexiaData.save();

      res.json({
        success: true,
        isDyslexic: dyslexiaData.isDyslexic,
        probability: overallProbability,
        analysisDetails: dyslexiaData.subscription.active ? analysisDetails : null,
        report: dyslexiaData.subscription.active ? dyslexiaData.report : null,
        requiresSubscription: !dyslexiaData.subscription.active
      });

    } catch (processError) {
      console.error('Processing error:', processError);
      if (fs.existsSync(handwritingPath)) fs.unlinkSync(handwritingPath);
      throw processError;
    }

  } catch (err) {
    console.error('Route error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Helper functions for analysis interpretation
function getHandwritingInterpretation(probability) {
  const features = [];
  if (probability > 0.7) {
    features.push('Significant irregularities in letter formation');
    features.push('Inconsistent spacing between words');
    features.push('Variable letter size');
  } else if (probability > 0.4) {
    features.push('Some irregularities in writing patterns');
    features.push('Occasional spacing issues');
  }
  return features;
}

function getSpeechInterpretation(speechFeatures) {
  const features = [];
  if (speechFeatures.word_error_rate > 0.3) {
    features.push('Significant difficulty in word recognition');
    features.push('Problems with phonological processing');
  }
  return features;
}

function calculateEyeTrackingAnomalies(eyeFeatures) {
  const anomalies = {
    irregularMovements: 0,
    fixationIssues: 0,
    regressions: 0
  };

  if (eyeFeatures.tracking_summary) {
    anomalies.irregularMovements = eyeFeatures.tracking_summary.irregular_movements || 0;
    anomalies.fixationIssues = eyeFeatures.tracking_summary.fixation_issues || 0;
    anomalies.regressions = eyeFeatures.tracking_summary.regressions || 0;
  }

  return anomalies;
}

function getEyeTrackingInterpretation(eyeFeatures) {
  const features = [];
  const anomalies = calculateEyeTrackingAnomalies(eyeFeatures);
  
  if (anomalies.irregularMovements > 5) {
    features.push('Irregular eye movement patterns');
  }
  if (anomalies.fixationIssues > 3) {
    features.push('Difficulty maintaining stable fixation');
  }
  if (anomalies.regressions > 4) {
    features.push('Frequent backward eye movements');
  }
  
  return features;
}

function getSignificantQuestionnaireResponses(questionnaireData) {
  const significant = [];
  Object.entries(questionnaireData.responses || {}).forEach(([question, response]) => {
    if (response === true) {
      significant.push(question);
    }
  });
  return significant;
}

router.post('/subscribe', auth, async (req, res) => {
  try {
    const { plan } = req.body;
    const dyslexiaData = await DyslexiaData.findOne({ userId: req.user });
    
    if (!dyslexiaData) {
      return res.status(400).json({ msg: 'No assessment data found' });
    }

    dyslexiaData.subscription = {
      active: true,
      plan,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
    
    await dyslexiaData.save();
    res.json({ 
      success: true,
      report: dyslexiaData.report
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/dashboard', auth, async (req, res) => {
  try {
    const data = await DyslexiaData.findOne({ userId: req.user });
    if (!data) {
      return res.status(404).json({ msg: 'No assessment data found' });
    }
    
    // Only send full data if subscribed
    if (!data.subscription.active) {
      return res.json({
        subscription: data.subscription,
        isDyslexic: data.isDyslexic,
        assessmentStage: data.assessmentStage
      });
    }
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/reference-text', auth, async (req, res) => {
  try {
    const dyslexiaData = await DyslexiaData.findOne({ userId: req.user });
    if (!dyslexiaData) {
      return res.status(404).json({ msg: 'Assessment not started' });
    }
    res.json({ referenceText: dyslexiaData.referenceText });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;