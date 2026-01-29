import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: {
    database: { ok: boolean; error?: string };
    supabase: { configured: boolean; ok?: boolean; error?: string };
  } = {
    database: { ok: false },
    supabase: { configured: !!supabase },
  };

  // Test database (Prisma / Postgres)
  if (process.env.DATABASE_URL) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      results.database = { ok: true };
    } catch (err) {
      results.database = {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  } else {
    results.database = { ok: false, error: "DATABASE_URL not set" };
  }

  // Test Supabase (client exists and can reach the project)
  if (supabase) {
    try {
      const { error } = await supabase.from("_connection_test_").select("id").limit(1).maybeSingle();
      // Reaching Supabase = success. "Table not found" / "schema cache" means we're connected.
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

  const allOk =
    results.database.ok &&
    (results.supabase.configured ? results.supabase.ok !== false : true);

  return NextResponse.json(
    {
      ok: allOk,
      database: results.database,
      supabase: results.supabase,
    },
    { status: allOk ? 200 : 503 }
  );
}
