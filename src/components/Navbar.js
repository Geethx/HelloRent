"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(""); // tracks #id in view
  const pathname = usePathname();

  const router = useRouter();

  // Scroll detection for navbar background
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IntersectionObserver to track which homepage section is in view
  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("");
      return;
    }
    const sectionIds = ["home", "rentals", "rooms", "about"];
    const observers = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [pathname]);

  // Navigate to a section — works from any page
  const goToSection = (e, sectionId) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (pathname === "/") {
      // Already on homepage — smooth scroll + update URL
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", `/#${sectionId}`);
    } else {
      // Client-side navigate to the homepage with the hash
      router.push(`/#${sectionId}`);
    }
  };

  const navLinks = [
    { name: "Home",    href: "/",         type: "page" },
    { name: "Rentals", href: "/rentals",  type: "page" },
    { name: "Rooms",   sectionId: "rooms", type: "section" },
    { name: "About",   sectionId: "about", type: "section" },
  ];

  const isLinkActive = (link) => {
    if (link.type === "page") {
      if (link.href === "/") return pathname === "/" && (activeSection === "home" || !activeSection);
      return pathname.startsWith(link.href);
    }
    // Section links: only active when on homepage AND that section is in view
    return pathname === "/" && activeSection === link.sectionId;
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4",
        isScrolled ? "bg-slate-950/80 backdrop-blur-xl" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
          <span className="gold-gradient-text">HELLO</span>
          <span className="text-white">RENT</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isLinkActive(link);
            if (link.type === "page") {
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors relative",
                    active ? "text-amber-400" : "text-slate-300 hover:text-amber-400"
                  )}
                >
                  {link.name}
                  {active && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-amber-400 rounded-full" />
                  )}
                </Link>
              );
            }
            // Section link
            return (
              <button
                key={link.name}
                onClick={(e) => goToSection(e, link.sectionId)}
                className={cn(
                  "text-sm font-medium transition-colors relative bg-transparent border-0 cursor-pointer",
                  active ? "text-amber-400" : "text-slate-300 hover:text-amber-400"
                )}
              >
                {link.name}
                {active && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-amber-400 rounded-full" />
                )}
              </button>
            );
          })}

          <a
            href="https://wa.me/94700000000"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-premium flex items-center gap-2"
          >
            <Phone size={18} />
            Contact
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-slate-900 border-b border-white/10 p-6 md:hidden flex flex-col gap-6"
          >
            {navLinks.map((link) => {
              const active = isLinkActive(link);
              if (link.type === "page") {
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "text-lg font-medium transition-colors",
                      active ? "text-amber-400" : "text-slate-300"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              }
              return (
                <button
                  key={link.name}
                  onClick={(e) => goToSection(e, link.sectionId)}
                  className={cn(
                    "text-lg font-medium transition-colors text-left bg-transparent border-0 cursor-pointer",
                    active ? "text-amber-400" : "text-slate-300"
                  )}
                >
                  {link.name}
                </button>
              );
            })}
            <a
              href="https://wa.me/94700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium text-center"
            >
              Contact Us
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
