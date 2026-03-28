import React from "react";

const Footer = () => {
  return (
    <footer className="w-full py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center bg-[#0e0e0e] border-t border-zinc-800/20">
      <p className="font-['Inter'] text-[10px] tracking-[0.2em] uppercase text-zinc-600 mb-4 md:mb-0">
        ©2024 KINETIC_ARCHITECT_LOGISTICS // ENCRYPTED_CONNECTION
      </p>
      <div className="flex gap-8">
        <a
          className="font-['Inter'] text-[10px] tracking-[0.2em] uppercase text-zinc-600 hover:text-cyan-400 transition-colors"
          href="#"
        >
          PROTOCOL_01
        </a>
        <a
          className="font-['Inter'] text-[10px] tracking-[0.2em] uppercase text-zinc-600 hover:text-cyan-400 transition-colors"
          href="#"
        >
          LIABILITY_WAIVER
        </a>
        <a
          className="font-['Inter'] text-[10px] tracking-[0.2em] uppercase text-zinc-600 hover:text-cyan-400 transition-colors"
          href="#"
        >
          DATA_ENCRYPTION
        </a>
      </div>
    </footer>
  );
};

export default Footer;
