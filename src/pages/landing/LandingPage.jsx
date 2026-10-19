import SEO from '../../components/common/SEO';
import HeroSection from './HeroSection';
import CategoriesSection from './CategoriesSection';
import FeaturedProducts from './FeaturedProducts';
import OffersSection from './OffersSection';
import CraftsmanshipSection from './CraftsmanshipSection';
import AboutSection from './AboutSection';
import TestimonialsSection from './TestimonialsSection';
import BatFAQSection from './BatFAQSection';
import ContactSection from './ContactSection';

const LandingPage = () => {
  return (
    <div className="overflow-x-hidden w-full">
      <SEO
        title="Home | Handcrafted Cricket Bats & Willow Craft"
        description="MLA Sports is Kashmir's premier handcrafted cricket bat brand in Mirgund, Budgam. Explore Grade-1 Kashmir Willow leather match bats, scooped tennis bats, and bespoke willow craft."
        path="/"
        keywords="MLA Sports, Kashmir willow bats, cricket bat, tennis ball bat, Mirgund bat workshop, cricket bats India, handcrafted bats Srinagar, Budgam sports"
      />
      {/* 1. Full-Screen Dynamic Hero Banner */}
      <HeroSection />

      {/* 2. Explore Bat Collections */}
      <CategoriesSection />

      {/* 3. Featured Cricket Bats (Dual View Flip) */}
      <FeaturedProducts />

      {/* 4. Special Bat Offers & Season Perks */}
      <OffersSection />

      {/* 5. Master Bat Anatomy & Willow Craftsmanship */}
      <CraftsmanshipSection />

      {/* 6. Player Testimonials & Match Reviews */}
      <TestimonialsSection />

      {/* 7. Kashmir Valley Artisan Heritage */}
      <AboutSection />

      {/* 8. Cricket Bat Knowledge Base & FAQ */}
      <BatFAQSection />

      {/* 9. Workshop Location & Contact */}
      <ContactSection />
    </div>
  );
};

export default LandingPage;
