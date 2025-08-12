import * as React from "react";

type SectionTag = "section" | "div" | "article";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Render as a different semantic tag while keeping the same styles */
  as?: SectionTag;
  className?: string;
  children: React.ReactNode;
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function Section({
  as = "section",
  className,
  children,
  ...props
}: SectionProps) {
  // Use ElementType to avoid JSX namespace typing issues in some TS configs
  const Tag: React.ElementType = as;
  return (
    <Tag className={cx("px-4 sm:px-6", className)} {...props}>
      {children}
    </Tag>
  );
}
