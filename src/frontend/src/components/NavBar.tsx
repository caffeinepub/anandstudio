import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useActor } from "@/hooks/useActor";
import { useNavigate } from "@tanstack/react-router";
import {
  AlignJustify,
  Camera,
  Eye,
  EyeOff,
  Menu,
  MoreVertical,
  X,
} from "lucide-react";
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
  const [adminPopoverOpen, setAdminPopoverOpen] = useState(false);
  const [adminIdentifier, setAdminIdentifier] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const navigate = useNavigate();
  const { actor } = useActor();

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

  const handleAdminIconClick = async () => {
    if (!actor) {
      setAdminPopoverOpen(true);
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isSetup: boolean = await (actor as any).isAdminSetup();
      if (!isSetup) {
        navigate({ to: "/admin" });
        return;
      }
    } catch {
      // fallback: open popover
    }
    setAdminError("");
    setAdminIdentifier("");
    setAdminPassword("");
    setAdminPopoverOpen(true);
  };

  const handleAdminLogin = async () => {
    const id = adminIdentifier.trim();
    const pw = adminPassword.trim();
    if (!id || !pw || !actor) return;
    setAdminLoading(true);
    setAdminError("");
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const token: string | null = await (actor as any).adminLogin(id, pw);
      if (token) {
        localStorage.setItem("anandstudio_admin_token", token);
        setAdminPopoverOpen(false);
        navigate({ to: "/admin" });
      } else {
        setAdminError("Invalid credentials. Please try again.");
      }
    } catch {
      setAdminError("Login failed. Please try again.");
    } finally {
      setAdminLoading(false);
    }
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

        {/* Right side icons */}
        <div className="flex items-center">
          {/* Client gallery 3-dot popover */}
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

          {/* Admin 3-line icon (desktop only) */}
          <Popover open={adminPopoverOpen} onOpenChange={setAdminPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="hidden md:flex p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                aria-label="Admin access"
                data-ocid="admin.open_modal_button"
                onClick={handleAdminIconClick}
              >
                <AlignJustify className="w-5 h-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-72 bg-card border border-border shadow-xl p-4"
              data-ocid="admin.dialog"
            >
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1">
                Admin Access
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Sign in to manage your studio
              </p>
              <div className="space-y-3">
                <Input
                  placeholder="Email or phone number"
                  type="text"
                  value={adminIdentifier}
                  onChange={(e) => setAdminIdentifier(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                  className="bg-background border-border text-sm"
                  data-ocid="admin.input"
                />
                <div className="relative">
                  <Input
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                    className="bg-background border-border text-sm pr-10"
                    data-ocid="admin.input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {adminError && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="admin.error_state"
                  >
                    {adminError}
                  </p>
                )}
                <Button
                  size="sm"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 tracking-widest text-xs uppercase"
                  disabled={
                    !adminIdentifier.trim() ||
                    !adminPassword.trim() ||
                    adminLoading
                  }
                  onClick={handleAdminLogin}
                  data-ocid="admin.submit_button"
                >
                  {adminLoading ? "Signing in\u2026" : "Sign In"}
                </Button>
              </div>
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
