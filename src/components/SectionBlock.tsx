import type { ReactNode } from "react";

interface SectionBlockProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function SectionBlock({
  title,
  subtitle,
  action,
  className = "",
  children
}: SectionBlockProps) {
  return (
    <section className={`panel px-4 py-4 sm:px-5 ${className}`}>
      <div className="mb-3 flex flex-col gap-2.5 border-b border-slate-200/75 pb-2.5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle ? <p className="mt-1 muted-copy max-w-2xl">{subtitle}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
