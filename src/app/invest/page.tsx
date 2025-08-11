"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Section, { SectionContainer, SectionTitle } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getPitches, type Pitch } from "@/lib/storage";

export default function InvestPage() {
  const [pitches, setPitches] = useState<Pitch[]>([]);

  useEffect(() => {
    setPitches(getPitches().reverse());
  }, []);

  return (
    <div>
      <Section>
        <SectionContainer>
          <SectionTitle>Browse Listings</SectionTitle>

          {pitches.length === 0 ? (
            <Card>
              <CardBody>
                <div className="text-center">
                  <p className="text-ink-700">
                    No resident pitches yet. Be the first to start one!
                  </p>
                  <div className="mt-4">
                    <Button as="link" href="/resident/create">Start a Pitch</Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pitches.map((p) => (
                <Card key={p.id} className="overflow-hidden">
                  {p.photos?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.photos[0]}
                      alt="Home"
                      className="w-full h-44 object-cover"
                    />
                  )}
                  <CardBody>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-ink-800">
                          {p.address}{p.city ? `, ${p.city}` : ""}
                        </h3>
                        <p className="text-sm text-ink-500 mt-1">
                          Est. Value: ${p.estimatedValue ?? "—"} • Equity Offered: {p.equityPercent ?? "—"}%
                        </p>
                      </div>
                    </div>

                    {p.personalStory && (
                      <p className="text-ink-700 text-sm mt-3 line-clamp-3">
                        {p.personalStory}
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-2">
                      {p.zillowLink && (
                        <a className="text-sm text-brand-700 hover:underline" href={p.zillowLink} target="_blank" rel="noreferrer">
                          Zillow
                        </a>
                      )}
                      {p.mlsLink && (
                        <a className="text-sm text-brand-700 hover:underline" href={p.mlsLink} target="_blank" rel="noreferrer">
                          MLS
                        </a>
                      )}
                    </div>

                    <div className="mt-5 flex gap-2">
                      <Button variant="secondary" as="link" href={`/resident/dashboard`}>View Details</Button>
                      <Button as="link" href={`/invest`}>Invest</Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </SectionContainer>
      </Section>
    </div>
  );
}
