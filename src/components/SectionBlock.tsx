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
    <section className={`panel px-5 py-5 ${className}`}>
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-200/80 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle ? <p className="mt-1.5 muted-copy max-w-2xl">{subtitle}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
