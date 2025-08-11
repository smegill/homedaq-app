import { ReactNode } from "react";

export default function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`py-16 ${className}`}>{children}</section>;
}

export function SectionContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`max-w-container mx-auto px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function SectionTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-800 text-center mb-8 ${className}`}>
      {children}
    </h2>
  );
}
