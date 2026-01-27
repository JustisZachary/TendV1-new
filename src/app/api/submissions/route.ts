import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractTags, toTagString } from "@/lib/tags";

type SubmissionPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneType?: string;
  phoneNumber?: string;
  consentToText?: string;
  birthdate?: string;
  helpTopic?: string;
  primaryCampus?: string;
  regularAttender?: string;
  additionalDetails?: string;
};

const requiredFields: Array<keyof SubmissionPayload> = [
  "firstName",
  "lastName",
  "email",
  "phoneType",
  "phoneNumber",
  "consentToText",
  "birthdate",
  "helpTopic",
  "primaryCampus",
  "regularAttender",
];

const toBoolean = (value: string) => {
  if (value === "yes") return true;
  if (value === "no") return false;
  throw new Error("Invalid boolean value");
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmissionPayload;

    for (const field of requiredFields) {
      if (!body[field] || String(body[field]).trim().length === 0) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const birthdate = new Date(body.birthdate ?? "");
    if (Number.isNaN(birthdate.getTime())) {
      return NextResponse.json(
        { error: "Invalid birthdate." },
        { status: 400 }
      );
    }

    const consentToText = toBoolean(body.consentToText ?? "");
    const regularAttender = toBoolean(body.regularAttender ?? "");

    const tagSource = `${body.helpTopic ?? ""} ${body.additionalDetails ?? ""}`;
    const tags = extractTags(tagSource);

    const submission = await prisma.submission.create({
      data: {
        firstName: body.firstName ?? "",
        lastName: body.lastName ?? "",
        email: body.email ?? "",
        phoneType: body.phoneType ?? "",
        phoneNumber: body.phoneNumber ?? "",
        consentToText,
        birthdate,
        helpTopic: body.helpTopic ?? "",
        primaryCampus: body.primaryCampus ?? "",
        regularAttender,
        additionalDetails: body.additionalDetails?.trim() || null,
        tags: toTagString(tags),
      },
    });

    return NextResponse.json({ id: submission.id });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid boolean value") {
      return NextResponse.json(
        { error: "Invalid yes/no selection." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Unable to save submission." },
      { status: 500 }
    );
  }
}
