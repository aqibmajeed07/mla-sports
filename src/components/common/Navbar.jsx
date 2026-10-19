import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Search, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import NotificationBell from './NotificationBell';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Order tracking only appears after login
  const navLinks = [
    { to: '/', label: 'HOME' },
    { to: '/#categories', label: 'CUSTOMISED BAT', isHash: true, badge: 'SOON' },
    { to: '/products?category=leather-bats', label: 'LEATHER BATS' },
    { to: '/products?category=pre-made-bats', label: 'PRE-MADE BATS' },
    { to: '/products?category=tennis-bats', label: 'TENNIS BATS' },
    ...(user ? [{ to: '/track', label: 'TRACK ORDER' }] : []),
    { to: '/#offers', label: 'SPECIAL OFFERS', isHash: true },
    { to: '/#contact', label: 'CONTACT US', isHash: true },
  ];

  const handleHashClick = (hash) => {
    setIsOpen(false);
    if (location.pathname === '/') {
      const targetId = hash.replace('/#', '').replace('/', '');
      const el = document.getElementById(targetId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top Utility Blue Banner */}
      <div className="bg-[#003da5] text-white text-[10.5px] font-semibold tracking-wider uppercase py-1.5 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-cyan-300" />
            <span>WE DELIVER ACROSS INDIA &amp; WORLDWIDE</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
            <span>100% GENUINE HANDCRAFTED KASHMIR WILLOW</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>MASTER BAT CRAFT • BUDGAM, KASHMIR</span>
          </div>
        </div>
      </div>

      <nav className="sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800" id="main-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[70px]">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0 mr-4 xl:mr-8" id="logo-link">
              <img
                src="/logo.png"
                alt="MLA Sports"
                className="h-10 w-10 object-contain rounded-xl transition-transform group-hover:scale-105 shadow-xs"
              />
              <div className="flex flex-col">
                <span className="text-lg xl:text-xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
                  MLA <span className="text-red-600">SPORTS</span>
                </span>
                <span className="text-[8.5px] font-bold tracking-widest text-gray-500 uppercase mt-0.5">
                  Handcrafted Bats
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links - Clean, elegant typography with proper spacing */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-4 flex-1 justify-center">
              {navLinks.map((link) =>
                link.isHash ? (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => handleHashClick(link.to)}
                    className="text-[11px] xl:text-[11.5px] font-semibold tracking-wide text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors flex items-center gap-1 px-1.5 py-1"
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.2 text-[8px] font-bold rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 tracking-normal">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ) : (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`text-[11px] xl:text-[11.5px] font-semibold tracking-wide transition-colors px-1.5 py-1 ${
                      isActive(link.to)
                        ? 'text-red-600 dark:text-red-400 font-bold'
                        : 'text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>

            {/* Desktop Right Utilities (Search, Theme, Notifications, Profile / Login) */}
            <div className="hidden md:flex items-center gap-2.5 xl:gap-3.5 shrink-0 ml-3">
              <Link
                to="/products"
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Search Bats"
              >
                <Search className="w-4 h-4" />
              </Link>

              <ThemeToggle />

              {user ? (
                <>
                  <NotificationBell />

                  <Link
                    to={isAdmin ? '/admin' : '/profile'}
                    className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors text-xs font-semibold"
                    id="profile-link"
                    title={isAdmin ? 'Admin Dashboard' : 'My Account'}
                  >
                    <User className="w-4 h-4 text-primary-600" />
                    <span>{isAdmin ? 'Admin' : 'Account'}</span>
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-2 ml-1">
                  <Link
                    to="/login"
                    className="text-xs font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-2.5 py-1.5 transition-colors"
                    id="login-link"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="text-xs font-bold bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                    id="signup-link"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-1.5">
              <ThemeToggle />
              <Link to="/products" className="p-2" aria-label="Search">
                <Search className="w-4 h-4 text-gray-700 dark:text-gray-200" />
              </Link>
              {user && <NotificationBell />}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                id="mobile-menu-toggle"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-5 h-5 text-gray-700 dark:text-gray-200" /> : <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="lg:hidden py-3 border-t border-gray-100 dark:border-gray-800 animate-fade-in-down">
              <div className="flex flex-col gap-0.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => {
                      setIsOpen(false);
                      if (link.isHash) handleHashClick(link.to);
                    }}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 flex items-center justify-between"
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.2 text-[8px] font-bold rounded-full bg-amber-500/20 text-amber-500">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}

                <div className="h-px bg-gray-200 dark:bg-gray-800 my-2" />

                {user ? (
                  <>
                    <Link to="/orders" onClick={() => setIsOpen(false)} className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                      My Orders &amp; Invoices
                    </Link>
                    <Link to="/profile" onClick={() => setIsOpen(false)} className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                      My Profile
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsOpen(false)} className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg">
                        Admin Dashboard
                      </Link>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-1 px-3">
                    <Link to="/login" onClick={() => setIsOpen(false)} className="py-2 text-xs font-semibold text-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                      Login
                    </Link>
                    <Link to="/signup" onClick={() => setIsOpen(false)} className="py-2 text-xs font-bold text-center rounded-lg bg-red-600 text-white">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
