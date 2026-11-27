// PATHPILOT — AUTHENTICATED STUDENT DATA ROUTER
// Directive: PP-PHASE-B-DATA-SYNC

import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import {
  getCareerGoal,
  getStudentProfile,
  getStudentRoadmap,
  getStudentSkills,
  getStudentState,
  patchStudentProfile,
  putCareerGoal,
  putSavedCareers,
  putStudentRoadmap,
  putStudentSkills
} from './student.controller.js';

export const studentRouter = Router();

studentRouter.use(requireAuth, requireRole(['STUDENT']));

studentRouter.get('/state', getStudentState);

studentRouter.get('/profile', getStudentProfile);
studentRouter.patch('/profile', patchStudentProfile);
studentRouter.get('/profile/:userId', getStudentProfile);
studentRouter.patch('/profile/:userId', patchStudentProfile);

studentRouter.get('/career-goal', getCareerGoal);
studentRouter.put('/career-goal', putCareerGoal);
studentRouter.patch('/career-goal', putCareerGoal);

studentRouter.put('/saved-careers', putSavedCareers);

studentRouter.get('/skills', getStudentSkills);
studentRouter.put('/skills', putStudentSkills);
studentRouter.patch('/skills', putStudentSkills);

studentRouter.get('/roadmap', getStudentRoadmap);
studentRouter.put('/roadmap', putStudentRoadmap);
studentRouter.patch('/roadmap/progress', putStudentRoadmap);
