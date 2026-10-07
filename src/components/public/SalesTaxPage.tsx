import React from 'react';
import { 
  Receipt, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  MapPin, 
  Layers, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  Server, 
  ShoppingBag, 
  Check, 
  Clock 
} from 'lucide-react';

interface SalesTaxPageProps {
  onStartFiling: () => void;
  onNavigate: (path: string) => void;
}

export function SalesTaxPage({ onStartFiling, onNavigate }: SalesTaxPageProps) {
  return (
    <div className="space-y-24 py-6">
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto text-center">
        <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-6">
          Autonomous Multi-State Sales & Use Tax
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-5xl mx-auto leading-tight">
          Sales tax compliance without the manual spreadsheets.
        </h1>
        <p className="text-lg text-neutral-700 max-w-3xl mx-auto mt-6 font-normal">
          From Wayfair economic nexus tracking to product taxability rules across 12,000+ U.S. jurisdictions and automated return filing.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={onStartFiling}
            className="px-8 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-lg flex items-center gap-2"
          >
            <span>Connect Store & Track Nexus</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* SECTION 2: WHAT TAXOS AUTOMATES */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <Globe className="w-6 h-6 text-forest-700" />
            <h3 className="font-bold text-sm text-forest-950">Continuous Nexus Monitoring</h3>
            <p className="text-neutral-600">Real-time alerts as your e-commerce sales approach economic nexus thresholds in any state.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <Receipt className="w-6 h-6 text-forest-700" />
            <h3 className="font-bold text-sm text-forest-950">Rooftop Tax Calculation</h3>
            <p className="text-neutral-600">Exact geo-located rate lookup accounting for state, county, municipal, and special transit district rates.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <Calendar className="w-6 h-6 text-forest-700" />
            <h3 className="font-bold text-sm text-forest-950">Automated Remittance & Filing</h3>
            <p className="text-neutral-600">Prepares and files monthly, quarterly, and annual sales tax returns directly with state revenue departments.</p>
          </div>
        </div>
      </section>

      {/* SECTION 3: NEXUS DETECTION (WAYFAIR) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">South Dakota v. Wayfair</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight mt-2">
              Economic & physical nexus intelligence.
            </h2>
            <p className="text-sm text-neutral-700 mt-3 leading-relaxed">
              States enforce economic nexus once your gross sales exceed specific dollar amounts (typically $100,000) or order counts (typically 200 orders). TaxOS monitors every state ledger, warning you before obligations are triggered.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-sage-50 border border-sage-200 text-xs space-y-3">
            <div>
              <div className="flex justify-between font-bold text-forest-950 mb-1">
                <span>California Nexus Threshold ($500,000)</span>
                <span>$412,000 (82.4%)</span>
              </div>
              <div className="w-full bg-sage-200 h-2 rounded-full overflow-hidden">
                <div className="bg-forest-700 h-2 rounded-full w-[82.4%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between font-bold text-forest-950 mb-1">
                <span>New York Nexus Threshold ($500,000 + 100 tx)</span>
                <span>Active Obligation (Nexus Met)</span>
              </div>
              <div className="w-full bg-sage-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: STATE REGISTRATIONS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-100 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3">
          <h3 className="text-xl font-bold text-forest-950">Automated Sales Tax Permit Registration</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            When nexus is reached, TaxOS prepares the exact state permit registration forms (e.g., California CDTFA-401, Texas Comptroller application) so you are authorized before collecting tax.
          </p>
        </div>
      </section>

      {/* SECTION 5: PRODUCT & SERVICE TAXABILITY */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-6 rounded-2xl bg-white border border-sage-300">
            <h4 className="font-bold text-forest-950 text-sm">SaaS & Digital Goods</h4>
            <p className="text-neutral-600 mt-2">Differentiating between taxable states (NY, PA, WA) and non-taxable software states (CA, FL, NV).</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300">
            <h4 className="font-bold text-forest-950 text-sm">Professional Services</h4>
            <p className="text-neutral-600 mt-2">Classifying consulting, engineering, and creative services that are exempt from general sales tax.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300">
            <h4 className="font-bold text-forest-950 text-sm">Physical Goods & Freight</h4>
            <p className="text-neutral-600 mt-2">Handling shipping taxability rules, drop-shipping exemptions, and clothing exemptions (e.g., MA $175 threshold).</p>
          </div>
        </div>
      </section>

      {/* SECTION 6: SOURCING RULES */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-white border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
          <h3 className="text-xl font-bold text-forest-950">Origin-Based vs. Destination-Based Sourcing</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Most states follow destination sourcing (taxed where the customer receives the goods), while states like Texas and California use hybrid or origin rules for local rates. TaxOS automatically routes transaction addresses accordingly.
          </p>
        </div>
      </section>

      {/* SECTION 7: 12,000+ JURISDICTIONS */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <MapPin className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Rooftop Geographic Precision</h3>
          <p className="text-sm text-neutral-600">
            ZIP codes are not tax jurisdictions. TaxOS uses 9-digit ZIP and street-level rooftop geocoding to prevent under-collecting or over-collecting sales tax.
          </p>
        </div>
      </section>

      {/* SECTION 8: MARKETPLACE FACILITATORS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-forest-950 text-white border border-forest-900 max-w-4xl mx-auto space-y-3">
          <ShoppingBag className="w-6 h-6 text-lime-400" />
          <h3 className="text-xl font-bold text-white">Marketplace Facilitator Reconciliation</h3>
          <p className="text-sm text-sage-200 leading-relaxed">
            Selling on Amazon, Shopify Marketplace, or Etsy? Those platforms remit tax on your behalf. TaxOS separates marketplace-facilitated sales from direct-to-consumer store orders, preventing duplicate payments.
          </p>
        </div>
      </section>

      {/* SECTION 9: SALES-CHANNEL INTEGRATIONS */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <Server className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Direct E-Commerce Ingestion</h3>
          <p className="text-sm text-neutral-600">
            Connect Shopify, WooCommerce, Stripe, BigCommerce, Amazon Seller Central, and custom billing APIs.
          </p>
        </div>
      </section>

      {/* SECTION 10: RECONCILIATION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-50 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3 text-xs">
          <strong className="text-sm font-bold text-forest-950 block">Audit-Proof Reconciliation Engine</strong>
          <p className="text-neutral-700">
            TaxOS cross-references tax collected in your general ledger against statutory rates, flagging discrepancies before returns are submitted to state departments of revenue.
          </p>
        </div>
      </section>

      {/* SECTION 11: FILING CALENDAR */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
          <Calendar className="w-6 h-6 text-forest-700" />
          <h3 className="text-xl font-bold text-forest-950">Automated Filing Calendar</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Tracks monthly (typically 20th), quarterly, and annual filing schedules across every state where you maintain an active sales tax permit.
          </p>
        </div>
      </section>

      {/* SECTION 12: HUMAN SALES TAX REVIEWER */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <ShieldCheck className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Specialized Sales Tax Reviewers</h3>
          <p className="text-sm text-neutral-600">
            High-volume filings and nexus registrations are inspected by dedicated sales tax practitioners before electronic submission.
          </p>
        </div>
      </section>

      {/* SECTION 13: STATE NOTICES & AUDITS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs max-w-4xl mx-auto text-xs text-neutral-700 space-y-2">
          <div className="flex items-center gap-2 font-bold text-forest-950 text-sm">
            <AlertTriangle className="w-4 h-4 text-forest-700" />
            <span>State Tax Notice Defense & Resolution</span>
          </div>
          <p>
            Received an assessment notice or audit request from a state revenue department? TaxOS ingests the notice, analyzes the discrepancy, and provides verifiable transaction logs to defend your position.
          </p>
        </div>
      </section>

      {/* SECTION 14: CTA */}
      <section className="max-w-7xl mx-auto px-6 text-center pt-8">
        <button
          onClick={onStartFiling}
          className="px-10 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-xl inline-flex items-center gap-2"
        >
          <span>Automate Sales Tax with TaxOS</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>

    </div>
  );
}
