import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  action?: React.ReactNode;
};

function mergeClasses(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function Card({ title, action, className, children, ...rest }: CardProps) {
  return (
    <section className={mergeClasses("shell-card", className)} {...rest}>
      {(title || action) && (
        <header className="shell-card-header">
          {title && <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export default Card;
