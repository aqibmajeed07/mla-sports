import { PHONE } from '../../utils/constants';

const WhatsAppButton = () => {
  const whatsappUrl = `https://wa.me/91${PHONE}?text=${encodeURIComponent(
    'Hello MLA Sports, I would like to inquire about your handcrafted cricket bats.'
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group cursor-pointer focus:outline-none"
      aria-label="Chat with MLA Sports on WhatsApp"
      id="whatsapp-floating-btn"
    >
      <div className="hidden sm:flex items-center px-3 py-1.5 rounded-full bg-white dark:bg-gray-900 border border-emerald-500/30 text-gray-800 dark:text-gray-100 text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Chat on WhatsApp</span>
      </div>
      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-7 h-7 sm:w-8 sm:h-8"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.7C7.02 10.92 7.91 12.1 8.03 12.26C8.16 12.43 9.77 14.92 12.24 15.99C12.83 16.24 13.29 16.39 13.65 16.51C14.24 16.7 14.78 16.67 15.21 16.61C15.69 16.54 16.68 16.01 16.89 15.42C17.1 14.83 17.1 14.33 17.04 14.22C16.98 14.11 16.82 14.05 16.58 13.93C16.34 13.81 15.16 13.23 14.94 13.15C14.72 13.07 14.56 13.03 14.4 13.27C14.24 13.51 13.78 14.05 13.64 14.21C13.5 14.37 13.36 14.39 13.12 14.27C12.88 14.15 11.87 13.82 10.68 12.76C9.75 11.93 9.12 10.91 8.98 10.67C8.84 10.43 8.96 10.3 9.08 10.18C9.19 10.07 9.33 9.89 9.45 9.75C9.57 9.61 9.61 9.51 9.69 9.35C9.77 9.19 9.73 9.05 9.67 8.93C9.61 8.81 9.15 7.67 8.96 7.21C8.77 6.77 8.58 6.83 8.44 6.82C8.31 6.82 8.16 6.82 8.01 6.82L8.53 7.33Z" />
        </svg>
      </div>
    </a>
  );
};

export default WhatsAppButton;
