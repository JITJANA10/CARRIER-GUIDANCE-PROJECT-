-- Additive Phase B Migration: Student Profile Metadata, Normalized StudentSkill, and Roadmap Completed Phases
-- Preserves all existing demo users, profiles, skills, careers, roadmap templates, progress rows, mentors, and bookings.

ALTER TABLE "profiles" ADD COLUMN "completedHoursThisWeek" REAL NOT NULL DEFAULT 0;
ALTER TABLE "profiles" ADD COLUMN "interestsJson" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "profiles" ADD COLUMN "strengthsJson" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "profiles" ADD COLUMN "savedCareersJson" TEXT NOT NULL DEFAULT '[]';

ALTER TABLE "roadmap_progress" ADD COLUMN "completedPhases" TEXT NOT NULL DEFAULT '[]';

CREATE TABLE IF NOT EXISTS "student_skills" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "skillKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "classification" TEXT NOT NULL,
    "careerSlug" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "student_skills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "student_skills_userId_skillKey_key" ON "student_skills"("userId", "skillKey");
CREATE INDEX IF NOT EXISTS "student_skills_userId_idx" ON "student_skills"("userId");
