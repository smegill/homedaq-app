"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Section, { SectionContainer, SectionTitle } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { savePitch } from "@/lib/storage";

export default function CreatePitchPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    address: "",
    city: "",
    estimatedValue: "",
    equityPercent: "",
    zillowLink: "",
    mlsLink: "",
    personalStory: "",
    aboutYou: "",
    family: "",
    photos: [] as string[],
  });

  function update<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function addPhoto(url: string) {
    if (!url) return;
    setForm((f) => ({ ...f, photos: [...f.photos, url] }));
  }

  function removePhoto(idx: number) {
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Basic validation
    if (!form.address) return alert("Please enter the property address.");
    const payload: any = {
      ...form,
      estimatedValue: Number(form.estimatedValue || 0),
      equityPercent: Number(form.equityPercent || 0),
      createdAt: Date.now(),
    };
    savePitch(payload);
    router.push("/resident/dashboard");
  }

  return (
    <Section>
      <SectionContainer>
        <SectionTitle>Create Your Pitch</SectionTitle>
        <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-2 grid gap-6">

            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-brand-700 mb-3">Property</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Address</label>
                    <input
                      className="input"
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <label className="label">City</label>
                    <input
                      className="input"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      placeholder="Austin"
                    />
                  </div>
                  <div>
                    <label className="label">Estimated Value (USD)</label>
                    <input
                      className="input"
                      type="number"
                      value={form.estimatedValue}
                      onChange={(e) => update("estimatedValue", e.target.value)}
                      placeholder="400000"
                    />
                  </div>
                  <div>
                    <label className="label">Equity Offered (%)</label>
                    <input
                      className="input"
                      type="number"
                      value={form.equityPercent}
                      onChange={(e) => update("equityPercent", e.target.value)}
                      placeholder="15"
                    />
                  </div>
                  <div>
                    <label className="label">Zillow Link (optional)</label>
                    <input
                      className="input"
                      value={form.zillowLink}
                      onChange={(e) => update("zillowLink", e.target.value)}
                      placeholder="https://www.zillow.com/homedetails/..."
                    />
                  </div>
                  <div>
                    <label className="label">MLS Link (optional)</label>
                    <input
                      className="input"
                      value={form.mlsLink}
                      onChange={(e) => update("mlsLink", e.target.value)}
                      placeholder="https://www.mls.com/listing/..."
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-brand-700 mb-3">Your Pitch & Goals</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="label">Your Story / Improvements Plan</label>
                    <textarea
                      className="input"
                      rows={5}
                      value={form.personalStory}
                      onChange={(e) => update("personalStory", e.target.value)}
                      placeholder="Tell investors why this home, what you’ll improve, and what success looks like."
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">About You</label>
                      <textarea
                        className="input"
                        rows={4}
                        value={form.aboutYou}
                        onChange={(e) => update("aboutYou", e.target.value)}
                        placeholder="Background, work, interests..."
                      />
                    </div>
                    <div>
                      <label className="label">Family / Household</label>
                      <textarea
                        className="input"
                        rows={4}
                        value={form.family}
                        onChange={(e) => update("family", e.target.value)}
                        placeholder="Who will live here? Any special needs?"
                      />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-brand-700 mb-3">Photos</h3>
                <div className="grid gap-3">
                  <div className="flex gap-2">
                    <input
                      className="input flex-1"
                      placeholder="Paste image URL and click Add"
                      onKeyDown={(e) => {
                        const target = e.target as HTMLInputElement;
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addPhoto(target.value.trim());
                          target.value = "";
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        const el = document.querySelector<HTMLInputElement>("input[placeholder^='Paste image URL']");
                        if (el && el.value.trim()) {
                          addPhoto(el.value.trim());
                          el.value = "";
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>

                  {form.photos.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {form.photos.map((url, i) => (
                        <div key={i} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="Home" className="w-full h-40 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right column - sticky summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-ink-800 mb-3">Summary</h3>
                <ul className="text-sm text-ink-700 space-y-2">
                  <li><strong>Address:</strong> {form.address || "—"}</li>
                  <li><strong>City:</strong> {form.city || "—"}</li>
                  <li><strong>Est. Value:</strong> {form.estimatedValue || "—"}</li>
                  <li><strong>Equity Offered:</strong> {form.equityPercent || "—"}%</li>
                  <li><strong>Photos:</strong> {form.photos.length}</li>
                </ul>
                <div className="mt-5 flex gap-2">
                  <Button type="submit">Submit Pitch</Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => history.back()}
                  >
                    Cancel
                  </Button>
                </div>
                <p className="text-xs text-ink-500 mt-3">
                  By submitting, you agree your information may be reviewed by potential investors.
                </p>
              </CardBody>
            </Card>
          </div>
        </form>
      </SectionContainer>
    </Section>
  );
}
