"use client";

import { useState } from "react";
import { X, Calendar, User, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingModal({ isOpen, onClose, item, addons, totalPrice }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    startDate: "",
    endDate: "",
    notes: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Booking Data:", { ...formData, item, addons, totalPrice });
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      onClose();
      setIsSuccess(false);
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            {isSuccess ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <X size={40} className="rotate-45" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-white">Booking Sent!</h2>
                <p className="text-slate-400 font-sans">
                  We've received your request for the <strong>{item.name}</strong>. 
                  Our team will contact you shortly on WhatsApp to confirm.
                </p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-xl font-bold">Secure Your <span className="text-amber-400">Rental</span></h2>
                  <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={24} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  {/* Summary */}
                  <div className="p-4 bg-white/5 rounded-2xl flex items-center gap-4">
                    <div className="w-16 h-12 relative rounded-lg overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{item.name}</div>
                      <div className="text-xs text-slate-500">${totalPrice} Total / day</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                        <input
                          required
                          type="text"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-amber-500/50 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Phone (WhatsApp)</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                        <input
                          required
                          type="tel"
                          placeholder="+94 ..."
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-amber-500/50 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Start Date</label>
                      <input
                        required
                        type="date"
                        value={formData.startDate}
                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:border-amber-500/50 outline-none transition-all text-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">End Date</label>
                      <input
                        required
                        type="date"
                        value={formData.endDate}
                        onChange={e => setFormData({...formData, endDate: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:border-amber-500/50 outline-none transition-all text-slate-400"
                      />
                    </div>
                  </div>

                  <button
                    disabled={isSubmitting}
                    className="w-full btn-premium py-4 text-lg mt-4 disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : "Confirm Booking"}
                  </button>
                  
                  <p className="text-[10px] text-center text-slate-500 uppercase tracking-tighter">
                    No payment required now. We will verify availability first.
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
