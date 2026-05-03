"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Loader2, ArrowLeft, Image as ImageIcon, X, LogOut } from "lucide-react";
import Link from "next/link";

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  const [editingId, setEditingId] = useState(null);

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
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: cats } = await supabase.from('categories').select('*');
    setCategories(cats || []);
    const { data: its } = await supabase.from('items').select('*, categories(name)');
    setItems(its || []);
    setLoading(false);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      category_id: item.category_id,
      price: item.price.toString(),
      description: item.description,
      image_url: item.image_url,
      sub_category: item.sub_category,
      features: item.features.join(', ')
    });
    setIsAdding(true);
  };

  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `items/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.image_url;

      if (selectedFile) {
        setUploading(true);
        finalImageUrl = await uploadImage(selectedFile);
        setUploading(false);
      }

      const payload = {
        ...formData,
        image_url: finalImageUrl,
        price: parseFloat(formData.price),
        features: formData.features.split(',').map(f => (f && typeof f === 'string') ? f.trim() : f).filter(f => f !== "")
      };

      console.log("Submitting payload:", payload);

      let error;
      if (editingId) {
        const { error: err } = await supabase.from('items').update(payload).eq('id', editingId);
        error = err;
      } else {
        const { data, error: err } = await supabase.from('items').insert([payload]).select();
        console.log("Insert Response:", { data, err });
        error = err;
      }

      if (error) {
        console.error("Supabase Error Details:", error);
        throw error;
      }

      setIsAdding(false);
      setEditingId(null);
      setSelectedFile(null);
      setFormData({ name: "", category_id: "", price: "", description: "", image_url: "", sub_category: "", features: "" });
      fetchData();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await supabase.from('items').delete().eq('id', id);
      fetchData();
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center" suppressHydrationWarning>
      <Loader2 className="animate-spin text-amber-500" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-6" suppressHydrationWarning>
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <Link href="/admin" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
          <div className="flex gap-4">
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
              className="px-4 py-2 bg-white/5 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-xl transition-all text-xs font-bold flex items-center gap-2"
            >
              <LogOut size={16} /> Logout
            </button>
            <button 
              onClick={() => {
                setIsAdding(!isAdding);
                if (isAdding) setEditingId(null);
              }}
              className="btn-premium px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              {isAdding ? <X size={18} /> : <Plus size={18} />}
              {isAdding ? "Cancel" : "Add New Item"}
            </button>
          </div>
        </div>

        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 mb-12"
          >
            <h2 className="text-xl font-bold mb-6">{editingId ? "Edit Rental Item" : "Add New Rental Item"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Item Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 mt-1 outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Category</label>
                  <select 
                    required 
                    value={formData.category_id} 
                    onChange={e => setFormData({...formData, category_id: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 mt-1 outline-none focus:border-amber-500/50 appearance-none cursor-pointer text-white"
                    style={{ backgroundColor: '#070d24ff' }} // Force dark background for dropdown list
                  >
                    <option value="" className="bg-slate-950 text-slate-500">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-950 text-white py-2">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub-category for Scooters */}
                {categories.find(c => c.id === formData.category_id)?.slug === 'scooters' && (
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Engine Type</label>
                    <select 
                      required 
                      value={formData.sub_category} 
                      onChange={e => setFormData({...formData, sub_category: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 mt-1 outline-none focus:border-amber-500/50 appearance-none cursor-pointer text-white"
                      style={{ backgroundColor: '#070d24ff' }}
                    >
                      <option value="">Select CC</option>
                      <option value="110cc">110cc</option>
                      <option value="125cc">125cc</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                    {categories.find(c => c.id === formData.category_id)?.slug === 'apartments' ? "Price (per night in lkr)" : "Price (per day in lkr)"}
                  </label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 mt-1 outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Upload Image</label>
                  <div className="mt-1 flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full bg-white/5 border border-white/10 border-dashed rounded-xl py-4 flex flex-col items-center justify-center hover:bg-white/10 transition-all">
                        <ImageIcon size={24} className="text-slate-500 mb-2" />
                        <span className="text-xs text-slate-400">
                          {selectedFile ? selectedFile.name : "Click to upload from device"}
                        </span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => setSelectedFile(e.target.files[0])} 
                      />
                    </label>
                  </div>
                  {formData.image_url && !selectedFile && (
                    <p className="text-[10px] text-slate-500 mt-2">Current image active</p>
                  )}
                </div>
                
                {/* Dynamically hide Features for Apartments */}
                {categories.find(c => c.id === formData.category_id)?.slug !== 'apartments' && (
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Features (Comma separated)</label>
                    <input value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 mt-1 outline-none focus:border-amber-500/50" placeholder="Automatic, GPS, Helmet" />
                  </div>
                )}

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Description</label>
                  <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 mt-1 outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={loading} className="w-full btn-premium py-4 font-bold flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : (uploading ? "Uploading Image..." : (editingId ? "Update Item" : "Save Item to Fleet"))}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {items.length === 0 && !loading ? (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-slate-600">
                <Plus size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-300">No items in inventory</h3>
              <p className="text-slate-500 mt-2 text-sm">Your fleet is empty.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="glass-card p-4 flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl overflow-hidden relative border border-white/10">
                    {item.image_url ? <img src={item.image_url} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center bg-white/5 text-slate-600"><ImageIcon size={24} /></div>}
                  </div>
                  <div>
                    <h3 className="font-bold">{item.name}</h3>
                    <div className="flex gap-4 text-xs text-slate-500 mt-1 uppercase tracking-widest">
                      <span>{item.categories?.name}</span>
                      <span>LKR {item.price}/day</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(item)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
