import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Copy, Check, ArrowRight, ShieldCheck, Flame, Wrench } from 'lucide-react';
import { useToast } from '../../components/common/Toast';

const offers = [
  {
    code: 'MLA20',
    title: 'Flat 20% Off Leather Match Bats',
    description: 'Save 20% on all handcrafted Grade-1 Kashmir Willow leather cricket bats.',
    validity: 'Valid on orders over ₹2,499',
    type: 'DISCOUNT CODE',
  },
  {
    code: 'TENNIS15',
    title: '15% Off Heavy Tennis Willow Bats',
    description: 'Get an instant 15% discount on all scooped power tennis and tape-ball cricket bats.',
    validity: 'No minimum order required',
    type: 'DISCOUNT CODE',
  },
  {
    code: 'FREEKNOCK',
    title: 'Complimentary Oiling & Knocking',
    description: 'Receive 5,000+ machine knocks and linseed oiling with raw linseed oil completely free.',
    validity: 'Free with any bat purchase',
    type: 'SERVICE PERK',
  },
];

const OffersSection = () => {
  const toast = useToast();
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <section className="py-16 sm:py-20 bg-gray-900 text-white relative" id="offers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            Seasonal Store Offers
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Special Bat Offers &amp; Perks
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Apply these coupon codes at checkout or mention them in-store to claim your discounts and free bat preparation services.
          </p>
        </div>

        {/* Clean Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {offers.map((offer) => (
            <div
              key={offer.code}
              className="rounded-2xl bg-gray-800/90 border border-gray-700/80 p-6 flex flex-col justify-between hover:border-gray-500 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 font-semibold mb-3">
                  <span className="text-red-400 font-bold tracking-wider">{offer.type}</span>
                  <span>{offer.validity}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{offer.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-6">{offer.description}</p>
              </div>

              {/* Copy Code Box */}
              <div className="flex items-center justify-between gap-3 bg-gray-900 border border-dashed border-gray-600 rounded-xl p-2.5">
                <div className="flex items-center gap-2 pl-2">
                  <Tag className="w-4 h-4 text-red-400" />
                  <span className="font-mono font-bold tracking-widest text-sm text-white">{offer.code}</span>
                </div>
                <button
                  onClick={() => handleCopy(offer.code)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  id={`copy-offer-${offer.code.toLowerCase()}`}
                >
                  {copiedCode === offer.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Clean Direct Callout */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gray-800/50 border border-gray-700 text-sm">
          <div className="flex items-center gap-3">
            <Wrench className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-gray-300">
              All leather cricket bats come oiled, knocked, and fitted with premium scuff sheet on request.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 font-bold whitespace-nowrap text-xs uppercase tracking-wider"
            id="offers-browse-bats"
          >
            Browse Cricket Bats &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
