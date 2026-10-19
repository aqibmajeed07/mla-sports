import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  ShieldCheck,
  Code2,
  Mail,
  Copy,
  Check,
  X,
  ExternalLink,
  Wrench,
} from 'lucide-react';
import { OWNER_NAME, LOCATION, PHONE } from '../../utils/constants';

const LinkedInIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showDevModal, setShowDevModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-800" id="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand with Logo */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <img src="/logo.png" alt="MLA Sports" className="h-12 w-12 object-contain rounded-xl shadow" />
              <div>
                <span className="text-xl font-black text-white tracking-tight">
                  MLA <span className="text-red-500">SPORTS</span>
                </span>
                <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                  Handcrafted Cricket Bats
                </p>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Your destination for authentic handcrafted Kashmir Willow cricket bats in Mirgund, Budgam. Master grade leather match blades, scooped tennis power bats, and willow care accessories.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Genuine Kashmir Willow
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Bat Collections</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/products?category=leather-bats', label: 'Leather Match Bats' },
                { to: '/products?category=tennis-bats', label: 'Tennis Scoop Bats' },
                { to: '/products?category=pre-made-bats', label: 'Pre-Made Knocked Bats' },
                { to: '/#offers', label: 'Special Bat Offers' },
                { to: '/#about', label: 'Kashmir Heritage' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account & Policies */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Account</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/login', label: 'Customer Login' },
                { to: '/signup', label: 'Join / Register' },
                { to: '/orders', label: 'Track Order & Payment' },
                { to: '/wishlist', label: 'Saved Wishlist' },
                { to: '/admin/login', label: 'Staff Admin Portal' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Workshop */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Workshop &amp; Store</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-500 mt-1 shrink-0" />
                <span className="text-sm text-gray-300 leading-snug">Main Market, {LOCATION}, Jammu &amp; Kashmir</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                <a href={`tel:+91${PHONE}`} className="text-sm text-gray-300 hover:text-white transition-colors font-medium">
                  +91 {PHONE}
                </a>
              </li>
            </ul>

            <div className="mt-5 pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-500">Business Hours:</p>
              <p className="text-xs text-gray-300 font-medium">Mon - Sun: 9:00 AM – 9:00 PM</p>
            </div>
          </div>
        </div>

        {/* Technical Support Banner */}
        <div className="mt-10 p-4 rounded-xl bg-gray-900/80 border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-300">
            <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Technical Queries &amp; Platform Support: <strong className="text-white">Aqib Majeed</strong>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-gray-400">
            <a
              href="tel:+919103696238"
              className="hover:text-amber-400 transition-colors flex items-center gap-1 font-semibold"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              +91 9103696238
            </a>
            <span className="text-gray-700">•</span>
            <a
              href="mailto:miraqib249@gmail.com"
              className="hover:text-amber-400 transition-colors flex items-center gap-1 font-semibold"
            >
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              miraqib249@gmail.com
            </a>
            <span className="text-gray-700">•</span>
            <a
              href="https://www.linkedin.com/in/aqibmajeed07"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition-colors flex items-center gap-1 font-semibold text-blue-400"
            >
              <LinkedInIcon className="w-3.5 h-3.5 text-blue-400" />
              aqibmajeed07
            </a>
          </div>
        </div>

        {/* Copyright & Interactive Developer Credit */}
        <div className="border-t border-gray-800 mt-6 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-500">
          <p>© {currentYear} MLA Sports. All rights reserved. Handcrafted in Kashmir.</p>

          <div className="flex flex-wrap items-center gap-3">
            <span>Founder &amp; Owner: <strong className="text-gray-300">{OWNER_NAME}</strong></span>
            <span className="text-gray-700 hidden sm:inline">•</span>

            {/* Clickable "Developed by Aqib Majeed" */}
            <button
              type="button"
              onClick={() => setShowDevModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-700 font-bold transition-all cursor-pointer shadow-sm group"
              title="Click to view developer contact card"
            >
              <Code2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Developed by Aqib Majeed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Developer Profile Modal (Opens when user clicks "Developed by Aqib Majeed") */}
      {showDevModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowDevModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDevModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800 hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-black text-xl text-slate-950 shadow-md">
                AM
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Aqib Majeed</h3>
                <p className="text-xs text-amber-400 font-semibold tracking-wide">
                  Software Engineer &amp; Full-Stack Developer
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Platform developer for MLA Sports. For technical support, custom features, integrations, or deployment inquiries, reach out directly:
            </p>

            <div className="space-y-2.5">
              {/* Phone */}
              <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Mobile / WhatsApp</span>
                    <a href="tel:+919103696238" className="text-xs font-mono font-bold text-white hover:text-amber-400 transition-colors">
                      +91 9103696238
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('9103696238', 'phone')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedField === 'phone' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'phone' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* LinkedIn */}
              <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <LinkedInIcon className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">LinkedIn Profile</span>
                    <span className="text-xs font-mono font-bold text-white">aqibmajeed07</span>
                  </div>
                </div>
                <a
                  href="https://www.linkedin.com/in/aqibmajeed07"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Email Address</span>
                    <a href="mailto:miraqib249@gmail.com" className="text-xs font-mono font-bold text-white hover:text-amber-400 transition-colors">
                      miraqib249@gmail.com
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('miraqib249@gmail.com', 'email')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'email' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowDevModal(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
