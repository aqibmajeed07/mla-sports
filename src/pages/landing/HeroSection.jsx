import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Flame } from 'lucide-react';

const slides = [
  {
    id: 'slide-1',
    image: '/hero-cricketer.jpg',
    tagline: 'AUTHENTIC KASHMIR WILLOW',
    heading1: 'DOMINATE',
    heading2: 'THE CREASE',
    subtitle: 'Handcrafted from seasoned Grade-1 Kashmir Willow clefts for explosive sweet spot ping and massive boundary power.',
    primaryBtn: { text: 'Shop Leather Bats', to: '/products?category=leather-bats' },
    secondaryBtn: { text: 'Shop Tennis Bats', to: '/products?category=tennis-bats' },
  },
  {
    id: 'slide-2',
    image: '/hero-bat-macro.jpg',
    tagline: 'MASTER ARTISAN CRAFT',
    heading1: 'EXPLOSIVE',
    heading2: 'POWER',
    subtitle: '42mm monster edges with balanced featherlight pickup engineered by master craftsmen in Mirgund, Kashmir.',
    primaryBtn: { text: 'Explore Pro Series', to: '/products' },
    secondaryBtn: { text: 'Special Offers', to: '/#offers' },
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const slide = slides[currentSlide];

  return (
    <section
      className="relative overflow-hidden w-full min-h-[calc(100dvh-92px)] sm:min-h-[calc(100vh-100px)] lg:min-h-[calc(100vh-104px)] flex flex-col justify-between bg-gray-950 transition-all duration-700"
      id="hero"
    >
      {/* Zoomed-out Background Image Layer: Full cricketer, bat, and stadium atmosphere visible */}
      <div
        className="absolute inset-0 transition-all duration-700 pointer-events-none bg-no-repeat bg-cover sm:bg-contain bg-[position:right_15%_center] sm:bg-[position:right_center]"
        style={{
          backgroundImage: `url(${slide.image})`,
        }}
      />

      {/* Atmospheric gradient overlays: Seamless blend to text on left while keeping cricketer vivid on right */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-black/70 to-black/30 sm:bg-gradient-to-r sm:from-gray-950 sm:via-gray-950/80 sm:to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent pointer-events-none" />

      {/* Content Container - Vertically Centered */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-8 w-full flex-1 flex items-center">
        <div className="max-w-xl animate-fade-in w-full">
          {/* Tagline */}
          <p className="text-[11px] sm:text-xs font-black tracking-[0.25em] text-cyan-400 uppercase mb-2.5 sm:mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            {slide.tagline}
          </p>

          {/* Giant Title - Fluid & Highly Responsive */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8.5xl font-black text-white leading-[0.98] sm:leading-none tracking-tight mb-3 sm:mb-4 drop-shadow-xl">
            <span className="block">{slide.heading1}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-red-500">
              {slide.heading2}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-gray-300 mb-6 sm:mb-8 leading-relaxed max-w-lg">
            {slide.subtitle}
          </p>

          {/* Mobile-Priority Action Buttons (Full-width on phone, row on tablet/desktop) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 mb-6 sm:mb-8 w-full sm:w-auto">
            <Link
              to={slide.primaryBtn.to}
              className="inline-flex items-center justify-center gap-2 font-black py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-xl cursor-pointer bg-red-600 hover:bg-red-500 text-white w-full sm:w-auto active:scale-98"
              id="hero-primary-cta"
            >
              {slide.primaryBtn.text}
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to={slide.secondaryBtn.to}
              className="inline-flex items-center justify-center gap-2 font-bold py-3.5 sm:py-4 px-6 sm:px-7 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 w-full sm:w-auto active:scale-98"
              id="hero-secondary-cta"
            >
              {slide.secondaryBtn.text}
            </Link>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3.5 border-t border-white/15 text-[11px] sm:text-xs text-gray-300 font-semibold">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>100% Genuine Kashmir Willow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-500 shrink-0" />
              <span>Precision Balanced Pickup</span>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Arrow Controls (Visible on tablet & desktop) */}
      <button
        onClick={prevSlide}
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md items-center justify-center transition-all cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md items-center justify-center transition-all cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slider Dots Only (Clean, no fake stats) */}
      <div className="relative z-10 w-full flex justify-center items-center gap-2 pb-4 pt-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              currentSlide === idx ? 'w-8 bg-cyan-400' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
