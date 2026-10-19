import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Clock, Hammer, CheckCircle2, X } from 'lucide-react';

const batCategories = [
  {
    id: 'leather-bats',
    name: 'Leather Bats',
    subtitle: 'Grade 1 Handcrafted Kashmir Willow',
    image: '/bats/leather-bat-front.jpg',
    tag: 'Match Hardball',
    description: 'Pressed for explosive boundary power with 38-44mm thick edges and immaculate straight grains.',
    isComingSoon: false,
  },
  {
    id: 'tennis-bats',
    name: 'Tennis Bats',
    subtitle: 'Heavy & Light Tennis Scoop Willow',
    image: '/bats/tennis-bat-front.jpg',
    tag: 'Power Scoop',
    description: 'Ultra-light balance with deep aerodynamic rear scoops designed for tournament tennis ball cricket.',
    isComingSoon: false,
  },
  {
    id: 'pre-made-bats',
    name: 'Pre-Made Bats',
    subtitle: 'Ready to Play & Pre-Knocked',
    image: '/bats/kashmir-bat-front.jpg',
    tag: 'Pre-Oiled & Knocked',
    description: 'Fully seasoned, oiled, and machine-knocked bats ready to step straight onto the crease.',
    isComingSoon: false,
  },
  {
    id: 'customised-bat',
    name: 'Customised Bat',
    subtitle: 'Handcrafted To Your Exact Specs',
    image: '/bats/custom-bat-workshop.jpg',
    tag: 'COMING SOON',
    description: 'Tailor your willow cleft, blade curve, edge thickness, handle ovality, and custom laser name engraving.',
    isComingSoon: true,
  },
];

const CategoriesSection = () => {
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  const handleCustomBatClick = (e) => {
    e.preventDefault();
    setShowComingSoonModal(true);
  };

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    setWaitlistSuccess(true);
    setTimeout(() => {
      setShowComingSoonModal(false);
      setWaitlistSuccess(false);
      setWaitlistEmail('');
    }, 2500);
  };

  return (
    <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900/60" id="categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            Handcrafted Willow Range
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-2 mb-3 tracking-tight">
            Explore Bat Collections
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Precision-balanced cricket bats engineered for raw punch, feather-light pickup, and match-winning strokes.
          </p>
        </div>

        {/* 4 Primary Bat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {batCategories.map((category) => (
            <div
              key={category.id}
              className={`rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-xl ${
                category.isComingSoon
                  ? 'border-amber-400/50 hover:border-amber-500'
                  : 'border-gray-200 dark:border-gray-700 hover:border-red-500/60 hover:-translate-y-1'
              }`}
            >
              {/* Card Image Container */}
              <div className="relative aspect-4/3 overflow-hidden bg-gray-950">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Badge Tag */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md ${
                      category.isComingSoon
                        ? 'bg-amber-500 text-black animate-pulse'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {category.tag}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-black text-white leading-tight">{category.name}</h3>
                  <p className="text-xs text-white/80 font-medium">{category.subtitle}</p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {category.description}
                </p>

                {category.isComingSoon ? (
                  <button
                    onClick={handleCustomBatClick}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    id="btn-custom-bat-coming-soon"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Customise Bat (Coming Soon)
                  </button>
                ) : (
                  <Link
                    to={`/products?category=${category.id}`}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-gray-100 hover:bg-red-600 hover:text-white dark:bg-gray-700/60 dark:hover:bg-red-600 text-gray-800 dark:text-white transition-all flex items-center justify-center gap-1.5"
                    id={`btn-explore-${category.id}`}
                  >
                    Explore Collection
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customise Bat - Coming Soon Modal */}
      {showComingSoonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-gray-900 border border-amber-500/30 p-6 sm:p-8 text-white shadow-2xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setShowComingSoonModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-wider mb-2">
              <Hammer className="w-4 h-4" />
              Bespoke Bat Workshop
            </div>
            <h3 className="text-2xl font-black text-white mb-2">
              Customised Bat Studio — <span className="text-amber-400">Coming Soon</span>
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              We are finalizing our 3D custom bat configurer. You will be able to handpick your seasoned Kashmir Willow cleft, select custom edge thickness (up to 45mm), choose handle shape, weight, and engrave your initials.
            </p>

            {/* Feature preview list */}
            <div className="space-y-2 mb-6 bg-white/5 p-4 rounded-2xl border border-white/10 text-xs">
              <div className="flex items-center gap-2 text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Choose weight from 1080g to 1250g with exact balance point</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Round or Semi-Oval 12-piece Singapore cane handle</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Laser engraved player name &amp; club emblem on the blade</span>
              </div>
            </div>

            {/* Email Waitlist Form */}
            {waitlistSuccess ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5" />
                <span>You&apos;re on the VIP launch list! We&apos;ll notify you first with exclusive early access.</span>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                <label className="block text-xs font-semibold text-gray-400">
                  Join the Early Access Waitlist (Get 15% Launch Discount):
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-gray-700 text-sm text-white focus:outline-none focus:border-amber-400"
                    id="waitlist-email-input"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                    id="waitlist-submit-btn"
                  >
                    Notify Me
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default CategoriesSection;
