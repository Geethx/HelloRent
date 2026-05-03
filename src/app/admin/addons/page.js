"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Plus, Trash2, Edit, Save, X, Loader2, Info, LogOut } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AddonsManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addons, setAddons] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAddon, setNewAddon] = useState({ name: "", price: "" });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from('items').select('id, name');
    setItems(data || []);
    if (data?.length > 0) {
      setSelectedItem(data[0]);
      fetchAddons(data[0].id);
    }
    setLoading(false);
  };

  const fetchAddons = async (itemId) => {
    const { data } = await supabase.from('addons').select('*').eq('item_id', itemId);
    setAddons(data || []);
  };

  const handleAddItemAddon = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const { error } = await supabase.from('addons').insert([{
      item_id: selectedItem.id,
      name: newAddon.name,
      price: parseFloat(newAddon.price)
    }]);

    if (error) alert(error.message);
    else {
      setNewAddon({ name: "", price: "" });
      setIsAdding(false);
      fetchAddons(selectedItem.id);
    }
  };

  const deleteAddon = async (id) => {
    if (confirm("Delete this addon?")) {
      await supabase.from('addons').delete().eq('id', id);
      fetchAddons(selectedItem.id);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center" suppressHydrationWarning>
      <Loader2 className="animate-spin text-amber-500" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300" suppressHydrationWarning>
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <Link href="/admin" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-2">
              <ArrowLeft size={18} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white">Manage <span className="text-amber-500">Addons</span></h1>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
              className="px-4 py-2 bg-white/5 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-xl transition-all text-xs font-bold flex items-center gap-2"
            >
              <LogOut size={16} /> Logout
            </button>
            <div className="w-full md:w-64">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Select Item</label>
              <select 
                value={selectedItem?.id} 
                onChange={(e) => {
                  const item = items.find(i => i.id === e.target.value);
                  setSelectedItem(item);
                  fetchAddons(item.id);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 mt-1 outline-none focus:border-amber-500/50 appearance-none cursor-pointer text-white"
                style={{ backgroundColor: '#070d24' }}
              >
                {items.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Info Card */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center gap-3 text-amber-500 mb-4">
                <Info size={20} />
                <h3 className="font-bold">About Addons</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Addons are optional extras that customers can choose when booking. These are usually items like:
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">• Extra Helmet (Scooters)</li>
                <li className="flex items-center gap-2">• Surf Rack (Scooters)</li>
                <li className="flex items-center gap-2">• Phone Holder</li>
                <li className="flex items-center gap-2">• Breakfast (Rooms)</li>
              </ul>
            </div>
          </div>

          {/* Right: Addons List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-white uppercase tracking-widest text-sm">Active Addons for {selectedItem?.name}</h2>
              <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl font-bold text-sm hover:bg-amber-400 transition-colors"
              >
                <Plus size={16} /> Add New
              </button>
            </div>

            <AnimatePresence>
              {isAdding && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card p-4 border-amber-500/50 bg-amber-500/5 mb-6"
                >
                  <form onSubmit={handleAddItemAddon} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-grow">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Addon Name</label>
                      <input 
                        required 
                        placeholder="e.g. Extra Helmet"
                        value={newAddon.name} 
                        onChange={e => setNewAddon({...newAddon, name: e.target.value})} 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 mt-1 outline-none focus:border-amber-500/50"
                      />
                    </div>
                    <div className="w-full md:w-32">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Price (LKR)</label>
                      <input 
                        required 
                        type="number"
                        placeholder="500"
                        value={newAddon.price} 
                        onChange={e => setNewAddon({...newAddon, price: e.target.value})} 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 mt-1 outline-none focus:border-amber-500/50"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-400"><Save size={20} /></button>
                      <button type="button" onClick={() => setIsAdding(false)} className="p-2.5 bg-white/5 text-slate-400 rounded-xl hover:bg-white/10"><X size={20} /></button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {addons.length === 0 ? (
              <div className="glass-card p-12 text-center border-dashed border-white/5">
                <p className="text-slate-500">No addons found for this item.</p>
              </div>
            ) : (
              addons.map(addon => (
                <div key={addon.id} className="glass-card p-4 flex items-center justify-between group">
                  <div>
                    <h3 className="font-bold text-white">{addon.name}</h3>
                    <p className="text-amber-500 text-xs font-bold mt-1">LKR {addon.price} / day</p>
                  </div>
                  <button 
                    onClick={() => deleteAddon(addon.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
