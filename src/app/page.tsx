"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPitches, Pitch } from "@/lib/storage";

export default function HomePage() {
  const [pitches, setPitches] = useState<Pitch[]>([]);

  useEffect(() => {
    setPitches(getPitches().slice(-3).reverse());
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* HERO (full-bleed, tall, readable) */}
      <section
        className="relative text-white"
        style={{
          backgroundImage: "url('/hero/homedaq-hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* dark overlay for contrast */}
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.55)" }} />
        {/* content */}
        <div className="relative container-app" style={{ minHeight: "520px", paddingTop: "96px", paddingBottom: "72px" }}>
          <div className="flex flex-col items-center text-center">
            <h1 className="font-black tracking-tight" style={{ fontSize: "3rem", lineHeight: 1.1 }}>
              Own Your Future
            </h1>
            <p className="mt-4" style={{ maxWidth: 720, fontSize: "1.25rem", opacity: 0.95 }}>
              HomeDAQ turns every home into a startup. Build equity. Share ownership.
            </p>
            <div className="mt-8 flex items-center gap-10">
              <Link href="/resident/create" className="btn-primary">Start Your Pitch</Link>
              <Link href="/invest" className="btn-secondary">Browse Listings</Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section">
        <div className="container-app">
          <div className="grid text-center" style={{ gap: "1.75rem", gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
            {[
              ["$4.2M", "Invested in equity homes"],
              ["1,200+", "Investors actively trading"],
              ["98%", "Resident satisfaction rate"],
            ].map(([stat, label]) => (
              <div key={label.toString()}>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#1d4ed8" }}>{stat}</div>
                <div className="mt-1" style={{ color: "#64748b" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EDUCATION */}
      <section className="section">
        <h2 className="section-title">Understanding the HomeDAQ Journey</h2>
        <div className="container-app grid" style={{ gap: "1.25rem" }}>
          <div className="card"><div className="card-pad">
            <h3 className="text-xl font-semibold" style={{ color: "#1d4ed8", marginBottom: ".5rem" }}>What is HomeDAQ?</h3>
            <p className="text-gray-700">
              HomeDAQ lets prospective homeowners fund a purchase by selling fractional equity
              in a property-specific LLC instead of taking on mortgage debt.
            </p>
          </div></div>
          <div className="card"><div className="card-pad">
            <h3 className="text-xl font-semibold" style={{ color: "#1d4ed8", marginBottom: ".5rem" }}>How Does the Equity Model Work?</h3>
            <p className="text-gray-700">
              Residents choose an equity portion to offer. Investors buy shares in the LLC.
              Residents can buy back shares over time to move toward full ownership.
            </p>
          </div></div>
          <div className="card"><div className="card-pad">
            <h3 className="text-xl font-semibold" style={{ color: "#1d4ed8", marginBottom: ".5rem" }}>Investor Benefits</h3>
            <p className="text-gray-700">
              Transparent, resident-linked exposure to housing with potential yield and appreciation,
              without becoming a landlord.
            </p>
          </div></div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <h2 className="section-title">How HomeDAQ Works</h2>
        <div className="container-app grid" style={{ gap: "1.25rem", gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
          {[
            ["/icons/pitch.svg", "Create a Pitch", "Tell your story, set equity terms, upload photos."],
            ["/icons/llc.svg", "Form an LLC", "We generate your home-specific operating agreement."],
            ["/icons/share.svg", "Share Ownership", "Investors fund you for proportional equity."],
            ["/icons/buyback.svg", "Buy Back Over Time", "Reclaim shares at your pace toward full title."],
          ].map(([icon, title, desc]) => (
            <div key={title.toString()} className="card" style={{ textAlign: "center" }}>
              <div className="card-pad">
                <img src={icon as string} alt={title as string} style={{ width: 56, height: 56, margin: "0 auto .5rem auto" }} />
                <h3 className="text-lg font-semibold" style={{ color: "#1d4ed8" }}>{title}</h3>
                <p className="text-gray-700 text-sm mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PITCHES */}
      {pitches.length > 0 && (
        <section className="section">
          <h2 className="section-title">Featured Resident Pitches</h2>
          <div className="container-app grid" style={{ gap: "1.25rem", gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
            {pitches.map((pitch) => (
              <div key={pitch.id} className="card" style={{ overflow: "hidden" }}>
                {pitch.photos?.[0] && (
                  <img src={pitch.photos[0]} alt="Home preview" style={{ width: "100%", height: 176, objectFit: "cover" }} />
                )}
                <div className="card-pad">
                  <h3 className="font-semibold" style={{ color: "#111827" }}>
                    {pitch.address}, {pitch.city}
                  </h3>
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    ${pitch.estimatedValue} • {pitch.equityPercent}% equity
                  </p>
                  <p className="text-sm" style={{ color: "#374151", marginTop: ".5rem" }}>
                    {pitch.personalStory.slice(0, 90)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section">
        <div className="container-app">
          <div className="card">
            <div className="card-pad" style={{ textAlign: "center" }}>
              <h2 className="text-2xl font-bold" style={{ color: "#111827" }}>Turn Your Home Into a Shared Success</h2>
              <p className="mt-2" style={{ color: "#64748b" }}>
                HomeDAQ empowers people who believe in their homes — and in themselves.
              </p>
              <div className="mt-5" style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                <Link href="/resident/create" className="btn-primary">Launch Your Pitch</Link>
                <Link href="/legal" className="btn-secondary">Read the Legal Framework</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
