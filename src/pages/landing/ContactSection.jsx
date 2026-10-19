import { useState } from 'react';
import {
  MapPin,
  Phone,
  Clock,
  Mail,
  Navigation,
  ExternalLink,
  MessageCircle,
  Check,
  Copy,
  Building2,
  Wrench,
} from 'lucide-react';
import { LOCATION, PHONE } from '../../utils/constants';

const ContactSection = () => {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const fullAddress = `Main Market, ${LOCATION} - 191111`;
  const mapEmbedUrl =
    'https://maps.google.com/maps?q=Mirgund%2C%20Budgam%2C%20Jammu%20and%20Kashmir&t=&z=14&ie=UTF8&iwloc=&output=embed';
  const directionsUrl =
    'https://www.google.com/maps/dir/?api=1&destination=Mirgund,+Budgam,+Jammu+and+Kashmir+191111';

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(fullAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  return (
    <section className="py-16 sm:py-24 bg-gray-50/50 dark:bg-gray-900/40 relative" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100/70 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-bold tracking-wide uppercase mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>Store &amp; Workshop</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Visit Us or Get in Touch
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Handcrafting premium Kashmir willow cricket bats directly from Mirgund, Budgam.
            Visit our workshop to test bats or contact us for bespoke orders.
          </p>
        </div>

        {/* 2-Column Layout: Map on Left, Contact Details on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEFT SIDE: Interactive Google Map */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="card overflow-hidden h-full flex flex-col p-2 sm:p-3 relative border border-gray-200 dark:border-gray-800 shadow-lg group">
              {/* Floating Location Badge */}
              <div className="absolute top-5 left-5 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-950/85 text-white text-xs font-semibold backdrop-blur-md shadow-md border border-gray-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <MapPin className="w-3.5 h-3.5 text-primary-400" />
                <span>MLA Sports Workshop • Mirgund, Budgam</span>
              </div>

              {/* Responsive Google Maps Iframe */}
              <div className="w-full flex-1 min-h-[360px] sm:min-h-[460px] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                <iframe
                  title="MLA Sports Kashmir Workshop Location Map"
                  src={mapEmbedUrl}
                  className="w-full h-full border-0 absolute inset-0"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Map Footer Bar with Directions Button */}
              <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/80 dark:bg-gray-900/60 rounded-xl mt-2 border border-gray-100 dark:border-gray-800/80 text-xs">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Navigation className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                  <span className="font-medium">Located on Main Market road, easily accessible by car or cab.</span>
                </div>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm whitespace-nowrap self-stretch sm:self-auto justify-center"
                  id="get-driving-directions-btn"
                >
                  <span>Get Directions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Contact Details */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {/* Workshop Address Card */}
            <div className="card p-6 border border-gray-200 dark:border-gray-800 hover:border-primary-500/40 transition-all shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 border border-primary-200/50 dark:border-primary-800/40">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    Store &amp; Workshop Address
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                    Main Market, {LOCATION}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">PIN: 191111 · Jammu &amp; Kashmir</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={handleCopyAddress}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      {copiedAddress ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Address</span>
                        </>
                      )}
                    </button>
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                    >
                      <span>Open Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone & WhatsApp Card */}
            <div className="card p-6 border border-gray-200 dark:border-gray-800 hover:border-emerald-500/40 transition-all shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-800/40">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    Store Phone &amp; Orders
                  </h3>
                  <a
                    href={`tel:+91${PHONE}`}
                    className="text-lg font-extrabold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-block"
                  >
                    +91 {PHONE}
                  </a>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Order queries, willow selection &amp; bulk orders
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={`tel:+91${PHONE}`}
                      className="btn-primary py-1.5 px-3 text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Store</span>
                    </a>
                    <a
                      href={`https://wa.me/91${PHONE}?text=Hello%20MLA%20Sports%2C%20I%20have%20an%20inquiry%20regarding%20cricket%20bats`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary py-1.5 px-3 text-xs font-bold inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:border-emerald-500"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Email & Support Card */}
            <div className="card p-6 border border-gray-200 dark:border-gray-800 hover:border-blue-500/40 transition-all shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-800/40">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    Direct Email
                  </h3>
                  <a
                    href="mailto:mlasportsbudgam@gmail.com"
                    className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    mlasportsbudgam@gmail.com
                  </a>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Invoices, commercial partnerships, or custom blade inquiries
                  </p>
                </div>
              </div>
            </div>

            {/* Workshop Hours Card */}
            <div className="card p-5 border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/50 dark:border-amber-800/40">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white">Workshop &amp; Store Timings</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                    Mon–Sat: <strong className="text-gray-800 dark:text-gray-200">9:00 AM – 8:30 PM</strong> · Sunday: <strong className="text-gray-800 dark:text-gray-200">10:00 AM – 6:00 PM</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Support Tag */}
            <div className="p-3 rounded-xl bg-gray-100/70 dark:bg-gray-900/50 border border-gray-200/60 dark:border-gray-800 flex items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-500" />
                Technical &amp; Website Inquiries:
              </span>
              <a
                href="tel:+919103696238"
                className="font-bold text-gray-800 dark:text-gray-200 hover:text-amber-500 transition-colors"
              >
                Aqib Majeed (+91 9103696238)
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
