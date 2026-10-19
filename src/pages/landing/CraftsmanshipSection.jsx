import { useState } from 'react';
import { Shield, Sparkles, Check, ChevronRight, Layers, Flame, Award, Compass } from 'lucide-react';

const batAnatomy = [
  {
    id: 'edges',
    title: '40mm - 44mm Monster Edges',
    short: 'Maximum boundary-clearing rebound even on off-center mistimed strokes.',
    desc: 'Our master artisans preserve raw timber density along the blade perimeter, ensuring unmatched power transfer on drives, cuts, and pulls.',
    tag: 'Edge Contour',
  },
  {
    id: 'spine',
    title: '65mm Elevated Power Spine',
    short: 'Extended aerodynamic spine profile creates an elongated hitting zone.',
    desc: 'Computer-calibrated spine curvature channels energy directly into the sweet spot without adding sluggish dead weight to the pickup.',
    tag: 'Spine Apex',
  },
  {
    id: 'handle',
    title: '12-Piece Sarawak Cane Handle',
    short: 'Multi-piece imported cane with built-in rubber vibration damping springs.',
    desc: 'Delivers sublime flex, exceptional hand comfort, and eliminates sting against 140+ km/h express deliveries on hard leather pitches.',
    tag: 'Handle Flex',
  },
  {
    id: 'toe',
    title: 'Duckbill Balance Toe Profile',
    short: 'Concentrates wood mass in the mid-blade while lightening the toe.',
    desc: 'Imparts a featherlight pickup balance that lets batters execute 360-degree shots, late cuts, and ramp scoops with extreme bat speed.',
    tag: 'Pickup Balance',
  },
];

const willowComparison = [
  {
    feature: 'Timber Selection',
    leather: 'Grade-1 Dense Grain Kashmir Clefts (Jhelum Valley)',
    tennis: 'Lightweight Seasoned Kashmir Willow (High Aerodynamics)',
  },
  {
    feature: 'Blade Shaping',
    leather: 'Full Spine Contour with 40-42mm Monster Edges',
    tennis: 'Deep Aerodynamic Rear Power Scoop for Bat Speed',
  },
  {
    feature: 'Ball Compatibility',
    leather: 'Tournament Hard Leather Ball (Red, White & Pink)',
    tennis: 'Heavy Tennis Ball, Hard Tennis & Tape Ball Cricket',
  },
  {
    feature: 'Ping & Power Profile',
    leather: 'Deep solid punch with progressive timber rebound',
    tennis: 'Instantaneous boundary power with featherlight pickup',
  },
  {
    feature: 'Handle Construction',
    leather: '12-Piece Premium Cane Handle with Rubber Damping',
    tennis: 'Multi-Piece Flexible Cane Handle with Anti-Shock Grip',
  },
];

const CraftsmanshipSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="py-16 sm:py-24 bg-gray-950 text-white relative overflow-hidden" id="craftsmanship">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-red-500 mb-3 bg-red-950/60 border border-red-800/50 px-3.5 py-1.5 rounded-full shadow-md">
            <Compass className="w-3.5 h-3.5" />
            Bespoke Engineering
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            The Anatomy of an <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-cyan-400">MLA Master Bat</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mt-3 leading-relaxed">
            Every curve, spine contour, and cleft press is engineered by multigenerational bat makers in Mirgund to maximize stroke timing and featherlight pickup.
          </p>
        </div>

        {/* 4 Interactive Anatomy Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-24">
          {batAnatomy.map((part, i) => (
            <div
              key={part.id}
              onClick={() => setActiveTab(i)}
              className={`p-6 sm:p-7 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                activeTab === i
                  ? 'bg-gray-900 border-red-500 shadow-xl shadow-red-950/40 -translate-y-1'
                  : 'bg-gray-900/60 border-gray-800 hover:border-gray-700 hover:bg-gray-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/10 text-cyan-300">
                    {part.tag}
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-500">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mb-2 leading-snug">
                  {part.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  {part.short}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-800/80 text-xs text-gray-300 font-medium leading-relaxed">
                {part.desc}
              </div>
            </div>
          ))}
        </div>

        {/* 4-Step Crafting Journey Strip */}
        <div className="rounded-3xl bg-gradient-to-br from-gray-900 via-gray-900/90 to-gray-950 border border-gray-800 p-6 sm:p-10 mb-16 sm:mb-24 shadow-2xl">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              The Artisan Journey
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              From Riverbank Salix Cleft to Boundary Sixes
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 font-black flex items-center justify-center text-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Cleft Grading &amp; Air Curing</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Raw willow clefts undergo 6 months of climate-controlled shed drying to achieve ideal moisture balance.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 font-black flex items-center justify-center text-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Hydraulic Roller Pressing</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Graduated pressure compresses outer timber fibers for spring-loaded ping while preserving sweet-spot resilience.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-400 font-black flex items-center justify-center text-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Hand Carving &amp; Shaping</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Master carvers use traditional drawknives to contour massive 42mm edges and featherlight duckbill toes.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-black flex items-center justify-center text-sm">
                4
              </div>
              <h4 className="text-sm font-bold text-white">Pre-Knocked &amp; Oiled</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Precision-knocked across face, edges, and toe, coated with raw cold-pressed linseed oil for genuine match play readiness.
              </p>
            </div>
          </div>
        </div>

        {/* Willow Comparison Table */}
        <div className="rounded-3xl bg-gray-900 border border-gray-800 p-6 sm:p-10 overflow-hidden">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Buyer's Guide
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Leather Match vs. Tennis Power Willow
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Understand the core craftsmanship differences between our tournament Leather Match and Heavy Tennis blades.
            </p>
          </div>

          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4 font-bold">Feature</th>
                  <th className="py-3 px-4 font-bold text-red-400">Leather Match Blades</th>
                  <th className="py-3 px-4 font-bold text-cyan-400">Heavy Tennis Scoop Bats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {willowComparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {row.feature}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">
                      {row.leather}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">
                      {row.tennis}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CraftsmanshipSection;
