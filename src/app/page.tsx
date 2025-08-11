"use client";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Section, { SectionContainer, SectionTitle } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { getPitches, Pitch } from "@/lib/storage";

export default function Home() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  useEffect(() => { setPitches(getPitches().slice(-3).reverse()); }, []);

  return (
    <div>
      {/* Hero (keep your working hero or this simple gradient) */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-indigo-600 to-sky-500" />
        <SectionContainer>
          <div className="relative py-24 sm:py-32 text-center text-white">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight">Skip the banks. Build equity together.</h1>
            <p className="mt-4 text-lg sm:text-xl/relaxed max-w-2xl mx-auto opacity-95">
              HomeDAQ lets residents fund home purchases by offering equity instead of taking on a mortgage.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button as="link" href="/resident/create">Start Your Pitch</Button>
              <Button variant="secondary" as="link" href="/invest">Browse Listings</Button>
            </div>
          </div>
        </SectionContainer>
      </section>

      <Section>
        <SectionContainer>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              ["Equity, not debt", "Form a property-specific LLC, offer shares, and buy back equity over time."],
              ["Investor-friendly", "Investors gain transparent residential exposure without becoming landlords."],
              ["Path to full ownership", "Repurchase shares at your pace and convert to full title at 100%."],
            ].map(([title, body]) => (
              <Card key={title as string}>
                <CardBody>
                  <h3 className="text-lg font-semibold text-brand-700 mb-2">{title}</h3>
                  <p className="text-ink-700">{body}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </SectionContainer>
      </Section>
    </div>
  );
}
