import { useState } from 'react';
import { ChevronDown, HelpCircle, Phone, MessageSquare } from 'lucide-react';

const faqs = [
  {
    q: 'Which bat should I choose: Leather Match or Tennis Ball bat?',
    a: 'For competitive leather ball tournaments and club cricket, our Leather Bats feature full profiles with 40-42mm thick power edges and 12-piece cane handles. For heavy tennis or tape-ball matches, our Tennis Bats feature deep aerodynamic rear power scoops that maximize bat speed and boundary clearance with featherlight pickup.',
  },
  {
    q: 'Do MLA cricket bats come pre-knocked and ready to play?',
    a: 'Yes! Our Pre-Made Bats and select match series blades are precision machine-knocked across the face, edges, and toe, and conditioned with raw cold-pressed linseed oil. We always recommend 10-15 minutes of gentle throw-down net practice before facing express bowling.',
  },
  {
    q: 'What bat weight should I choose for my playing style?',
    a: 'For power hitters and boundary blasters, bats weighing 1,180g to 1,220g provide colossal momentum through the shot. For stroke-makers, opening batsmen, and quick wrist players, a weight between 1,150g and 1,180g with a duckbill profile delivers featherlight pickup balance.',
  },
  {
    q: 'How does the Customised Bat studio work?',
    a: 'Our Customised Bat Studio is currently in final testing (Coming Soon). You will be able to select your willow cleft, blade curve, edge thickness (up to 45mm), handle ovality, dead weight, and laser-engrave your name and jersey number on the spine. Join our waitlist on the landing page for early access and a 15% launch voucher!',
  },
  {
    q: 'How are bats packaged and shipped across India and worldwide?',
    a: 'Every bat is individually wrapped in a moisture-barrier film, encased in a heavy-duty padded thermal bat sleeve, and boxed inside a 5-ply reinforced corrugated shipping container with corner armor. We ship via express air courier with live tracking to all Indian pin codes and overseas destinations.',
  },
  {
    q: 'How should I maintain my bat after tournament games?',
    a: 'Keep your bat away from direct moisture and extreme heat. Lightly apply 1-2 teaspoons of raw cold-pressed linseed oil to the face and edges once every 3-4 months, and inspect edge tape and toe guards to prevent split fibers from yorkers.',
  },
];

const BatFAQSection = () => {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            Batsman's Knowledge Base
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-2">
            Everything you need to know about willow selection, knock-in prep, and safe delivery.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3.5">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50 overflow-hidden transition-all duration-200 shadow-xs"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full py-4.5 px-5 sm:px-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-100/60 dark:hover:bg-gray-800/40 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-snug">
                    {faq.q}
                  </span>
                  <div className={`p-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-red-600' : 'text-gray-500'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-200/60 dark:border-gray-800/60 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions CTA */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-[#003da5] to-blue-900 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h4 className="text-lg font-black leading-tight">Need expert bat guidance?</h4>
            <p className="text-xs sm:text-sm text-cyan-200 mt-1">
              Talk directly with our master bat craftsmen in Mirgund, Kashmir via WhatsApp.
            </p>
          </div>
          <a
            href="https://wa.me/919906660000?text=Hi%20MLA%20Sports,%20I%20need%20guidance%20choosing%20the%20right%20cricket%20bat"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white text-[#003da5] hover:bg-cyan-50 font-black text-xs uppercase tracking-wider transition-all shadow-md shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            Chat with Batmaker
          </a>
        </div>

      </div>
    </section>
  );
};

export default BatFAQSection;
