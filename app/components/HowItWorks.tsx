'use client';

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Log In & Shop',
      description: 'Browse verified coupons, pick your favorite deal, and shop at top stores.',
    },
    {
      number: 2,
      title: 'Get Rewards',
      description: 'Cashback rewards are added to your wallet automatically after purchase.',
    },
    {
      number: 3,
      title: 'Withdraw Cashback',
      description: 'Transfer earnings to your bank, voucher, or recharge — fast and secure.',
    },
  ];

  const stats = [
    { value: '6.3k+', label: 'Trusted Stores' },
    { value: '120k+', label: 'Active Coupons' },
    { value: '98%', label: 'Verified Deals' },
    { value: '24/7', label: 'Support' },
  ];

  return (
    <>
      {/* Dark benefits band — like Kettle & Fire icon row */}
      <section className="section-dark py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="section-eyebrow">Why Choose Us</span>
            <h2 className="section-title text-3xl md:text-4xl mt-4">Save More in 3 Simple Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="icon-circle-cyan mx-auto mb-4 text-lg font-extrabold">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-white/75 leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="/coupons" className="btn-cta px-8 py-3 text-sm uppercase tracking-wide">
              Shop Best Deals
            </a>
          </div>
        </div>
      </section>

      {/* Light stats row */}
      <section className="section-cream py-12 section-divider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-[var(--border-subtle)] rounded-2xl p-6 text-center shadow-sm"
              >
                <p className="text-2xl md:text-3xl font-extrabold text-brand-navy">{stat.value}</p>
                <p className="text-sm font-semibold text-brand-accent mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
