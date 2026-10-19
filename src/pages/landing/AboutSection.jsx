import { Award, Shield, Truck, Hammer } from 'lucide-react';

const AboutSection = () => {
  const features = [
    {
      icon: Hammer,
      title: 'Handcrafted in Kashmir',
      desc: 'Each bat is hand-carved by master artisans in Mirgund, Budgam from seasoned Kashmir willow clefts.',
    },
    {
      icon: Award,
      title: 'Pre-Knocked & Balanced',
      desc: 'Pressed for an enormous sweet spot with 40mm+ power edges, pre-oiled and machine knocked for match play.',
    },
    {
      icon: Truck,
      title: 'Pan-India & Global Delivery',
      desc: 'Safely packed in reinforced thermal bat sleeves and dispatched directly to your door across India and overseas.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900/50" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            The MLA Heritage
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-1 mb-3 tracking-tight">
            Crafting Legendary Cricket Bats Since Inception
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Headquartered in Mirgund, Budgam, Jammu &amp; Kashmir. We specialize in precision-crafted Kashmir Willow bats built to withstand the fastest bowling attacks and dominate the boundary ropes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="card p-8 text-center hover:border-red-500/40 transition-all">
                <div className="w-14 h-14 bg-red-50 dark:bg-red-950/40 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-200 dark:border-red-900/40">
                  <Icon className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
