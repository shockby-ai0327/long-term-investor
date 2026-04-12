import type { ReactNode } from "react";

interface SectionBlockProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: "panel" | "plain";
  children: ReactNode;
}

export function SectionBlock({
  title,
  subtitle,
  action,
  className = "",
  contentClassName = "",
  variant = "panel",
  children
}: SectionBlockProps) {
  const shellClassName =
    variant === "plain"
      ? `border-t border-slate-200/80 pt-3.5 ${className}`
      : `panel px-4 py-4 sm:px-5 ${className}`;

  return (
    <section className={shellClassName}>
      <div className="mb-3.5 flex flex-col gap-2 border-b border-slate-200/75 pb-2.5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle ? <p className="mt-1 max-w-2xl text-[11px] leading-5 text-slate-500">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
