import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: {
    supabase: { configured: boolean; ok?: boolean; error?: string };
  } = {
    supabase: { configured: !!supabase },
  };

  if (supabase) {
    try {
      const { error } = await supabase.from("Submission").select("id").limit(1).maybeSingle();
      const tableMissing =
        error?.message?.includes("does not exist") ||
        error?.message?.includes("schema cache");
      const ok = !error || tableMissing;
      results.supabase = { configured: true, ok };
      if (error && !ok) results.supabase.error = error.message;
    } catch (err) {
      results.supabase = {
        configured: true,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  } else {
    results.supabase = {
      configured: false,
      error: "NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY not set",
    };
  }

  const allOk = results.supabase.configured && results.supabase.ok !== false;

  return NextResponse.json(
    {
      ok: allOk,
      supabase: results.supabase,
    },
    { status: allOk ? 200 : 503 }
  );
}
