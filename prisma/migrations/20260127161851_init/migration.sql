-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneType" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "consentToText" BOOLEAN NOT NULL,
    "birthdate" DATETIME NOT NULL,
    "helpTopic" TEXT NOT NULL,
    "primaryCampus" TEXT NOT NULL,
    "regularAttender" BOOLEAN NOT NULL,
    "additionalDetails" TEXT
);
