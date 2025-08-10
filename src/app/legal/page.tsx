export default function LegalDeepDive() {
  return (
    <div className="px-6 py-20 max-w-5xl mx-auto text-gray-800">
      <h1 className="text-5xl font-bold mb-10 text-blue-800 text-center">
        The Legal Framework of HomeDAQ
      </h1>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-4 text-blue-700">
          Property-Specific LLC Formation
        </h2>
        <p className="text-lg">
          Each home listed through HomeDAQ is placed into a property-specific Limited Liability Company (LLC). This structure provides legal clarity and separation of ownership, allowing multiple parties to hold equity while the resident maintains operational control. HomeDAQ handles all necessary filings, EIN creation, and operating agreement generation.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-4 text-blue-700">
          Equity Share Offering & Agreements
        </h2>
        <p className="text-lg">
          Residents propose an equity percentage to offer to the public. These shares are structured as membership interests in the LLC. Investors sign legally binding agreements outlining share rights, transfer restrictions, and buyback terms. All documentation is stored securely and made available through the HomeDAQ platform.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-4 text-blue-700">
          Investor Protection Measures
        </h2>
        <p className="text-lg">
          HomeDAQ enforces governance policies for LLCs that protect investors, including restrictions on excessive leverage, requirements for property upkeep, and regular financial disclosures. In the event of resident default, investors retain proportional rights as defined in the LLC agreement.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-4 text-blue-700">
          Resident Rights and Responsibilities
        </h2>
        <p className="text-lg">
          Residents retain full living rights and control over the home, but must abide by maintenance and insurance requirements. Buyback mechanisms are clearly defined and residents can repurchase shares at pre-agreed valuations, subject to timing and liquidity.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-4 text-blue-700">
          Regulatory Compliance
        </h2>
        <p className="text-lg">
          HomeDAQ partners with legal and compliance experts to ensure all offerings comply with SEC regulations, particularly Regulation D and Regulation CF exemptions. Disclosures and accreditation checks are performed as required.
        </p>
      </section>

      <div className="text-center mt-20">
        <a
          href="/resident/create"
          className="bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-800 transition"
        >
          Begin Your Pitch
        </a>
      </div>
    </div>
  );
}
