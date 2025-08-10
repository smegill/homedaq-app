"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import { savePitch } from "@/lib/storage";

export default function CreatePropertyPage() {
  const maxStep = 4;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    estimatedValue: "",
    equityPercent: "",
    zillowLink: "",
    photos: [] as File[],
    photoPreviews: [] as string[],
    personalStory: "",
    goals: "",
    buybackPlan: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3);
    const previews = files.map((file) => URL.createObjectURL(file));
    setForm((prev) => ({
      ...prev,
      photos: files,
      photoPreviews: previews,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const pitch = {
      ...form,
      id: uuidv4(),
      photos: form.photoPreviews,
    };
    savePitch(pitch);
    alert("Pitch submitted! Saved to your browser.");
    setStep(1);
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, maxStep));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <>
      <header className="section text-center">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900">
          Create Your Property Pitch
        </h1>
        <p className="mt-3 text-gray-600">
          Step {step} of {maxStep}
        </p>
      </header>

      <section className="section">
        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Step 1 */}
          {step === 1 && (
            <div className="card">
              <div className="card-pad grid gap-5">
                <h2 className="text-2xl font-bold text-blue-700">
                  Step 1: Property Details
                </h2>

                <div>
                  <label className="label">Address</label>
                  <input className="input" name="address" value={form.address} onChange={handleChange} required />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="label">City</label>
                    <input className="input" name="city" value={form.city} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="label">State</label>
                    <input className="input" name="state" value={form.state} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="label">ZIP Code</label>
                    <input className="input" name="zip" value={form.zip} onChange={handleChange} required />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Estimated Value ($)</label>
                    <input className="input" name="estimatedValue" value={form.estimatedValue} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="label">Your Equity %</label>
                    <input className="input" name="equityPercent" value={form.equityPercent} onChange={handleChange} required />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="card">
              <div className="card-pad grid gap-5">
                <h2 className="text-2xl font-bold text-blue-700">
                  Step 2: Zillow or MLS Link
                </h2>
                <div>
                  <label className="label">Listing URL</label>
                  <input
                    type="url"
                    className="input"
                    name="zillowLink"
                    value={form.zillowLink}
                    onChange={handleChange}
                    placeholder="https://zillow.com/..."
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="card">
              <div className="card-pad grid gap-5">
                <h2 className="text-2xl font-bold text-blue-700">
                  Step 3: Upload Photos
                </h2>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="block w-full text-sm text-gray-600"
                />
                <div className="flex gap-4 flex-wrap mt-2">
                  {form.photoPreviews.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      className="w-28 h-28 object-cover rounded shadow"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="card">
              <div className="card-pad grid gap-5">
                <h2 className="text-2xl font-bold text-blue-700">
                  Step 4: Tell Your Story
                </h2>

                <div>
                  <label className="label">Why this home matters</label>
                  <textarea
                    name="personalStory"
                    value={form.personalStory}
                    onChange={handleChange}
                    className="input min-h-[110px]"
                    placeholder="Tell investors why this home is special to you..."
                    required
                  />
                </div>

                <div>
                  <label className="label">Your goals for this property</label>
                  <textarea
                    name="goals"
                    value={form.goals}
                    onChange={handleChange}
                    className="input min-h-[110px]"
                    placeholder="Raising a family, multi-generational care, etc."
                    required
                  />
                </div>

                <div>
                  <label className="label">Your buyback plan</label>
                  <textarea
                    name="buybackPlan"
                    value={form.buybackPlan}
                    onChange={handleChange}
                    className="input min-h-[110px]"
                    placeholder="Monthly savings, increasing income, long-term refinance, etc."
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="btn-secondary">Back</button>
            ) : (
              <span />
            )}
            {step < maxStep ? (
              <button type="button" onClick={nextStep} className="btn-primary">Next</button>
            ) : (
              <button type="submit" className="btn-primary">Submit</button>
            )}
          </div>
        </form>
      </section>
    </>
  );
}
