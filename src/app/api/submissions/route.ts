import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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

function validatePayload(body: SubmissionPayload) {
  for (const field of requiredFields) {
    if (!body[field] || String(body[field]).trim().length === 0) {
      return { error: `Missing required field: ${field}` as const, status: 400 as const };
    }
  }

  const birthdate = new Date(body.birthdate ?? "");
  if (Number.isNaN(birthdate.getTime())) {
    return { error: "Invalid birthdate." as const, status: 400 as const };
  }

  try {
    toBoolean(body.consentToText ?? "");
    toBoolean(body.regularAttender ?? "");
  } catch {
    return { error: "Invalid yes/no selection." as const, status: 400 as const };
  }

  return null;
}

export async function POST(request: Request) {
  const formspreeId = process.env.FORMSPREE_FORM_ID;
  const useFormspree = !supabase && formspreeId;

  if (!supabase && !useFormspree) {
    console.error("[submissions] Neither Supabase nor FORMSPREE_FORM_ID is set");
    return NextResponse.json(
      { error: "Server is not configured for submissions. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or FORMSPREE_FORM_ID." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as SubmissionPayload;

    const validation = validatePayload(body);
    if (validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }

    const sendToFormspree = async () => {
      if (!formspreeId) {
        return NextResponse.json(
          { error: "Unable to save submission." },
          { status: 500 }
        );
      }

      const formspreeRes = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!formspreeRes.ok) {
        console.error("[submissions] Formspree error:", await formspreeRes.text());
        return NextResponse.json(
          { error: "Unable to save submission." },
          { status: 500 }
        );
      }

      return NextResponse.json({ id: "formspree" });
    };

    if (useFormspree) {
      return sendToFormspree();
    }

    const birthdate = new Date(body.birthdate ?? "");
    const consentToText = toBoolean(body.consentToText ?? "");
    const regularAttender = toBoolean(body.regularAttender ?? "");
    const tagSource = `${body.helpTopic ?? ""} ${body.additionalDetails ?? ""}`;
    const tags = extractTags(tagSource);
    const tagString = toTagString(tags);
    const now = new Date();
    const submissionData = {
      id: randomUUID(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      firstName: body.firstName ?? "",
      lastName: body.lastName ?? "",
      email: body.email ?? "",
      phoneType: body.phoneType ?? "",
      phoneNumber: body.phoneNumber ?? "",
      consentToText,
      birthdate: birthdate.toISOString(),
      helpTopic: body.helpTopic ?? "",
      primaryCampus: body.primaryCampus ?? "",
      regularAttender,
      additionalDetails: body.additionalDetails?.trim() || null,
      tags: tagString,
    };

    const { data, error } = await supabase!
      .from("Submission")
      .insert(submissionData)
      .select("id")
      .single();

    if (error) {
      console.error("[submissions] Supabase error:", error);
      if (formspreeId) {
        console.warn("[submissions] Falling back to Formspree.");
        return sendToFormspree();
      }
      return NextResponse.json(
        { error: "Unable to save submission." },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data?.id ?? submissionData.id });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid boolean value") {
      return NextResponse.json(
        { error: "Invalid yes/no selection." },
        { status: 400 }
      );
    }

    console.error("[submissions] POST error:", error);

    return NextResponse.json(
      { error: "Unable to save submission." },
      { status: 500 }
    );
  }
}
