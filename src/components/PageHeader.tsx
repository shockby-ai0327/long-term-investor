import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  details?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  variant?: "default" | "research";
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  details,
  actions,
  aside,
  variant = "default",
  className = ""
}: PageHeaderProps) {
  if (variant === "research") {
    return (
      <header className={`panel px-4 py-4 sm:px-5 ${className}`}>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              {eyebrow}
            </p>
            <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-balance break-words text-[1.65rem] font-semibold leading-tight tracking-[-0.03em] text-ink-900 sm:text-[2.15rem]">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                ) : null}
              </div>
              {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
            </div>

            {meta ? (
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200/80 pt-3 text-xs text-slate-500">
                {meta}
              </div>
            ) : null}

            {details ? <div className="mt-4">{details}</div> : null}
          </div>

          {aside ? (
            <div className="border-t border-slate-200/80 pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
              {aside}
            </div>
          ) : null}
        </div>
      </header>
    );
  }

  return (
    <header className={`mb-4 ${className}`}>
      <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">
            {eyebrow}
          </p>
          <h1 className="mt-1.5 text-balance text-[1.6rem] font-semibold leading-tight tracking-tight text-ink-900 sm:text-[1.82rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          ) : null}
          {meta ? <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">{meta}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2 lg:justify-end">{actions}</div> : null}
      </div>
    </header>
  );
}
