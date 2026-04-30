import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { USER_ID } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();

  if (!title) {
    return new Response("Title is required", { status: 400 });
  }

  const supa = getSupabaseAdmin();

  const { data: existing } = await supa
    .from("projects")
    .select("id")
    .eq("user_id", USER_ID)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (existing) {
    return Response.redirect(new URL("/projects", request.url), 303);
  }

  const state = description ? { description } : null;

  const { error } = await supa.from("projects").insert({
    user_id: USER_ID,
    title,
    state,
    status: "active",
  });

  if (error) {
    return new Response(`Failed to create project: ${error.message}`, {
      status: 500,
    });
  }

  return Response.redirect(new URL("/projects", request.url), 303);
}
