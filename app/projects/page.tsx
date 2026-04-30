import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { USER_ID } from "@/lib/db";

export const dynamic = "force-dynamic";

type ProjectRow = {
  id: string;
  title: string;
  state: { description?: string } | null;
  status: "active" | "paused" | "done";
  created_at: string;
};

export default async function ProjectsPage() {
  const supa = getSupabaseAdmin();

  const { data: project } = await supa
    .from("projects")
    .select("id, title, state, status, created_at")
    .eq("user_id", USER_ID)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle<ProjectRow>();

  return (
    <main className="flex flex-1 justify-center px-6 py-10">
      <div className="w-full max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              AI Daily Training
            </span>
            <h1 className="text-2xl font-medium tracking-tight">Projects</h1>
          </div>
          <Link
            href="/"
            className="text-sm text-neutral-500 transition hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Home
          </Link>
        </header>

        {project ? (
          <article className="flex flex-col gap-4 rounded-md border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-medium tracking-tight">
                {project.title}
              </h2>
              <span className="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
                {project.status}
              </span>
            </div>
            {project.state?.description && (
              <p className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                {project.state.description}
              </p>
            )}
            <p className="text-xs text-neutral-500">
              Started {new Date(project.created_at).toLocaleDateString()}
            </p>
          </article>
        ) : (
          <section className="flex flex-col gap-6">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              No active project.
            </p>
            <form
              action="/api/projects"
              method="post"
              className="flex flex-col gap-4 rounded-md border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="title"
                  className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-500"
                >
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  maxLength={120}
                  placeholder="What are you building?"
                  className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="description"
                  className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-500"
                >
                  Description <span className="lowercase opacity-60">(optional)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  maxLength={1000}
                  placeholder="What outcome are you working toward?"
                  className="resize-y rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100"
                />
              </div>

              <button
                type="submit"
                className="self-start rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-neutral-50 transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
              >
                Start Project
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
