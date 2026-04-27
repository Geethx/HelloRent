"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Plus, Edit, Trash2, Loader2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    price: "",
    description: "",
    image_url: "",
    sub_category: "",
    features: "" // Comma separated for input
  });

  useEffect(() => {
    checkUser();
    fetchData();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) router.push("/login");
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: cats } = await supabase.from('categories').select('*');
    setCategories(cats || []);
    const { data: its } = await supabase.from('items').select('*, categories(name)');
    setItems(its || []);
    setLoading(false);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('items').insert([{
      ...formData,
      price: parseFloat(formData.price),
      features: formData.features.split(',').map(f => f.trim())
    }]);

    if (error) {
      alert(error.message);
    } else {
      setIsAdding(false);
      setFormData({ name: "", category_id: "", price: "", description: "", image_url: "", sub_category: "", features: "" });
      fetchData();
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await supabase.from('items').delete().eq('id', id);
      fetchData();
    }
  };

  if (loading && items.length === 0) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <Link href="/admin" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="btn-premium px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
          >
            {isAdding ? "Cancel" : <><Plus size={18} /> Add New Item</>}
          </button>
        </div>

        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 mb-12"
          >
            <h2 className="text-xl font-bold mb-6">Add New Rental Item</h2>
            <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Item Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 mt-1 outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Category</label>
                  <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 mt-1 outline-none focus:border-amber-500/50">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Price (per day)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 mt-1 outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Image URL</label>
                  <input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 mt-1 outline-none focus:border-amber-500/50" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Features (Comma separated)</label>
                  <input value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 mt-1 outline-none focus:border-amber-500/50" placeholder="Automatic, GPS, Helmet" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Description</label>
                  <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 mt-1 outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="w-full btn-premium py-4 font-bold">Save Item to Fleet</button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {items.map(item => (
            <div key={item.id} className="glass-card p-4 flex items-center justify-between group">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-xl overflow-hidden relative border border-white/10">
                  {item.image_url ? <img src={item.image_url} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center bg-white/5 text-slate-600"><ImageIcon size={24} /></div>}
                </div>
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <div className="flex gap-4 text-xs text-slate-500 mt-1 uppercase tracking-widest">
                    <span>{item.categories?.name}</span>
                    <span>${item.price}/day</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"><Edit size={18} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
