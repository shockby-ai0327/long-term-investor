import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-4">
      <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">
            {eyebrow}
          </p>
          <h1 className="mt-1.5 text-balance text-[1.6rem] font-semibold leading-tight tracking-tight text-ink-900 sm:text-[1.82rem]">
            {title}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2 lg:justify-end">{actions}</div> : null}
      </div>
    </header>
  );
}
