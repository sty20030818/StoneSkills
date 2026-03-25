import type { PropsWithChildren, ReactNode } from "react";

interface PageScaffoldProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageScaffold({
  eyebrow,
  title,
  description,
  actions,
  children,
}: PageScaffoldProps) {
  return (
    <div className="page-stack">
      <section className="page-hero">
        <div className="page-hero__eyebrow">{eyebrow}</div>
        <div className="page-hero__heading">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {actions ? <div className="page-hero__actions">{actions}</div> : null}
      </section>
      {children}
    </div>
  );
}
