import React from "react";

type ButtonVariant = "primary" | "secondary";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = "primary", className, children, ...rest }: Props) {
  const classes = ["shell-button", variant === "secondary" ? "secondary" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

export default Button;
