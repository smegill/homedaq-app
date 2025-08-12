import Section from "@/components/ui/Section";

export default function DisclosureBar() {
  return (
    <div className="bg-ink-50 border-b border-ink-100">
      <Section className="max-w-6xl mx-auto py-2">
        <p className="text-[12px] leading-snug text-ink-600">
          HomeDAQ connects residents with accredited investors. Securities (if any) are offered by our
          partner broker-dealer. HomeDAQ is not a broker, dealer, investment adviser, or custodian.
        </p>
      </Section>
    </div>
  );
}
