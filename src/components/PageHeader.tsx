import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-5 animate-rise">
      <div className="flex flex-col gap-4 border-b border-slate-200/85 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-sage-700">
            {eyebrow}
          </p>
          <h1 className="text-balance text-[2rem] font-semibold leading-tight tracking-tight text-ink-900 sm:text-[2.2rem]">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-[15px]">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
