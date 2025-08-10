"use client";

import { useEffect, useState } from "react";
import { getPitches, deletePitch, Pitch } from "@/lib/storage";

export default function ResidentDashboard() {
  const [pitches, setPitches] = useState<Pitch[]>([]);

  useEffect(() => {
    setPitches(getPitches());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Delete this pitch?")) {
      deletePitch(id);
      setPitches(getPitches());
    }
  };

  return (
    <>
      <section className="section text-center">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900">
          Your Pitches
        </h1>
        <p className="mt-3 text-gray-600">Manage, edit, or remove your submissions.</p>
      </section>

      <section className="section">
        {pitches.length === 0 ? (
          <p className="text-center text-gray-600">No pitches yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pitches.map((pitch) => (
              <div key={pitch.id} className="card">
                <div className="card-pad">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {pitch.address}, {pitch.city}
                      </h2>
                      <p className="text-sm text-gray-500">
                        ${pitch.estimatedValue} • {pitch.equityPercent}% equity
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(pitch.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-gray-700 text-sm mt-3">
                    {pitch.personalStory.substring(0, 140)}...
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
