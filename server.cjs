const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory "database"
let appState = {
  profile: {
    firstName: '',
    lastName: '',
    educationLevel: 'University / College Student',
    interests: [],
    strengths: [],
    goal: null,
    onboardingCompleted: false,
  },
  savedCareers: [],
  roadmapProgress: {},
  assessmentScores: {}
};

app.get('/api/state', (req, res) => {
  res.json(appState);
});

app.post('/api/state', (req, res) => {
  const { profile, savedCareers, roadmapProgress, assessmentScores } = req.body;
  if (profile) appState.profile = profile;
  if (savedCareers) appState.savedCareers = savedCareers;
  if (roadmapProgress) appState.roadmapProgress = roadmapProgress;
  if (assessmentScores) appState.assessmentScores = assessmentScores;
  res.json({ success: true, state: appState });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
