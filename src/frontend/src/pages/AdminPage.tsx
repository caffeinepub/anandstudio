import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import AboutTab from "../components/admin/AboutTab";
import ClientGalleriesTab from "../components/admin/ClientGalleriesTab";
import ContactTab from "../components/admin/ContactTab";
import PhotosTab from "../components/admin/PhotosTab";
import ServicesTab from "../components/admin/ServicesTab";
import { useAdminAuth } from "../hooks/useAdminAuth";

export default function AdminPage() {
  const navigate = useNavigate();
  const {
    sessionToken,
    isAuthenticated,
    isLoading,
    isSetup,
    login,
    logout,
    setupAdmin,
  } = useAdminAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      toast.error("Please enter your email/phone and password.");
      return;
    }
    setSubmitting(true);
    try {
      const ok = await login(identifier.trim(), password.trim());
      if (!ok) toast.error("Invalid credentials. Please try again.");
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.trim().length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const ok = await setupAdmin(identifier.trim(), password.trim());
      if (ok) {
        toast.success("Admin account created! Welcome to Anandstudio.");
      } else {
        toast.error("Setup failed. Please try again.");
      }
    } catch {
      toast.error("Setup failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // First-time setup
  if (isSetup === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-6" />
            <h1 className="font-display text-3xl text-foreground mb-3">
              Create Admin Account
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Set up your admin credentials to manage Anandstudio. This is a
              one-time setup.
            </p>
          </div>

          <form
            onSubmit={handleSetup}
            className="border border-border p-6 space-y-5"
          >
            <div>
              <label
                htmlFor="setup-identifier"
                className="text-xs tracking-widest uppercase text-muted-foreground block mb-2"
              >
                Email or Phone Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="setup-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. anandstudio848@gmail.com"
                  className="bg-background border-border pl-10"
                  data-ocid="admin.input"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="setup-password"
                className="text-xs tracking-widest uppercase text-muted-foreground block mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="setup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  className="bg-background border-border pl-10 pr-10"
                  data-ocid="admin.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1 opacity-70">
                Minimum 6 characters
              </p>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 tracking-widest uppercase text-xs py-5"
              data-ocid="admin.primary_button"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting
                  up...
                </>
              ) : (
                "Create Admin Account"
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => navigate({ to: "/" })}
              className="text-muted-foreground hover:text-foreground text-sm"
              data-ocid="admin.secondary_button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Site
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-sm w-full space-y-8">
          <div className="text-center">
            <Camera className="w-10 h-10 text-primary mx-auto mb-6" />
            <h1 className="font-display text-3xl text-foreground mb-3">
              Admin Login
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign in to manage your Anandstudio website.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="border border-border p-6 space-y-5"
          >
            <div>
              <label
                htmlFor="login-identifier"
                className="text-xs tracking-widest uppercase text-muted-foreground block mb-2"
              >
                Email or Phone Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="login-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. anandstudio848@gmail.com"
                  className="bg-background border-border pl-10"
                  data-ocid="admin.input"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="text-xs tracking-widest uppercase text-muted-foreground block mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-background border-border pl-10 pr-10"
                  data-ocid="admin.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 tracking-widest uppercase text-xs py-5"
              data-ocid="admin.primary_button"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing
                  in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => navigate({ to: "/" })}
              className="text-muted-foreground hover:text-foreground text-sm"
              data-ocid="admin.secondary_button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Site
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 text-primary" />
            <span className="font-display text-base tracking-widest uppercase text-foreground">
              Anandstudio
            </span>
            <span className="text-muted-foreground text-xs tracking-widest uppercase ml-2 border-l border-border pl-2">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/" })}
              className="text-muted-foreground hover:text-foreground text-xs tracking-widest uppercase"
              data-ocid="admin.secondary_button"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> View Site
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              className="border-border hover:border-destructive hover:text-destructive text-xs tracking-widest uppercase"
              data-ocid="admin.button"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-foreground mb-2">
            Content Manager
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your photos, services, and site content.
          </p>
        </div>

        <Tabs defaultValue="photos">
          <TabsList
            className="bg-card border border-border mb-8 h-auto p-1 gap-1 flex-wrap"
            data-ocid="admin.tab"
          >
            {["photos", "client-galleries", "services", "about", "contact"].map(
              (tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="text-xs tracking-widest uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-5 py-2"
                  data-ocid="admin.tab"
                >
                  {tab === "client-galleries" ? "Client Galleries" : tab}
                </TabsTrigger>
              ),
            )}
          </TabsList>

          <TabsContent value="photos">
            <PhotosTab sessionToken={sessionToken!} />
          </TabsContent>
          <TabsContent value="client-galleries">
            <ClientGalleriesTab sessionToken={sessionToken!} />
          </TabsContent>
          <TabsContent value="services">
            <ServicesTab sessionToken={sessionToken!} />
          </TabsContent>
          <TabsContent value="about">
            <AboutTab sessionToken={sessionToken!} />
          </TabsContent>
          <TabsContent value="contact">
            <ContactTab sessionToken={sessionToken!} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
