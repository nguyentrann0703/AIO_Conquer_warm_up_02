import React from "react";

const Header = () => {
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-2/3 z-50 flex justify-between items-center px-6 h-16 bg-white/20      shadow-[0_4_30px_rgba(0,0,0,0.1)] border-b-0 rounded-xl">
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold tracking-widest text-[#fcdf46] dark:text-[#fcdf46] font-headline uppercase">
          LOG_REF: 0882 // CORE
        </span>
      </div>
      <nav className="hidden md:flex gap-8 items-center h-full">
        <a
          className="font-body tracking-tighter uppercase text-sm text-[#fcdf46] border-b-2 border-[#fcdf46] pb-1 hover:skew-x-[-10deg] transition-all"
          href="#"
        >
          PREDICTIONS
        </a>
        <a
          className="font-body tracking-tighter uppercase text-sm text-background hover:text-zinc-300 hover:skew-x-[-10deg] transition-all"
          href="#"
        >
          NETWORK
        </a>
        <a
          className="font-body tracking-tighter uppercase text-sm text-zinc-500 hover:text-zinc-300 hover:skew-x-[-10deg] transition-all"
          href="#"
        >
          RESOURCES
        </a>
        <a
          className="font-body tracking-tighter uppercase text-sm text-zinc-500 hover:text-zinc-300 hover:skew-x-[-10deg] transition-all"
          href="#"
        >
          TERMINAL
        </a>
      </nav>
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center bg-surface-container px-3 py-1 border-b border-outline-variant">
          <span className="material-symbols-outlined text-primary text-sm mr-2">
            search
          </span>
          <input
            className="bg-transparent border-none text-xs font-label focus:ring-0 w-32 uppercase tracking-widest"
            placeholder="QUERY_SYSTEM..."
            type="text"
          />
        </div>
        <button className="material-symbols-outlined text-primary hover:text-secondary transition-colors">
          notifications_active
        </button>
        <button className="material-symbols-outlined text-primary hover:text-secondary transition-colors">
          settings_input_component
        </button>
      </div>
    </header>
  );
};

export default Header;
