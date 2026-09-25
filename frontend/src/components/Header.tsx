'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Search, Sparkles, Menu, X, LogOut, User as UserIcon, Terminal, ExternalLink, ChevronDown, Cpu, BookOpen, Layers } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItemsCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBoardsDropdownOpen, setIsBoardsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Dedicated full-screen layout for Hardware Code Lab IDE
  if (pathname === '/hardware-lab' || pathname?.startsWith('/hardware-lab')) {
    return null;
  }

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const updateHeight = () => {
      const h = el.offsetHeight;
      if (h > 0) {
        document.documentElement.style.setProperty('--header-height', `${h}px`);
      }
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);

    return () => observer.disconnect();
  }, [isMobileMenuOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBoardsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const aiDestination = (query?: string) => {
    const target = query && query.trim() ? `/ai?product=${encodeURIComponent(query.trim())}` : '/ai';
    return isAuthenticated ? target : `/login?redirect=${encodeURIComponent(target)}`;
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner Notice - Crawled from DigiComp */}
      <div className="bg-[#0f172a] text-slate-300 text-xs px-4 py-1.5 border-b border-slate-800">
        <div className="container mx-auto flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-2">
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#FF6D33]/20 text-[#FF6D33] font-bold text-[10px] tracking-wider uppercase">
              🇮🇳 Made in India
            </span>
            <span className="hidden sm:inline text-slate-300 font-medium">
              Digicomp Technologies — Research-Grade Boards & BMS
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href="https://docs.digicomp.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-[#FF6D33] transition-colors flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3 text-[#FF6D33]" />
              <span>Docs</span>
            </a>
            <a
              href="https://github.com/digicomp-app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors hidden md:flex items-center gap-1"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>
            <Link
              href="/hardware-lab"
              className="text-[#FF6D33] hover:text-[#ff8229] font-medium flex items-center gap-1"
            >
              <Terminal className="w-3 h-3" />
              <span>Hardware Lab IDE</span>
            </Link>
            <Link
              href={aiDestination()}
              className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Ask AI</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="container mx-auto px-4 py-3 max-w-7xl flex items-center justify-between gap-4">
        {/* DigiComp Official Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden shadow-xs border border-orange-200/50 flex items-center justify-center bg-gradient-to-br from-[#FF6D33] to-[#E3470E]">
            <Image
              src="/images/digicomp/logo.svg"
              alt="Digicomp Technologies Logo"
              width={36}
              height={36}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>Digicomp</span>
              <span className="text-[#FF6D33] font-medium text-sm tracking-normal">Technologies</span>
            </div>
            <div className="text-[10px] text-slate-500 tracking-wider font-semibold uppercase -mt-0.5">
              Engineered for Innovators
            </div>
          </div>
        </Link>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-2">
          <div className="relative w-full flex items-center">
            <input
              type="text"
              placeholder="Search ESP32-S3, RP2350, FPGA, BMS, sensors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-24 py-2 text-sm bg-slate-50 border border-slate-300 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6D33] focus:border-[#FF6D33] text-slate-900 placeholder-slate-400 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <Link
              href={aiDestination(searchQuery)}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#FF6D33] hover:bg-[#E3470E] text-white rounded-full text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
              title="Ask DigiComp AI"
            >
              <Sparkles className="w-3 h-3 text-orange-100" />
              <span>Ask AI</span>
            </Link>
          </div>
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
          <Link href="/" className="hover:text-[#FF6D33] transition-colors">
            Home
          </Link>

          {/* Dev Boards Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsBoardsDropdownOpen(!isBoardsDropdownOpen)}
              className="flex items-center gap-1 hover:text-[#FF6D33] transition-colors py-1 cursor-pointer"
            >
              <span>Dev Boards</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isBoardsDropdownOpen ? 'rotate-180 text-[#FF6D33]' : ''}`} />
            </button>

            {isBoardsDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Official Digicomp Boards
                </div>
                <Link
                  href="/products?search=ESP32-S3"
                  onClick={() => setIsBoardsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-orange-50 hover:text-[#FF6D33] transition-colors"
                >
                  <Cpu className="w-4 h-4 text-[#FF6D33]" />
                  <div>
                    <div className="font-semibold">ESP32-S3 Dev Board</div>
                    <div className="text-[10px] text-slate-500">Xtensa LX7 Dual-Core 240MHz</div>
                  </div>
                </Link>
                <Link
                  href="/products?search=RP2350"
                  onClick={() => setIsBoardsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-orange-50 hover:text-[#FF6D33] transition-colors"
                >
                  <Cpu className="w-4 h-4 text-[#FF6D33]" />
                  <div>
                    <div className="font-semibold">RP2350 Dual-Core Board</div>
                    <div className="text-[10px] text-slate-500">ARM Cortex-M33 + RISC-V</div>
                  </div>
                </Link>
                <Link
                  href="/products?search=CH32V006"
                  onClick={() => setIsBoardsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-orange-50 hover:text-[#FF6D33] transition-colors"
                >
                  <Cpu className="w-4 h-4 text-[#FF6D33]" />
                  <div>
                    <div className="font-semibold">CH32V006 RISC-V Board</div>
                    <div className="text-[10px] text-slate-500">Ultra low-power QingKe Core</div>
                  </div>
                </Link>
                <Link
                  href="/products?search=FPGA"
                  onClick={() => setIsBoardsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-orange-50 hover:text-[#FF6D33] transition-colors"
                >
                  <Layers className="w-4 h-4 text-[#FF6D33]" />
                  <div>
                    <div className="font-semibold">Xilinx Artix-7 FPGA</div>
                    <div className="text-[10px] text-slate-500">35T Logic Cells & DSP</div>
                  </div>
                </Link>
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <Link
                    href="/products"
                    onClick={() => setIsBoardsDropdownOpen(false)}
                    className="block px-3 py-1.5 text-xs text-[#FF6D33] font-semibold hover:underline"
                  >
                    View All Hardware Catalog →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Hardware Lab In-Browser IDE */}
          <Link
            href="/hardware-lab"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs hover:bg-[#FF6D33] transition-all shadow-xs"
          >
            <Terminal className="w-3.5 h-3.5 text-[#FF6D33] group-hover:text-white" />
            <span>Hardware Lab</span>
            <span className="bg-white/20 text-[10px] px-1.5 py-0.2 rounded font-mono">IDE</span>
          </Link>

          <a
            href="https://docs.digicomp.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[#FF6D33] transition-colors"
          >
            <span>Docs</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <Link href="/products" className="hover:text-[#FF6D33] transition-colors">
            Store
          </Link>
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Cart Icon Link */}
          <Link
            href="/cart"
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-[#FF6D33] hover:bg-orange-50 rounded-full border border-slate-200 transition-colors relative"
          >
            <ShoppingCart className="w-4 h-4 text-slate-700" />
            <span className="hidden sm:inline text-xs">Cart</span>
            {totalItemsCount > 0 && (
              <span className="bg-[#FF6D33] text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {totalItemsCount}
              </span>
            )}
          </Link>

          {/* Ask AI Button in Header */}
          <Link
            href={aiDestination()}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-orange-50 text-[#FF6D33] border border-orange-200 rounded-full hover:bg-[#FF6D33] hover:text-white transition-all shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>DigiComp AI</span>
          </Link>

          {/* Auth State in Header */}
          {isAuthenticated && user ? (
            <div className="hidden sm:flex items-center gap-2 pl-1 border-l border-slate-200 ml-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 rounded-full text-xs font-semibold text-slate-800 max-w-[130px] truncate" title={user.email}>
                <UserIcon className="w-3.5 h-3.5 text-[#FF6D33] shrink-0" />
                <span className="truncate">{user.name.split(' ')[0]}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-700 hover:text-[#FF6D33] hover:bg-orange-50 border border-slate-200 rounded-full transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </form>

          <div className="flex flex-col space-y-2 font-medium text-slate-700 pt-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-[#FF6D33]"
            >
              Home
            </Link>
            <Link
              href="/hardware-lab"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-slate-900 text-white flex items-center justify-between font-semibold"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#FF6D33]" />
                <span>Hardware Lab IDE</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono">Monaco</span>
            </Link>
            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-[#FF6D33]"
            >
              Store & Development Boards
            </Link>
            <a
              href="https://docs.digicomp.app"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-[#FF6D33] flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#FF6D33]" />
                <span>Official Documentation</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <a
              href="https://github.com/digicomp-app"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-[#FF6D33] flex items-center justify-between"
            >
              <span>GitHub Organization (@digicomp-app)</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <Link
              href="/cart"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-orange-50 flex items-center justify-between"
            >
              <span>Shopping Cart</span>
              <span className="bg-[#FF6D33] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {totalItemsCount}
              </span>
            </Link>
            <Link
              href={aiDestination()}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-orange-50 text-[#FF6D33] font-semibold flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask DigiComp AI</span>
            </Link>

            {isAuthenticated && user ? (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <UserIcon className="w-4 h-4 text-[#FF6D33]" />
                  <span>{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 px-3">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-xs font-bold text-[#FF6D33]"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Login / Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
