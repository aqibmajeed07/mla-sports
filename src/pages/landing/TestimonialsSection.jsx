import { Star, CheckCircle } from 'lucide-react';

const testimonials = [
  {
    name: 'Zubair Ahmad Dar',
    role: 'Opening Batsman, Budgam XI',
    batType: '🏏 Kashmir Willow Pro Edition',
    text: 'The ping on my MLA Pro Edition bat is extraordinary. Hit 8 sixes in my tournament quarterfinal last week. The balance feels light as a feather despite the massive 42mm edges.',
    rating: 5,
  },
  {
    name: 'Irfan Manzoor',
    role: 'Captain, Kashmir Tennis Cricket League',
    batType: '⚡ Velocity Scoop Tennis Bat',
    text: 'For heavy tennis ball cricket, nothing comes close to MLA Tennis bats. The rear power scoop provides ridiculous bat speed. Deliveries clear the boundary ropes with minimal effort.',
    rating: 5,
  },
  {
    name: 'Waseem Akram Mir',
    role: 'District Cricket Academy Coach',
    batType: '🏆 Grade-1 Kashmir Gold',
    text: 'We order team bats exclusively from MLA Sports in Mirgund. The willow density, pressing, and pre-knocking are done to perfection. Outstanding craftsmanship at honest prices.',
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            Player Reviews
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-1 mb-3">
            Trusted by Batsmen Across the Valley
          </h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Discover why competitive cricketers choose MLA handcrafted willow bats for their match-winning innings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="card p-7 sm:p-8 flex flex-col justify-between hover:border-red-500/40 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                    {t.batType}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-amber-600 text-white font-bold flex items-center justify-center text-sm shadow">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                    {t.name}
                    <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
