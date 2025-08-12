'use client';

import Link from 'next/link';
import Image from 'next/image';
import Section from '@/components/ui/Section';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ResidentsLanding() {
  return (
    <>
      {/* HERO */}
      <div className="relative overflow-hidden">
        <Section className="relative z-10 max-w-6xl mx-auto py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center rounded-full bg-brand-50 text-brand-700 px-3 py-1 text-xs mb-4 border border-brand-100">
                For residents
              </span>
              <h1 className="text-4xl sm:text-5xl font-semibold leading-tight">
                Raise funds without a mortgage. <span className="text-brand-600">Keep ownership optionality.</span>
              </h1>
              <p className="mt-4 text-ink-700 max-w-xl">
                Create a simple pitch, choose your terms, and connect with aligned investors. Pay a monthly
                occupancy fee (dividend) instead of interest, and buy investors out over time.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/resident/create">
                  <Button>Start Your Pitch</Button>
                </Link>
                <Link href="/invest">
                  <Button variant="secondary">See Active Listings</Button>
                </Link>
              </div>
              <p className="mt-3 text-xs text-ink-500">
                HomeDAQ handles the admin and dispute mediation so you can stay focused on your home.
              </p>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-xl ring-1 ring-ink-100">
                <Image
                  src="/hero/homedaq-hero.jpg"
                  alt="Neighbors investing together"
                  width={1200}
                  height={800}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* VALUE PROPS */}
      <Section className="max-w-6xl mx-auto py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <Card><CardBody className="p-6">
            <div className="text-sm font-medium text-brand-700 mb-1">Simple</div>
            <h3 className="text-lg font-semibold">Create a pitch in minutes</h3>
            <p className="mt-2 text-ink-700">Address, photos, your plan, and the terms you want. We guide you.</p>
          </CardBody></Card>
          <Card><CardBody className="p-6">
            <div className="text-sm font-medium text-brand-700 mb-1">Flexible</div>
            <h3 className="text-lg font-semibold">Choose your own terms</h3>
            <p className="mt-2 text-ink-700">Set equity offered, minimum investment, and monthly dividend.</p>
          </CardBody></Card>
          <Card><CardBody className="p-6">
            <div className="text-sm font-medium text-brand-700 mb-1">Supported</div>
            <h3 className="text-lg font-semibold">We handle the admin</h3>
            <p className="mt-2 text-ink-700">LLC formation, cap table, payouts, and mediation—done for you.</p>
          </CardBody></Card>
        </div>
      </Section>

      {/* CTA */}
      <Section className="max-w-6xl mx-auto py-12">
        <div className="rounded-3xl bg-gradient-to-r from-brand-500 to-brand-600 text-white p-8 sm:p-10 shadow-md">
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-2xl font-semibold">Ready to publish your pitch?</h3>
              <p className="mt-2 text-white/90">Design terms that attract the right investors for your situation.</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-start lg:justify-end">
              <Link href="/resident/create">
                <Button>Start a Pitch</Button>
              </Link>
              <Link href="/resident/offer-designer">
                <Button variant="secondary">Open Offer Designer</Button>
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
