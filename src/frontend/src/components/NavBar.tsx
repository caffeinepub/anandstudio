import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "@tanstack/react-router";
import { Camera, Menu, MoreVertical, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [galleryToken, setGalleryToken] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const openGallery = () => {
    const token = galleryToken.trim();
    if (!token) return;
    setPopoverOpen(false);
    setGalleryToken("");
    navigate({ to: "/gallery/$token", params: { token } });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 group"
          data-ocid="nav.link"
        >
          <Camera className="w-5 h-5 text-primary" />
          <span className="font-display text-lg md:text-xl text-foreground tracking-widest uppercase">
            Anandstudio
          </span>
        </a>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <button
                type="button"
                onClick={() => scrollTo(link.href)}
                className="text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-200"
                data-ocid="nav.link"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Right side — 3-dot popover */}
        <div className="flex items-center">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                aria-label="Client gallery access"
                data-ocid="nav.open_modal_button"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-72 bg-card border border-border shadow-xl p-4"
              data-ocid="nav.popover"
            >
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1">
                Client Gallery Access
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Enter the code or token from your link
              </p>
              <Input
                placeholder="e.g. abc123"
                value={galleryToken}
                onChange={(e) => setGalleryToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && openGallery()}
                className="mb-3 bg-background border-border text-sm"
                data-ocid="nav.input"
              />
              <Button
                size="sm"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 tracking-widest text-xs uppercase"
                disabled={!galleryToken.trim()}
                onClick={openGallery}
                data-ocid="nav.primary_button"
              >
                Open Gallery
              </Button>
            </PopoverContent>
          </Popover>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden text-foreground ml-1"
            onClick={() => setMobileOpen((v) => !v)}
            data-ocid="nav.toggle"
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background/98 backdrop-blur-md border-b border-border px-6 pb-6"
          >
            <ul className="flex flex-col gap-4 pt-4">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => scrollTo(link.href)}
                    className="text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground w-full text-left"
                    data-ocid="nav.link"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
