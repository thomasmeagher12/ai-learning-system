import Link from "next/link";

export type SessionListItem = {
  id: string;
  sessionNumber: number;
  topic: string | undefined;
  dateStr: string;
  href: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SessionList({ items }: { items: SessionListItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((s) => (
        <Link
          key={s.id}
          href={s.href}
          className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-4 py-3 transition hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Session {s.sessionNumber}
              {s.topic && (
                <span className="ml-2 font-normal text-neutral-500">
                  — {s.topic}
                </span>
              )}
            </span>
            <span className="text-xs text-neutral-500">
              {formatDate(s.dateStr)}
            </span>
          </div>
          <span className="text-xs text-neutral-400" aria-hidden>
            &rarr;
          </span>
        </Link>
      ))}
    </div>
  );
}
