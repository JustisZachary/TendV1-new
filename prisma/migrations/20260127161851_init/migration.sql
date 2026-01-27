-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneType" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "consentToText" BOOLEAN NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "helpTopic" TEXT NOT NULL,
    "primaryCampus" TEXT NOT NULL,
    "regularAttender" BOOLEAN NOT NULL,
    "additionalDetails" TEXT,
    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);
