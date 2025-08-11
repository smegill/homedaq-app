"use client";
import Link from "next/link";
import { ComponentProps, forwardRef } from "react";

type BaseProps = {
  variant?: "primary" | "secondary" | "ghost";
  as?: "button" | "a" | "link";
  href?: string;
  className?: string;
} & ComponentProps<"button">;

function classes(variant: BaseProps["variant"]) {
  const base =
    "inline-flex items-center justify-center rounded-pill font-semibold transition px-6 py-3";
  const map = {
    primary: `${base} bg-brand-600 text-white hover:bg-brand-700 shadow-soft`,
    secondary: `${base} bg-white text-brand-700 border border-brand-100 hover:bg-brand-50 shadow`,
    ghost: `${base} text-ink-700 hover:bg-black/5`,
  };
  return map[variant ?? "primary"];
}

const Button = forwardRef<HTMLButtonElement, BaseProps>(function Button(
  { variant = "primary", as = "button", href, className = "", ...props },
  ref
) {
  const cls = `${classes(variant)} ${className}`;

  if (as === "a" && href) {
    return (
      <a href={href} className={cls} {...(props as any)} />
    );
  }
  if (as === "link" && href) {
    return (
      <Link href={href} className={cls} {...(props as any)} />
    );
  }
  return <button ref={ref} className={cls} {...props} />;
});

export default Button;
