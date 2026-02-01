/**
 * Submission row shape for Supabase table "Submission".
 * Table must have the same columns (camelCase) if created outside this app.
 */
export type Submission = {
  id: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneType: string;
  phoneNumber: string;
  consentToText: boolean;
  birthdate: string;
  helpTopic: string;
  primaryCampus: string;
  regularAttender: boolean;
  additionalDetails: string | null;
  tags: string;
};
