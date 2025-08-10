"use client";

import { useEffect, useState } from "react";
import { getPitches, Pitch } from "@/lib/storage";

export default function InvestorBrowsePage() {
  const [pitches, setPitches] = useState<Pitch[]>([]);

  useEffect(() => {
    setPitches(getPitches());
  }, []);

  return (
    <>
      <section className="section text-center">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900">
          Browse Investment Opportunities
        </h1>
        <p className="mt-3 text-gray-600">
          Discover resident-led offerings and support equity-based homeownership.
        </p>
      </section>

      <section className="section">
        {pitches.length === 0 ? (
          <p className="text-center text-gray-600">No pitches found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pitches.map((pitch) => (
              <div key={pitch.id} className="card overflow-hidden">
                {pitch.photos?.[0] && (
                  <img
                    src={pitch.photos[0]}
                    alt="Property"
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="card-pad">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {pitch.address}, {pitch.city}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">
                    ${pitch.estimatedValue} • {pitch.equityPercent}% equity
                  </p>
                  <p className="text-sm text-gray-700">
                    {pitch.personalStory.slice(0, 110)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
