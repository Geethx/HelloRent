"use client";

import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Check, ShieldCheck, Clock, MessageCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import BookingModal from "@/components/BookingModal";

export default function ItemDetailPage() {
  const params = useParams();
  const [item, setItem] = useState(null);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchItem();
    }
  }, [params.id]);

  const fetchItem = async () => {
    setLoading(true);
    
    // Fetch Item
    const { data: itemData, error: itemError } = await supabase
      .from('items')
      .select('*, categories(name)')
      .eq('id', params.id)
      .single();

    if (itemError) {
      console.error(itemError);
      setLoading(false);
      return;
    }
    
    setItem(itemData);

    // Fetch Addons if it's a scooter
    const { data: addonData } = await supabase
      .from('addons')
      .select('*')
      .eq('item_id', params.id);
    
    setAddons(addonData || []);
    
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
      <p className="text-slate-500">Loading details...</p>
    </div>
  );

  if (!item) return <div className="p-24 text-center">Item not found</div>;
  const toggleAddon = (addonName) => {
    setSelectedAddons(prev => 
      prev.includes(addonName) 
      ? prev.filter(a => a !== addonName)
      : [...prev, addonName]
    );
  };

  const totalPrice = item.price + selectedAddons.reduce((acc, name) => {
    const addon = addons.find(a => a.name === name);
    return acc + (addon ? parseFloat(addon.price) : 0);
  }, 0);

  const whatsappMessage = `Hi! I'm interested in renting the ${item.name}. ${
    selectedAddons.length > 0 ? `I'd also like these add-ons: ${selectedAddons.join(", ")}.` : ""
  } Is it available?`;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <Link href="/rentals" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft size={16} /> Back to Fleet
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Images */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10">
              <Image
                src={item.image_url || "/hero.png"}
                alt={item.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </motion.div>

          {/* Right: Info & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-8">
              <div className="text-amber-500 font-bold text-xs uppercase tracking-widest mb-2">
                {item.categories?.name} / {item.sub_category}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{item.name}</h1>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">LKR {totalPrice}</span>
                <span className="text-slate-500">per day</span>
              </div>
            </div>

            <p className="text-slate-400 font-sans leading-relaxed mb-8">
              {item.description}
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {item.features?.map(f => (
                <div key={f} className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="shrink-0 text-emerald-500"><Check size={16} /></div>
                  {f}
                </div>
              ))}
            </div>

            {/* Add-ons */}
            {addons.length > 0 && (
              <div className="mb-8">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  Add-ons <span className="text-xs font-normal text-slate-500">(Optional)</span>
                </h4>
                <div className="space-y-3">
                  {addons.map(addon => (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddon(addon.name)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        selectedAddons.includes(addon.name)
                        ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                        : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          selectedAddons.includes(addon.name) ? "bg-amber-500 border-amber-500" : "border-white/20"
                        }`}>
                          {selectedAddons.includes(addon.name) && <Check size={14} className="text-slate-950" />}
                        </div>
                        <span className="font-medium text-sm">{addon.name}</span>
                      </div>
                      <span className="text-xs">+LKR {addon.price}/day</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`https://wa.me/94700000000?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-4 rounded-full font-bold bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                <MessageCircle size={20} className="text-emerald-500" />
                Inquiry
              </a>
              <button 
                onClick={() => setIsBookingOpen(true)}
                className="btn-premium flex items-center justify-center gap-2 py-4"
              >
                Book Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 gap-8">
              <div className="flex gap-3">
                <ShieldCheck className="text-slate-500 shrink-0" size={20} />
                <div className="text-[10px] uppercase tracking-tighter text-slate-500 leading-tight">
                  <strong className="text-slate-300 block mb-1">Insured</strong>
                  Comprehensive cover included
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="text-slate-500 shrink-0" size={20} />
                <div className="text-[10px] uppercase tracking-tighter text-slate-500 leading-tight">
                  <strong className="text-slate-300 block mb-1">Flexible</strong>
                  Free cancellation up to 24h
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        item={item}
        addons={selectedAddons}
        totalPrice={totalPrice}
      />
    </div>
  );
}
