"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Bike, Home, Car, Navigation, Shield, Clock, Heart, Phone } from "lucide-react";

export default function LandingPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*');
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  return (
    <div className="relative overflow-hidden bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.png"
            alt="Sri Lanka Paradise"
            fill
            sizes="100vw"
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/40 to-slate-950"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0.01, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-6">
              Experience <span className="gold-gradient-text">Freedom</span> <br />
              in Paradise
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
              Premium scooter and room rentals across Sri Lanka. Explore the island 
              with our well-maintained fleet and stay in curated local escapes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="btn-premium w-full sm:w-auto text-lg">
                Explore Rentals
              </button>
              <button className="px-8 py-3 rounded-full font-semibold border border-white/20 hover:bg-white/10 transition-all">
                View Rooms
              </button>
            </div>
          </motion.div>
        </div>

        {/* Stats / Quick Info */}
        <div className="absolute bottom-10 left-0 right-0 z-10 hidden md:block">
          <div className="max-w-5xl mx-auto grid grid-cols-4 gap-8 px-6">
            {[
              { label: "Fleet Size", value: "50+" },
              { label: "Happy Clients", value: "2k+" },
              { label: "Local Support", value: "24/7" },
              { label: "Best Price", value: "Guaranteed" },
            ].map((stat) => (
              <div key={stat.label} className="text-center border-l border-white/10 first:border-0">
                <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
                <div className="text-xs uppercase tracking-widest text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section id="rentals" className="py-24 relative px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Our <span className="text-amber-400">Rentals</span></h2>
              <p className="text-slate-400 max-w-lg font-sans">
                From two wheels to luxury villas, we provide everything you need for the perfect Sri Lankan adventure.
              </p>
            </div>
            <div className="text-sm font-medium text-slate-500 border-b border-white/10 pb-2">
              SCROLL TO EXPLORE
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => {
              // Helper to match icons and details to DB categories
              const details = {
                scooters: { icon: <Bike />, desc: "110cc & 125cc available", tag: "Popular" },
                apartments: { icon: <Home />, desc: "Luxury & Budget stays", tag: "Best Value" },
                tuktuks: { icon: <Navigation />, desc: "Local experience", tag: "Authentic" },
                cars: { icon: <Car />, desc: "Travel in comfort", tag: "Premium" },
                bicycles: { icon: <Bike />, desc: "Eco-friendly exploration", tag: "Leisure" },
              }[cat.slug] || { icon: <Package />, desc: "Explore our fleet", tag: "New" };

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-8 group hover:border-amber-500/50 transition-all cursor-pointer"
                >
                  <Link href={`/rentals?category=${cat.slug}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-500">
                        {details.icon}
                      </div>
                      <span className="text-[10px] uppercase tracking-widest bg-white/10 px-2 py-1 rounded">
                        {details.tag}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-amber-400 transition-colors">{cat.name}</h3>
                    <p className="text-slate-400 text-sm mb-6 font-sans">{details.desc}</p>
                    <div className="flex items-center text-amber-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                      Explore {cat.name} →
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Us Section (About) */}
      <section id="about" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <Image 
                src="/hero.png" 
                alt="Local Experience" 
                fill 
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-amber-500/10 mix-blend-overlay"></div>
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-8">Why <span className="gold-gradient-text">Hello Rent</span>?</h2>
              <div className="space-y-8">
                {[
                  { icon: <Shield />, title: "Fully Insured", text: "Ride with peace of mind. All our vehicles come with comprehensive insurance coverage." },
                  { icon: <Clock />, title: "24/7 Support", text: "Stuck on the road? Our local team is just a call away to assist you anytime, anywhere." },
                  { icon: <Heart />, title: "Well Maintained", text: "We take pride in our fleet. Every bike and room is cleaned and serviced before every rental." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-amber-400 border border-white/10">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                      <p className="text-slate-400 text-sm font-sans">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Floating */}
      <a
        href="https://wa.me/94700000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 p-4 bg-emerald-500 text-white rounded-full shadow-2xl hover:scale-110 transition-all active:scale-95 group"
      >
        <Phone size={24} />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 border border-white/10 pointer-events-none">
          Chat with us
        </span>
      </a>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-slate-500 text-sm">
          <div>© 2024 HELLO RENT SRI LANKA. All rights reserved.</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
