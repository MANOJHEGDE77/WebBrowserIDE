'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import InteractiveDotGrid from '@/components/InteractiveDotGrid';
import { useCart } from '@/context/CartContext';
import { ProductCategory } from '@/types/product';
import {
  ArrowRight,
  Sparkles,
  Terminal,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  Zap,
  BatteryCharging,
  Radio,
  BookOpen,
  Check,
  Star,
  Quote,
  Clock,
  Calendar,
  Share2
} from 'lucide-react';

export default function HomePage() {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'bms' | 'esp32'>('esp32');
  const [addedItem, setAddedItem] = useState<number | null>(null);

  const trustAvatars = [
    { id: 'V', bg: '#FF5722' },
    { id: 'S', bg: '#FFA726' },
    { id: 'P', bg: '#FF6D33' },
    { id: 'R', bg: '#E64A19' },
    { id: 'A', bg: '#FFB74D' },
  ];

  const flagshipBoards = [
    {
      id: 101,
      sku: 'DC-ESP32S3-01',
      name: 'ESP32-S3 Dev Board',
      slug: 'esp32s3',
      category: 'Microcontrollers',
      description: 'Xtensa LX7 Dual-Core 240MHz, 8MB PSRAM, Wi-Fi 4 + BLE 5.0, dual Type-C (OTG & UART).',
      price: 649,
      image: '/images/digicomp/ESP32-S3-front.png',
      tag: 'Flagship MCU',
      chip: 'Xtensa LX7',
      clock: '240 MHz',
      voltage: '3.3V',
      stock: 50,
      in_stock: true,
      productUrl: '/products/101',
    },
    {
      id: 102,
      sku: 'DC-RP2350-01',
      name: 'RP2350 Dual-Core Board',
      slug: 'rp2350',
      category: 'Microcontrollers',
      description: 'Dual ARM Cortex-M33 + Dual Hazard3 RISC-V @ 150MHz, 520KB SRAM, 12 PIO state machines.',
      price: 799,
      image: '/images/digicomp/RP2350-front.png',
      tag: 'ARM + RISC-V',
      chip: 'RP2350',
      clock: '150 MHz',
      voltage: '3.3V',
      stock: 35,
      in_stock: true,
      productUrl: '/products/102',
    },
    {
      id: 103,
      sku: 'DC-CH32V-01',
      name: 'CH32V006 RISC-V Board',
      slug: 'ch32v006',
      category: 'Microcontrollers',
      description: 'Ultra-low power QingKe 32-bit RISC-V core, 48MHz, 32KB Flash, hardware single-wire debug.',
      price: 299,
      image: '/images/digicomp/CH32V006-front.png',
      tag: 'Ultra Low Power',
      chip: 'CH32V006',
      clock: '48 MHz',
      voltage: '3.3V / 5V',
      stock: 60,
      in_stock: true,
      productUrl: '/products/103',
    },
    {
      id: 104,
      sku: 'DC-FPGA-01',
      name: 'Xilinx Artix-7 FPGA Platform',
      slug: 'artix7-fpga',
      category: 'Microcontrollers',
      description: 'Research-grade FPGA platform with 33,280 logic cells, dual PMOD connectors, and 100MHz clock.',
      price: 4899,
      image: '/images/digicomp/FPGA-front.png',
      tag: 'High-Speed Logic',
      chip: 'Artix-7 35T',
      clock: '100 MHz',
      voltage: '1.0V - 3.3V',
      stock: 12,
      in_stock: true,
      productUrl: '/products/104',
    },
  ];

  const handleQuickAdd = (product: typeof flagshipBoards[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      sku: product.sku,
      category: product.category as ProductCategory,
      subcategory: product.category,
      slug: product.slug,
      description: product.description,
      stock: product.stock,
      stock_quantity: product.stock,
      in_stock: product.in_stock,
      image_url: product.image,
      productUrl: product.productUrl,
      product_url: product.productUrl,
      specifications: { Chip: product.chip, Clock: product.clock, Voltage: product.voltage },
      tags: ['digicomp', 'official', 'dev-board'],
      keywords: `${product.name} ${product.chip}`,
    });
    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 2000);
  };

  const testimonials = [
    {
      id: 1,
      quote: "I made a simple swap to Digicomp ESP32 S3 board. Now exact schematic, datasheet, and docs are available. This is how hardware should be.",
      author: "Vasudevan B",
      role: "Senior Engineer",
      company: "Microsoft",
      rating: 5,
    },
    {
      id: 2,
      quote: "The Artix-7 FPGA board is incredible value. We're using it for teaching digital signal processing in our lab, and the support is top-notch.",
      author: "Venkatesh",
      role: "Professor",
      company: "VCET, Puttur",
      rating: 5,
    },
    {
      id: 3,
      quote: "We switched our entire prototyping lab to Digicomp boards. Support from the founding team makes all the difference when deadlines are tight.",
      author: "Swastik Padma",
      role: "Director",
      company: "Throughgen Innovations Pvt Ltd",
      rating: 5,
    },
    {
      id: 4,
      quote: "The 16-Cell BMS exceeded our expectations. The open schematic structure alone saved us weeks of development time. Looking forward to continued collaboration.",
      author: "Rohit Amlani",
      role: "Embedded Systems Designer",
      company: "Scania Sverige",
      rating: 5,
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Interactive Dot Grid Canvas + Saffron Glow)             */}
      {/* ========================================================================= */}
      <section id="hero" className="relative flex min-h-[85vh] items-center overflow-hidden pt-8 pb-16 bg-white">
        {/* Dynamic Interactive Dot Grid Canvas */}
        <InteractiveDotGrid dotSize={1.6} gap={36} baseColor="#e2e8f0" activeColor="#FF6D33" />

        <div className="section-container relative z-10 flex w-full flex-col items-center gap-12 lg:flex-row lg:justify-between">
          {/* Left Hero Content */}
          <div className="relative z-20 flex w-full flex-col items-center text-center lg:w-[54%] lg:items-start lg:text-left">
            {/* Make in India Badge */}
            <div className="animate-fade-in-up">
              <span
                id="hero-badge"
                className="inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-200/80 px-4 py-1.5 text-xs font-bold text-[#FF6D33] shadow-xs"
              >
                <span>🇮🇳</span>
                <span>Designed & Manufactured in India</span>
              </span>
            </div>

            {/* Headline */}
            <h1
              id="hero-headline"
              className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.08]"
            >
              Engineered for{' '}
              <span className="gradient-text">Innovators.</span>
              <br />
              Manufactured in India.
            </h1>

            {/* Subheadline */}
            <p id="hero-subheadline" className="mt-6 max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Research-grade development boards, BMS, and FPGA modules designed and built domestically. Experience uncompromising quality paired with complete open-source documentation.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <a href="#products" className="button button--xl button--primary">
                <span>Shop Hardware</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                href="/hardware-lab"
                className="button button--xl bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Terminal className="w-4 h-4 text-[#FF6D33]" />
                <span>Launch Hardware Lab IDE</span>
              </Link>

              <a
                href="https://docs.digicomp.app"
                target="_blank"
                rel="noopener noreferrer"
                className="button button--xl button--outline"
              >
                <span>Browse Docs</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>

            {/* Trust Strip */}
            <div id="hero-trust-strip" className="mt-10 flex items-center gap-3.5">
              <div className="flex -space-x-2">
                {trustAvatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[11px] font-black text-white shadow-xs"
                    style={{ backgroundColor: avatar.bg }}
                  >
                    {avatar.id}
                  </div>
                ))}
              </div>
              <span className="text-xs sm:text-sm text-slate-500 font-medium">
                Trusted by <span className="font-bold text-slate-800">500+</span> engineers across India
              </span>
            </div>
          </div>

          {/* Right Hero Showcase Board */}
          <div className="relative flex w-full items-center justify-center lg:w-[44%]">
            {/* Ambient Backlight Glow */}
            <div
              className="pointer-events-none absolute h-[115%] w-[115%] rounded-full animate-pulse-glow"
              style={{ background: 'radial-gradient(circle, rgba(255, 109, 51, 0.22) 0%, rgba(255, 130, 41, 0.08) 35%, transparent 68%)' }}
              aria-hidden="true"
            />

            <div className="relative z-10 w-full max-w-md bg-gradient-to-b from-white to-slate-50 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full bg-orange-100 text-[#FF6D33] text-[11px] font-extrabold uppercase tracking-wider font-mono">
                  Official Hardware
                </span>
                <span className="text-xs font-mono text-slate-400">ESP32-S3 Rev 1.2</span>
              </div>

              {/* Product Image with Float Effect */}
              <div className="relative w-full aspect-4/3 flex items-center justify-center py-2">
                <Image
                  src="/images/digicomp/ESP32-S3-front.png"
                  alt="ESP32-S3 Development Board by Digicomp Technologies"
                  width={420}
                  height={315}
                  priority
                  className="w-full h-auto max-h-56 object-contain drop-shadow-2xl animate-float"
                />
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">ESP32-S3 Dev Board</h3>
                  <p className="text-xs text-slate-500">Dual-Core Xtensa &bull; 8MB PSRAM &bull; Dual USB-C</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-slate-900">₹649</div>
                  <div className="text-[11px] text-emerald-600 font-semibold">In Stock</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <Link
                  href="/hardware-lab"
                  className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5 text-[#FF6D33]" />
                  <span>Code In Lab</span>
                </Link>
                <button
                  onClick={() => handleQuickAdd(flagshipBoards[0])}
                  className="w-full py-2.5 px-3 bg-[#FF6D33] hover:bg-[#E3470E] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  {addedItem === 101 ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{addedItem === 101 ? 'Added!' : 'Add to Cart'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. OUR PRODUCTS SECTION (Crawled from digicomp.app #products)              */}
      {/* ========================================================================= */}
      <section id="products" className="py-12 relative bg-slate-50/70 border-y border-slate-200/80">
        <div className="section-container">
          <div className="mb-14 text-center max-w-2xl mx-auto">
            <span className="uppercase tracking-widest text-xs font-extrabold gradient-text">
              OUR PRODUCTS
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Shop Development Boards
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Production-ready boards with open-source documentation, tested for industrial reliability. Every purchase includes free schematics and example code.
            </p>
          </div>

          {/* Flagship Boards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {flagshipBoards.map((board) => (
              <div
                key={board.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-orange-300 hover:shadow-xl transition-all duration-300 flex flex-col p-5 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF6D33] text-[10px] font-bold uppercase tracking-wider font-mono">
                    {board.tag}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    In Stock
                  </span>
                </div>

                {/* Board Image */}
                <div className="relative w-full aspect-4/3 flex items-center justify-center p-3 rounded-xl bg-slate-50 group-hover:bg-orange-50/40 transition-colors">
                  <Image
                    src={board.image}
                    alt={board.name}
                    width={240}
                    height={180}
                    className="w-full h-auto max-h-36 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Board Info */}
                <div className="mt-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-[#FF6D33] transition-colors">
                    {board.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed flex-1">
                    {board.description}
                  </p>

                  {/* Specs Pills */}
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100">{board.chip}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100">{board.clock}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100">{board.voltage}</span>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Price</span>
                      <div className="text-lg font-black text-slate-900">₹{board.price}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href="/hardware-lab"
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 transition-colors"
                        title="Simulate in Hardware Lab IDE"
                      >
                        <Terminal className="w-4 h-4 text-[#FF6D33]" />
                      </Link>
                      <button
                        onClick={() => handleQuickAdd(board)}
                        className="px-3 py-2 bg-[#FF6D33] hover:bg-[#E3470E] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                      >
                        {addedItem === board.id ? <Check className="w-3.5 h-3.5" /> : null}
                        <span>{addedItem === board.id ? 'Added' : 'Add to Cart'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/products" className="button button--primary button--xl">
              <span>View All 25 Hardware Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. WHY CHOOSE US (Crawled from digicomp.app #why-digicomp)                  */}
      {/* ========================================================================= */}
      <section id="why-digicomp" className="py-16 relative overflow-hidden bg-white">
        <div className="section-container">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span id="why-digicomp-label" className="text-xs font-bold uppercase tracking-widest text-[#FF6D33]">
              WHY CHOOSE US
            </span>
            <h2 id="why-digicomp-title" className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Built Different. Built Better.
            </h2>
            <p id="why-digicomp-subtitle" className="mt-4 text-slate-600 text-base leading-relaxed">
              We combine domestic manufacturing precision with open-source transparency to deliver hardware that engineers can truly trust and build upon.
            </p>
          </div>

          {/* 3 Signature Cards */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Card 1: Make in India */}
            <div className="glass-card p-8 flex flex-col items-center text-center group hover:-translate-y-1.5 transition-all">
              <div className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6 text-4xl group-hover:scale-110 transition-transform">
                🇮🇳
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Make in India</h3>
              <p className="leading-relaxed text-slate-600 text-sm">
                Fully researched, tested, and manufactured locally to eliminate import delays and ensure quality. Every board ships from our facility with complete traceability.
              </p>
            </div>

            {/* Card 2: Transparent Engineering */}
            <div className="glass-card p-8 flex flex-col items-center text-center group hover:-translate-y-1.5 transition-all">
              <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform">
                <BookOpen className="w-10 h-10" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Transparent Engineering</h3>
              <p className="leading-relaxed text-slate-600 text-sm">
                Free schematics, data sheets, and example code with every single product. No paywalls. No restrictions. Complete open-source commitment.
              </p>
            </div>

            {/* Card 3: Industrial Reliability */}
            <div className="glass-card p-8 flex flex-col items-center text-center group hover:-translate-y-1.5 transition-all">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-500 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Industrial Reliability</h3>
              <p className="leading-relaxed text-slate-600 text-sm">
                From 16-Cell BMS to high-speed FPGAs, our boards are tested for rigorous real-world applications. Designed for the lab and the factory floor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. PRODUCT ECOSYSTEM BENTO GRID (Crawled from digicomp.app)                */}
      {/* ========================================================================= */}
      <section id="product-ecosystem" className="py-16 relative bg-slate-900 text-white">
        <div className="section-container">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="uppercase tracking-widest text-xs font-bold text-[#FF6D33]">
              PRODUCT ECOSYSTEM
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-3 mb-4 text-white">
              Hardware That Powers Ideas
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              From rapid prototyping to production deployment — a complete ecosystem of development platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Microcontrollers (Col-Span 2) */}
            <div className="md:col-span-2 bg-slate-800/80 rounded-3xl border border-slate-700/80 p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-xs text-[#FF6D33] font-mono tracking-wider font-bold mb-2">COMPUTE ⏷</div>
                <h3 className="text-2xl font-bold text-white mb-3">Next-Gen Microcontrollers</h3>
                <p className="text-slate-300 text-sm leading-relaxed max-w-xl mb-6">
                  Industry-leading development boards featuring ESP32-S3, RP2040, CH32V003, STM32F030, and TI MSPM0 — each with complete documentation and example code.
                </p>

                {/* Microcontroller Visuals */}
                <div className="flex items-center justify-center gap-4 py-6">
                  <Image
                    src="/images/digicomp/ESP32-S3-front.png"
                    alt="ESP32-S3"
                    width={180}
                    height={135}
                    className="w-28 sm:w-36 object-contain drop-shadow-xl hover:scale-105 transition-transform"
                  />
                  <Image
                    src="/images/digicomp/RP2350-front.png"
                    alt="RP2350"
                    width={180}
                    height={135}
                    className="w-28 sm:w-36 object-contain drop-shadow-xl hover:scale-105 transition-transform -ml-6 z-10"
                  />
                  <Image
                    src="/images/digicomp/CH32V006-front.png"
                    alt="CH32V006"
                    width={180}
                    height={135}
                    className="w-28 sm:w-36 object-contain drop-shadow-xl hover:scale-105 transition-transform -ml-6 z-20"
                  />
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {['ESP32-S3', 'RP2040', 'CH32V003', 'STM32F030', 'TI MSPM0'].map((chip) => (
                    <span key={chip} className="bg-slate-900 border border-slate-700 rounded-full px-3 py-1 text-xs text-slate-300 font-mono">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bento Card 2: Advanced Battery Management */}
            <div className="bg-slate-800/80 rounded-3xl border border-slate-700/80 p-8 flex flex-col justify-between">
              <div>
                <div className="text-xs text-emerald-400 font-mono tracking-wider font-bold mb-2">POWER ⏷</div>
                <h3 className="text-xl font-bold text-white mb-2">Advanced Battery Management</h3>
                <p className="text-slate-300 text-xs leading-relaxed mb-6">
                  Scalable from 1S up to 16S BMS solutions. Industrial-grade protection with precision monitoring.
                </p>

                <ul className="space-y-3">
                  {[
                    '1S to 16S Scalable Architecture',
                    'Over-voltage Protection (OVP)',
                    'Active Cell Balancing',
                    'Over-current Protection (OCP)',
                    'Bluetooth Telemetry'
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bento Card 3: FPGA Platforms */}
            <div className="md:col-span-3 bg-gradient-to-r from-slate-800 to-slate-850 rounded-3xl border border-slate-700/80 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <div className="text-xs text-purple-400 font-mono tracking-wider font-bold mb-2">LOGIC ⏷</div>
                <h3 className="text-2xl font-bold text-white mb-3">Xilinx Artix-7 FPGA Platforms</h3>
                <p className="text-slate-300 text-sm leading-relaxed max-w-2xl mb-6">
                  Xilinx Artix-7 based development board for complex digital logic, signal processing, and hardware acceleration. Dual PMOD connectors, onboard 100MHz oscillator, and 68 accessible GPIOs.
                </p>
                <div className="flex items-center gap-4">
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-3.5 py-1 text-xs font-mono">
                    XC7A35T &bull; 33,280 Logic Cells
                  </span>
                  <Link href="/products/104" className="text-xs font-semibold text-[#FF6D33] hover:underline flex items-center gap-1">
                    View FPGA Specs →
                  </Link>
                </div>
              </div>
              <div className="shrink-0">
                <Image
                  src="/images/digicomp/FPGA-front.png"
                  alt="FPGA Board"
                  width={220}
                  height={165}
                  className="w-48 sm:w-56 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. INNOVATION PIPELINE (COMING SOON) (Crawled from digicomp.app)            */}
      {/* ========================================================================= */}
      <section id="innovation-pipeline" className="py-16 relative bg-white">
        <div className="section-container">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="uppercase tracking-widest text-xs font-bold text-[#FF6D33]">
              COMING SOON
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-3 mb-4 text-slate-900">
              Beyond the Horizon: What’s Next
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              We are actively expanding our ecosystem to bring advanced computing and RF technology to your workbench.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Pipeline Item 1 */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF6D33] mb-5">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">High-Performance Single-Board Computers</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-6">
                  Rockchip-powered SBCs for edge AI, media processing, and industrial IoT applications.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6D33] bg-orange-50 border border-orange-200 rounded-full px-3 py-1 w-fit">
                <span className="w-2 h-2 rounded-full bg-[#FF6D33] animate-pulse" />
                In Development
              </span>
            </div>

            {/* Pipeline Item 2 */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-5">
                  <Radio className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Sub-1GHz & 2.4GHz Wireless Modules</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-6">
                  LoRa, GNSS, and custom RF modules for long-range IoT and precision positioning.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 w-fit">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Beta Test
              </span>
            </div>

            {/* Pipeline Item 3 */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-5">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Industrial Power Electronics</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-6">
                  Buck/Boost converters, Solid State Relays, and next-gen GaN-based power modules.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 border border-purple-200 rounded-full px-3 py-1 w-fit">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                In Development
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. KNOWLEDGE HUB & OPEN SOURCE (Crawled from digicomp.app #knowledge-hub)  */}
      {/* ========================================================================= */}
      <section id="knowledge-hub" className="py-16 bg-slate-900 text-white relative">
        <div className="section-container">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left Content */}
            <div className="flex-1 lg:max-w-lg">
              <span className="uppercase tracking-widest text-xs text-[#FF6D33] font-bold">
                OPEN SOURCE
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3 mb-5 text-white">
                Hardware is only half the product.
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-8">
                We don’t just ship PCBs; we ship solutions. Dive into our comprehensive library of tutorials, open schematics, and production-ready C/C++ and MicroPython examples.
              </p>

              <ul className="space-y-3.5 mb-8">
                {[
                  'Complete schematics for every product',
                  'Production-ready firmware examples',
                  'Step-by-step video tutorials',
                  'Active GitHub repositories (@digicomp-app)'
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                    <div className="w-5 h-5 rounded-full bg-[#FF6D33]/20 flex items-center justify-center text-[#FF6D33] shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="https://docs.digicomp.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button--xl button--primary"
                >
                  <span>Browse the Documentation</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <Link
                  href="/hardware-lab"
                  className="button button--xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-2"
                >
                  <Terminal className="w-4 h-4 text-[#FF6D33]" />
                  <span>Open In Hardware Code Lab</span>
                </Link>
              </div>
            </div>

            {/* Right Terminal Window: Authentic DigiComp C++ Firmware Code */}
            <div className="flex-1 w-full max-w-xl">
              <div className="code-editor">
                <div className="code-editor-header justify-between">
                  <div className="flex items-center">
                    <div className="code-editor-dot" style={{ background: '#FF5F57' }} />
                    <div className="code-editor-dot" style={{ background: '#FEBC2E' }} />
                    <div className="code-editor-dot" style={{ background: '#28C840' }} />
                    <span className="ml-3 text-xs text-slate-400 font-mono">
                      {activeTab === 'esp32' ? 'esp32_s3_firmware.cpp' : 'bms_config.c'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveTab('esp32')}
                      className={`px-2 py-0.5 text-[11px] font-mono rounded ${activeTab === 'esp32' ? 'bg-[#FF6D33] text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      ESP32-S3
                    </button>
                    <button
                      onClick={() => setActiveTab('bms')}
                      className={`px-2 py-0.5 text-[11px] font-mono rounded ${activeTab === 'bms' ? 'bg-[#FF6D33] text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      BMS 16S
                    </button>
                  </div>
                </div>

                <div className="code-editor-body">
                  <pre className="text-xs sm:text-[13px] leading-relaxed font-mono">
                    {activeTab === 'esp32' ? (
                      <code>
                        <span className="text-purple-400">#include</span> <span className="text-green-400">&lt;Arduino.h&gt;</span>{'\n'}
                        <span className="text-purple-400">#include</span> <span className="text-green-400">"digicomp_esp32_s3.h"</span>{'\n\n'}
                        <span className="text-slate-500">// Initialize DigiComp ESP32-S3 on-board RGB LED and sensors</span>{'\n'}
                        <span className="text-blue-400">void</span> <span className="text-yellow-400">setup</span>() {'{\n'}
                        {'  '}<span className="text-blue-400">Serial</span>.<span className="text-yellow-400">begin</span>(<span className="text-orange-400">115200</span>);{'\n'}
                        {'  '}<span className="text-yellow-400">dc_init_system</span>();{'\n'}
                        {'  '}<span className="text-blue-400">Serial</span>.<span className="text-yellow-400">println</span>(<span className="text-green-400">"⚡ DigiComp ESP32-S3 Ready"</span>);{'\n'}
                        {'}\n\n'}
                        <span className="text-blue-400">void</span> <span className="text-yellow-400">loop</span>() {'{\n'}
                        {'  '}<span className="text-yellow-400">dc_set_status_led</span>(<span className="text-orange-400">255</span>, <span className="text-orange-400">109</span>, <span className="text-orange-400">51</span>); <span className="text-slate-500">// Saffron Pulse</span>{'\n'}
                        {'  '}<span className="text-yellow-400">delay</span>(<span className="text-orange-400">500</span>);{'\n'}
                        {'}'}
                      </code>
                    ) : (
                      <code>
                        <span className="text-purple-400">#include</span> <span className="text-green-400">"digicomp_bms.h"</span>{'\n\n'}
                        <span className="text-blue-400">void</span> <span className="text-yellow-400">bms_init</span>(<span className="text-purple-400">bms_config_t</span> *cfg) {'{\n'}
                        {'  '}cfg-&gt;cell_count = <span className="text-orange-400">16</span>;{'\n'}
                        {'  '}cfg-&gt;ovp_threshold = <span className="text-orange-400">4.25f</span>;{'\n'}
                        {'  '}cfg-&gt;uvp_threshold = <span className="text-orange-400">2.80f</span>;{'\n'}
                        {'  '}cfg-&gt;balance_enable = <span className="text-purple-400">true</span>;{'\n\n'}
                        {'  '}<span className="text-yellow-400">dc_bms_configure</span>(cfg);{'\n'}
                        {'  '}<span className="text-yellow-400">dc_bms_start_monitoring</span>();{'\n'}
                        {'}'}
                      </code>
                    )}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. MISSION & VISION (DRIVEN BY PURPOSE) (Crawled from digicomp.app)        */}
      {/* ========================================================================= */}
      <section id="mission-vision" className="py-16 relative overflow-hidden bg-slate-50">
        <div className="section-container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block uppercase tracking-widest text-xs text-[#FF6D33] font-bold mb-3">
              OUR PURPOSE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mb-14 text-slate-900">
              Driven by Purpose
            </h2>

            <div className="space-y-8">
              {/* Vision Card */}
              <div className="text-left bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
                <blockquote className="border-l-4 border-[#FF6D33] pl-6">
                  <span className="font-bold text-lg text-[#FF6D33] block mb-2 font-mono">
                    VISION
                  </span>
                  <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
                    "Build a deeply integrated, self-reliant hardware ecosystem in India by engineering world-class electronic products to eliminate import dependency."
                  </p>
                </blockquote>
              </div>

              {/* Mission Card */}
              <div className="text-left bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
                <blockquote className="border-l-4 border-slate-900 pl-6">
                  <span className="font-bold text-lg text-slate-900 block mb-2 font-mono">
                    MISSION
                  </span>
                  <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
                    "To empower engineers, researchers, and innovators with accessible, rigorously tested hardware solutions. We commit to radical transparency by providing open-source schematics, unrestricted documentation, and production-ready code with every product we manufacture."
                  </p>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. TESTIMONIALS SECTION (Crawled from digicomp.app #testimonials)          */}
      {/* ========================================================================= */}
      <section id="testimonials" className="py-16 bg-white overflow-hidden">
        <div className="section-container">
          <div className="text-center mb-14">
            <span className="inline-block uppercase tracking-widest text-xs text-[#FF6D33] font-bold mb-3">
              TESTIMONIALS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Trusted by Engineers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-orange-200 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-4">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 italic text-sm sm:text-base leading-relaxed mb-6">
                    “{item.quote}”
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.author}</h4>
                    <p className="text-xs text-slate-500">{item.role}, <span className="font-medium text-slate-700">{item.company}</span></p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-[#FF6D33] flex items-center justify-center font-bold text-xs">
                    {item.author[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FROM THE ENGINEERING DESK (BLOG) (Crawled from digicomp.app #news-blog) */}
      {/* ========================================================================= */}
      <section id="news-blog" className="py-16 bg-slate-50/80 border-t border-slate-200/80">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="inline-block uppercase tracking-widest text-xs text-[#FF6D33] font-bold mb-3">
              INSIGHTS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              From the Engineering Desk
            </h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto mt-2">
              Deep dives, tutorials, and updates from our hardware engineering team.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <article className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 hover:border-orange-300 hover:shadow-lg transition-all group">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-orange-50 text-[#FF6D33] border border-orange-200">
                  Open Source
                </span>
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  PCB Design
                </span>
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Schematics
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-[#FF6D33] transition-colors mb-3">
                Why We Open Source Our Schematics
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Most hardware companies treat schematics as guarded secrets. At Digicomp, we believe transparent hardware is the foundation of trustworthy innovation. Here is why we release unrestricted Gerber files, KiCad schematics, and pinout diagrams for every board we make.
              </p>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>August 31, 2026</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>4 min read</span>
                  </span>
                </div>

                <a
                  href="https://docs.digicomp.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#FF6D33] hover:underline flex items-center gap-1"
                >
                  <span>Read Article</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
