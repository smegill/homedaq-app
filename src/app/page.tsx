"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPitches, Pitch } from "@/lib/storage";

export default function HomePage() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  useEffect(() => { setPitches(getPitches().slice(-3).reverse()); }, []);

  return (
    <div className="overflow-x-hidden">
      {/* HERO */}
      <section className="hero">
        <div className="hero__bg" style={{ backgroundImage: "url('/hero/homedaq-hero.jpg')" }} />
        <div className="hero__overlay" />
        <div className="hero__content">
          <div className="container-app" style={{ textAlign: "center" }}>
            <h1 className="font-black" style={{ fontSize: "3.2rem", lineHeight: 1.05, textShadow: "0 8px 24px rgba(0,0,0,.35)" }}>
              Own Your Future
            </h1>
            <p style={{ margin: "14px auto 0", maxWidth: 760, fontSize: "1.15rem", opacity: .95 }}>
              HomeDAQ turns every home into a startup. Build equity. Share ownership.
            </p>
            <div style={{ marginTop: 26, display: "flex", gap: 14, justifyContent: "center" }}>
              <Link href="/resident/create" className="btn-primary">Start Your Pitch</Link>
              <Link href="/invest" className="btn-secondary">Browse Listings</Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section" style={{ paddingTop: "2.5rem" }}>
        <div className="container-app" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 24, textAlign: "center" }}>
          {[
            ["$4.2M", "Invested in equity homes"],
            ["1,200+", "Investors actively trading"],
            ["98%", "Resident satisfaction rate"],
          ].map(([stat, label]) => (
            <div key={label as string}>
              <div style={{ fontSize: "2.1rem", fontWeight: 900, color: "#1d4ed8" }}>{stat}</div>
              <div style={{ color: "#64748b", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* EDUCATION */}
      <section className="section" style={{ paddingTop: "2rem" }}>
        <h2 className="section-title">Understanding the HomeDAQ Journey</h2>
        <div className="container-app" style={{ display: "grid", gap: 16 }}>
          {[
            ["What is HomeDAQ?",
              "HomeDAQ lets prospective homeowners fund a purchase by selling fractional equity in a property-specific LLC instead of taking on mortgage debt."],
            ["How Does the Equity Model Work?",
              "Residents choose an equity portion to offer. Investors buy shares in the LLC. Residents can buy back shares over time to move toward full ownership."],
            ["Investor Benefits",
              "Transparent, resident-linked exposure to housing with potential yield and appreciation, without becoming a landlord."],
          ].map(([title, body]) => (
            <div key={title as string} className="card">
              <div className="card-pad">
                <h3 style={{ color: "#1d4ed8", fontWeight: 700, marginBottom: 6 }}>{title}</h3>
                <p style={{ color: "#374151" }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" style={{ paddingTop: "1.5rem" }}>
        <h2 className="section-title">How HomeDAQ Works</h2>
        <div className="container-app" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 16 }}>
          {[
            ["/icons/pitch.svg", "Create a Pitch", "Tell your story, set equity terms, upload photos."],
            ["/icons/llc.svg", "Form an LLC", "We generate your home-specific operating agreement."],
            ["/icons/share.svg", "Share Ownership", "Investors fund you for proportional equity."],
            ["/icons/buyback.svg", "Buy Back Over Time", "Reclaim shares at your pace toward full title."],
          ].map(([icon, title, desc]) => (
            <div key={title as string} className="card" style={{ textAlign: "center" }}>
              <div className="card-pad">
                <img src={icon as string} alt={title as string} style={{ width: 56, height: 56, margin: "0 auto 10px" }} />
                <h3 style={{ color: "#1d4ed8", fontWeight: 700 }}>{title}</h3>
                <p style={{ color: "#374151", fontSize: ".95rem", marginTop: 6 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PITCHES */}
      {pitches.length > 0 && (
        <section className="section" style={{ paddingTop: "1rem" }}>
          <h2 className="section-title">Featured Resident Pitches</h2>
          <div className="container-app" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 16 }}>
            {pitches.map((p) => (
              <div key={p.id} className="card" style={{ overflow: "hidden" }}>
                {p.photos?.[0] && (
                  <img src={p.photos[0]} alt="Home preview" style={{ width: "100%", height: 176, objectFit: "cover" }} />
                )}
                <div className="card-pad">
                  <h3 style={{ color: "#111827", fontWeight: 700 }}>{p.address}, {p.city}</h3>
                  <p style={{ color: "#64748b", fontSize: ".95rem" }}>${p.estimatedValue} • {p.equityPercent}% equity</p>
                  <p style={{ color: "#374151", fontSize: ".95rem", marginTop: 6 }}>{p.personalStory.slice(0, 90)}...</p>
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
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111827" }}>Turn Your Home Into a Shared Success</h2>
              <p style={{ color: "#64748b", marginTop: 6 }}>
                HomeDAQ empowers people who believe in their homes — and in themselves.
              </p>
              <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 12 }}>
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
