"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, User, Phone, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function BookingModal({ isOpen, onClose, item, selectedAddons, totalPrice }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    startDate: "",
    endDate: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const calculateTotal = () => {
    if (!formData.startDate || !formData.endDate) return totalPrice;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    return totalPrice * diffDays;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const finalTotal = calculateTotal();

    const { error } = await supabase.from('bookings').insert([{
      item_id: item.id,
      customer_name: formData.name,
      customer_phone: formData.phone,
      start_date: formData.startDate,
      end_date: formData.endDate,
      total_price: finalTotal,
      selected_addons: selectedAddons,
      status: 'pending'
    }]);

    if (error) {
      alert("Booking failed: " + error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg glass-card p-8 overflow-hidden"
      >
        {success ? (
          <div className="py-12 text-center">
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle size={40} />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Booking Requested!</h2>
            <p className="text-slate-400">We will contact you shortly on WhatsApp or Phone to confirm your rental.</p>
          </div>
        ) : (
          <>
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white">
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-2">Complete Your <span className="text-amber-400">Booking</span></h2>
            <p className="text-slate-400 text-sm mb-8">Renting: <span className="text-white font-bold">{item?.name}</span></p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      required 
                      type="date" 
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.startDate} 
                      onChange={e => setFormData({...formData, startDate: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-amber-500/50 outline-none text-slate-300" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      required 
                      type="date" 
                      min={formData.startDate || new Date().toISOString().split("T")[0]}
                      value={formData.endDate} 
                      onChange={e => setFormData({...formData, endDate: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-amber-500/50 outline-none text-slate-300" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-amber-500/50 outline-none text-white" placeholder="John Doe" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Phone / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-amber-500/50 outline-none text-white" placeholder="+94 77 123 4567" />
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 mb-6 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Estimated Total</span>
                  <span className="text-xl font-bold text-amber-500">LKR {calculateTotal()}</span>
                </div>
              </div>

              <button disabled={loading} className="w-full btn-premium py-4 font-bold flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Confirm Booking Request"}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
