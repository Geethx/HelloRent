"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { 
  Loader2, Box, Plus, Settings, Clock, CheckCircle, Calendar, 
  Phone, Trash2, ArrowLeft, XCircle, LogOut, Package
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*, items(name)')
      .order('created_at', { ascending: false });
    setBookings(data || []);
    setLoading(false);
  };

  const updateBookingStatus = async (id, status) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);
    
    if (error) alert(error.message);
    else fetchBookings();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center" suppressHydrationWarning>
      <Loader2 className="animate-spin text-amber-500" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 font-sans" suppressHydrationWarning>
      
      <main className="pt-10 pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin <span className="text-amber-500">Dashboard</span></h1>
            <p className="text-slate-500 text-sm mt-1">Welcome back, {user?.email}</p>
          </div>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="bg-white/5 border border-white/10 text-slate-400 px-6 py-2 rounded-xl text-sm font-bold hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center gap-2"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-card p-6 flex items-center justify-between">
            <div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">New Bookings</div>
              <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'pending').length}</div>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
              <Clock size={24} />
            </div>
          </div>
          <div className="glass-card p-6 flex items-center justify-between">
            <div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Bookings</div>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
              <CheckCircle size={24} />
            </div>
          </div>
          <div className="glass-card p-6 flex items-center justify-between">
            <div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Revenue</div>
              <div className="text-2xl font-bold">LKR {bookings.reduce((acc, curr) => acc + (curr.total_price || 0), 0)}</div>
            </div>
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
              <Calendar size={24} />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link href="/admin/inventory" className="glass-card p-6 flex items-center gap-4 hover:border-amber-500/50 transition-all group">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Box size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white">Manage Fleet</h3>
                <p className="text-xs text-slate-500">Add or edit vehicles and rooms</p>
              </div>
            </Link>

            <Link href="/admin/addons" className="glass-card p-6 flex items-center gap-4 hover:border-amber-500/50 transition-all group">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white">Manage Addons</h3>
                <p className="text-xs text-slate-500">Edit prices for Surf Racks, Helmets, etc.</p>
              </div>
            </Link>

            <div className="glass-card p-6 flex items-center gap-4 border-white/5 opacity-50">
              <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center">
                <Settings size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white">Settings</h3>
                <p className="text-xs text-slate-500">Coming soon</p>
              </div>
            </div>
        </div>

        {/* Bookings Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/2">
            <h3 className="font-bold">Recent Bookings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-slate-500 border-b border-white/5">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {bookings.map((bk) => (
                  <tr key={bk.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{bk.customer_name}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 uppercase tracking-tighter">
                        <Phone size={10} /> {bk.customer_phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{bk.items?.name}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{bk.start_date} to {bk.end_date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        bk.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' : 
                        bk.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {bk.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">LKR {bk.total_price}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {bk.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => updateBookingStatus(bk.id, 'confirmed')}
                              className="p-2 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-all"
                              title="Confirm Booking"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => updateBookingStatus(bk.id, 'cancelled')}
                              className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"
                              title="Cancel Booking"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bookings.length === 0 && (
            <div className="p-12 text-center text-slate-500 italic">No bookings found.</div>
          )}
        </div>
      </main>
    </div>
  );
}
