"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";

export default function RentalsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Read ?category= from URL to pre-select
    const catParam = searchParams.get("category");
    if (catParam) {
      setSelectedCategory(catParam);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch Categories
    const { data: catData } = await supabase.from("categories").select("*");
    setCategories(catData || []);

    // Fetch Items
    const { data: itemData } = await supabase.from("items").select("*");
    setItems(itemData || []);

    setLoading(false);
  };

  const filteredItems = items.filter((item) => {
    const categoryMatch =
      selectedCategory === "all" ||
      categories.find((c) => c.slug === selectedCategory)?.id ===
        item.category_id;

    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return categoryMatch && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Our <span className="gold-gradient-text">Fleet</span>
          </h1>
          <p className="text-slate-400 max-w-xl font-sans">
            Browse our curated selection of scooters, apartments, and vehicles.
            Everything is maintained to the highest standards.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-amber-500 text-slate-950"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat.slug
                    ? "bg-amber-500 text-slate-950"
                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search fleet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-6 text-sm focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
              <p className="text-slate-500 animate-pulse">
                Fetching paradise fleet...
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => router.push(`/rentals/${item.id}`)}
                  className="glass-card overflow-hidden group cursor-pointer"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.image_url || "/hero.png"} // Use image_url from DB
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg text-amber-400 font-bold text-sm">
                      LKR {item.price}
                      <span className="text-[10px] text-slate-400 ml-1">
                        / day
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-2">
                      {item.sub_category}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{item.name}</h3>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2 font-sans">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                        View Details
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-24">
            <p className="text-slate-500 italic">
              No items found matching your criteria.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
