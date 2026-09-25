'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Sparkles, Terminal, BookOpen, ExternalLink, Cpu, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on full-height workspace pages like /ai and /hardware-lab
  if (pathname === '/ai' || pathname?.startsWith('/hardware-lab')) {
    return null;
  }

  return (
    <footer className="bg-[#0b0f17] text-slate-400 text-sm border-t border-slate-800">
      {/* DigiComp Core Commitments Bar */}
      <div className="border-b border-slate-800 bg-[#090d14] py-8">
        <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-300">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF6D33] shrink-0">
              <span className="text-xl">🇮🇳</span>
            </div>
            <div>
              <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>Made in India</span>
                <span className="text-[10px] bg-orange-500/20 text-[#FF6D33] px-1.5 py-0.2 rounded font-mono">DOMESTIC</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Designed & built domestically to eliminate import delay</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>Open Schematics</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded font-mono">100% FREE</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Free circuit schematics, pinouts, and datasheets</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>Industrial Grade</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">TESTED</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Tested for production, factory floors, and lab benches</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>Hardware Lab IDE</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.2 rounded font-mono">IN-BROWSER</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Monaco C++ editor & AI engineering assistant</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 max-w-7xl grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Brand & Mission */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#FF6D33] to-[#E3470E]">
              <Image
                src="/images/digicomp/logo.svg"
                alt="Digicomp Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
              <span>Digicomp</span>
              <span className="text-[#FF6D33] font-medium text-xs">Technologies</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-md">
            Research-grade development boards, Battery Management Systems (BMS), and FPGA modules designed and manufactured in India. Complete open-source documentation, industrial reliability, and zero compromise.
          </p>

          <div className="pt-1 flex items-center gap-3">
            <a
              href="https://github.com/digicomp-app"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#FF6D33] hover:text-white text-slate-400 flex items-center justify-center transition-colors"
              title="GitHub: digicomp-app"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
            <a
              href="https://linkedin.com/company/digicomphq"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#0077b5] hover:text-white text-slate-400 flex items-center justify-center transition-colors"
              title="LinkedIn: Digicomp"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a
              href="https://x.com/digicomphq"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-400 flex items-center justify-center transition-colors"
              title="X (Twitter): @digicomphq"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href="https://youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#ff0000] hover:text-white text-slate-400 flex items-center justify-center transition-colors"
              title="YouTube"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Development Boards */}
        <div>
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3.5 text-[#FF6D33]">Shop Hardware</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/products?search=ESP32-S3" className="hover:text-white transition-colors">
                ESP32-S3 Dev Board
              </Link>
            </li>
            <li>
              <Link href="/products?search=RP2350" className="hover:text-white transition-colors">
                RP2350 Dual-Core Board
              </Link>
            </li>
            <li>
              <Link href="/products?search=CH32V006" className="hover:text-white transition-colors">
                CH32V006 RISC-V Board
              </Link>
            </li>
            <li>
              <Link href="/products?search=FPGA" className="hover:text-white transition-colors">
                Xilinx Artix-7 FPGA
              </Link>
            </li>
            <li>
              <Link href="/products?search=BMS" className="hover:text-white transition-colors">
                16S Battery Management
              </Link>
            </li>
            <li>
              <Link href="/products" className="text-[#FF6D33] hover:underline font-semibold flex items-center gap-1 pt-1">
                View Full Catalog →
              </Link>
            </li>
          </ul>
        </div>

        {/* Documentation & Resources */}
        <div>
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3.5">Resources</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href="https://docs.digicomp.app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <span>Documentation</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
              </a>
            </li>
            <li>
              <a
                href="https://docs.digicomp.app/boards/esp32-s3/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <span>ESP32-S3 Pinouts</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
              </a>
            </li>
            <li>
              <a
                href="https://docs.digicomp.app/boards/esp32-s3/blink"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <span>Firmware Examples</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
              </a>
            </li>
            <li>
              <a
                href="https://github.com/digicomp-app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <span>GitHub Repositories</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
              </a>
            </li>
            <li>
              <Link href="/hardware-lab" className="hover:text-white transition-colors">
                Hardware Code Lab
              </Link>
            </li>
          </ul>
        </div>

        {/* WebBrowserIDE & AI */}
        <div>
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3.5">Engineering Platform</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/hardware-lab" className="text-white hover:text-[#FF6D33] font-semibold flex items-center gap-1">
                <Terminal className="w-3 h-3 text-[#FF6D33]" />
                <span>Monaco C++ IDE</span>
              </Link>
            </li>
            <li>
              <Link href="/ai" className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Ask DigiComp AI</span>
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-white transition-colors">
                Shopping Cart & Checkout
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/MANOJHEGDE77/WebBrowserIDE"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <span>Repository Source</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-slate-800/80 py-5 bg-[#080b11] text-xs text-slate-500">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-400">Made in India</span>
            <span>&bull;</span>
            <span>Copyright &copy; {new Date().getFullYear()} Digicomp Technologies.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Open-source documentation, industrial reliability.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
