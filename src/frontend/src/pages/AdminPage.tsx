import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import AboutTab from "../components/admin/AboutTab";
import ClientGalleriesTab from "../components/admin/ClientGalleriesTab";
import ContactTab from "../components/admin/ContactTab";
import PhotosTab from "../components/admin/PhotosTab";
import ServicesTab from "../components/admin/ServicesTab";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

export default function AdminPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { actor } = useActor();
  const {
    data: isAdmin,
    isLoading: adminLoading,
    error: adminError,
    refetch,
  } = useIsAdmin();
  const isAuthenticated = !!identity;

  const [setupToken, setSetupToken] = useState("");
  const [claiming, setClaiming] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: "/" });
  };

  const handleClaimAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !setupToken.trim()) return;
    setClaiming(true);
    try {
      await (actor as any)._initializeAccessControlWithSecret(
        setupToken.trim(),
      );
      toast.success("Admin access claimed! Welcome to Anandstudio.");
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      refetch();
    } catch {
      toast.error("Invalid token. Please check and try again.");
    } finally {
      setClaiming(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <Camera className="w-10 h-10 text-primary mx-auto mb-6" />
          <h1 className="font-display text-3xl text-foreground mb-3">
            Admin Access
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Please log in to access the Anandstudio content manager.
          </p>
          <Button
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            className="bg-primary text-primary-foreground hover:bg-primary/90 tracking-widest uppercase text-xs w-full py-6"
            data-ocid="admin.primary_button"
          >
            {loginStatus === "logging-in" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging in...
              </>
            ) : (
              "Login with Internet Identity"
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: "/" })}
            className="mt-4 text-muted-foreground hover:text-foreground w-full"
            data-ocid="admin.secondary_button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Site
          </Button>
        </div>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Show first-time setup if not admin (either error or returned false)
  if (!isAdmin) {
    const isSetupAvailable = adminError || !isAdmin;

    if (isSetupAvailable) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-6" />
              <h1 className="font-display text-3xl text-foreground mb-3">
                First Time Admin Setup
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                This app uses Internet Identity for secure login. To claim admin
                access, enter your admin setup token below. You received this
                token when the app was created.
              </p>
            </div>

            <form
              onSubmit={handleClaimAdmin}
              className="border border-border p-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="setup-token"
                  className="text-xs tracking-widest uppercase text-muted-foreground block mb-2"
                >
                  Admin Setup Token
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="setup-token"
                    type="password"
                    value={setupToken}
                    onChange={(e) => setSetupToken(e.target.value)}
                    placeholder="Enter your setup token..."
                    className="bg-background border-border pl-10"
                    data-ocid="admin.input"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={claiming || !setupToken.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 tracking-widest uppercase text-xs py-5"
                data-ocid="admin.primary_button"
              >
                {claiming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Claiming...
                  </>
                ) : (
                  "Claim Admin Access"
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

    // Fallback: admin is already claimed by someone else
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-sm" data-ocid="admin.error_state">
          <h1 className="font-display text-3xl text-foreground mb-3">
            Access Denied
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            You don't have admin privileges for Anandstudio.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/" })}
            className="border-border hover:border-primary"
            data-ocid="admin.secondary_button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Site
          </Button>
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
            <PhotosTab />
          </TabsContent>
          <TabsContent value="client-galleries">
            <ClientGalleriesTab />
          </TabsContent>
          <TabsContent value="services">
            <ServicesTab />
          </TabsContent>
          <TabsContent value="about">
            <AboutTab />
          </TabsContent>
          <TabsContent value="contact">
            <ContactTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
