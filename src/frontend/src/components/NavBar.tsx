import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Camera, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

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
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin } = useIsAdmin();
  const isAuthenticated = !!identity;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "";
        if (msg === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
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
        <Link
          to="/"
          className="flex items-center gap-2 group"
          data-ocid="nav.link"
        >
          <Camera className="w-5 h-5 text-primary" />
          <span className="font-display text-lg md:text-xl text-foreground tracking-widest uppercase">
            Anandstudio
          </span>
        </Link>

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

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {isAdmin && (
            <Link to="/admin">
              <Button
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground tracking-widest text-xs uppercase"
                data-ocid="nav.primary_button"
              >
                Admin
              </Button>
            </Link>
          )}
          <Button
            onClick={handleAuth}
            disabled={loginStatus === "logging-in"}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 tracking-widest text-xs uppercase"
            data-ocid="nav.secondary_button"
          >
            {loginStatus === "logging-in"
              ? "..."
              : isAuthenticated
                ? "Logout"
                : "Login"}
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen((v) => !v)}
          data-ocid="nav.toggle"
        >
          {mobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
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
              <li className="pt-2 flex flex-col gap-2">
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-primary text-primary tracking-widest text-xs uppercase"
                      data-ocid="nav.primary_button"
                    >
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  onClick={handleAuth}
                  disabled={loginStatus === "logging-in"}
                  size="sm"
                  className="w-full bg-primary text-primary-foreground tracking-widest text-xs uppercase"
                  data-ocid="nav.secondary_button"
                >
                  {isAuthenticated ? "Logout" : "Login"}
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
