import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "@tanstack/react-router";
import {
  Camera,
  CheckCircle2,
  Loader2,
  Lock,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useClientGalleryByToken } from "../hooks/useQueries";

type PhotoState = "unset" | "want" | "skip";

export default function ClientGalleryPage() {
  const { token } = useParams({ from: "/gallery/$token" });
  const { data, isLoading, refetch } = useClientGalleryByToken(token);
  const { actor } = useActor();

  // code gate state
  const [unlocked, setUnlocked] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState(false);

  // selection state
  const [photoStates, setPhotoStates] = useState<Record<string, PhotoState>>(
    {},
  );
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const gallery = data?.gallery;
  const existingSelection = data?.selection;
  const hasCode = data?.hasCode ?? false;

  // Hydrate existing selection
  useEffect(() => {
    if (existingSelection && gallery) {
      const states: Record<string, PhotoState> = {};
      for (const photo of gallery.photos) {
        states[photo.id] = existingSelection.selectedPhotoIds.includes(photo.id)
          ? "want"
          : "skip";
      }
      setPhotoStates(states);
      setNote(existingSelection.customerNote);
    }
  }, [existingSelection, gallery]);

  // If no code required, mark as unlocked
  useEffect(() => {
    if (data && !data.hasCode) {
      setUnlocked(true);
    }
  }, [data]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !codeInput.trim()) return;
    setVerifying(true);
    setCodeError(false);
    try {
      const ok = await actor.verifyGalleryCode(token, codeInput.trim());
      if (ok) {
        setUnlocked(true);
      } else {
        setCodeError(true);
        toast.error("Incorrect code, please try again.");
      }
    } catch {
      toast.error("Failed to verify code.");
    } finally {
      setVerifying(false);
    }
  };

  const setPhotoState = (id: string, state: PhotoState) => {
    setPhotoStates((prev) => ({ ...prev, [id]: state }));
  };

  const selectAll = () => {
    if (!gallery) return;
    const states: Record<string, PhotoState> = {};
    for (const photo of gallery.photos) {
      states[photo.id] = "want";
    }
    setPhotoStates(states);
  };

  const wantedIds = gallery
    ? gallery.photos
        .filter((p) => photoStates[p.id] === "want")
        .map((p) => p.id)
    : [];
  const notSetCount = gallery
    ? gallery.photos.filter(
        (p) => !photoStates[p.id] || photoStates[p.id] === "unset",
      ).length
    : 0;

  const handleSubmit = async () => {
    if (!actor || !gallery) return;
    if (wantedIds.length === 0) {
      toast.error("Please select at least one photo you want.");
      return;
    }
    setSubmitting(true);
    try {
      await actor.submitClientSelection(
        gallery.id,
        token,
        wantedIds,
        note.trim(),
      );
      setSubmitted(true);
      refetch();
      toast.success("Selection submitted successfully!");
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="gallery.loading_state"
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!gallery && data !== undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-sm" data-ocid="gallery.error_state">
          <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-6 opacity-40" />
          <h1 className="font-display text-3xl text-foreground mb-3">
            Gallery Not Found
          </h1>
          <p className="text-muted-foreground text-sm">
            This gallery link is invalid or has expired. Please contact
            Anandstudio for a new link.
          </p>
        </div>
      </div>
    );
  }

  // Render the header + code gate if not yet unlocked
  const header = (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Camera className="w-5 h-5 text-primary" />
          <span className="font-display text-base tracking-widest uppercase text-foreground">
            Anandstudio
          </span>
        </div>
        <Badge
          variant="outline"
          className="border-primary/40 text-primary text-xs tracking-widest uppercase"
        >
          Private Gallery
        </Badge>
      </div>
    </header>
  );

  // Code gate screen
  if (hasCode && !unlocked) {
    return (
      <div className="min-h-screen bg-background">
        {header}
        <main className="flex items-center justify-center min-h-[calc(100vh-64px)] px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-sm w-full text-center space-y-8"
          >
            <div>
              <Lock className="w-12 h-12 text-primary mx-auto mb-5 opacity-80" />
              <h1 className="font-display text-3xl text-foreground mb-3">
                This gallery is protected
              </h1>
              <p className="text-muted-foreground text-sm">
                Enter the access code provided by Anandstudio to view your
                private gallery.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <Input
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value);
                  setCodeError(false);
                }}
                placeholder="Enter access code..."
                className={`bg-background border-border text-center tracking-widest uppercase text-lg h-12 ${
                  codeError ? "border-destructive" : ""
                }`}
                data-ocid="gallery.input"
              />
              {codeError && (
                <p
                  className="text-destructive text-xs"
                  data-ocid="gallery.error_state"
                >
                  Incorrect code, please try again.
                </p>
              )}
              <Button
                type="submit"
                disabled={verifying || !codeInput.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 tracking-widest uppercase text-xs py-5"
                data-ocid="gallery.primary_button"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Unlock Gallery"
                )}
              </Button>
            </form>
          </motion.div>
        </main>
      </div>
    );
  }

  if (!gallery) return null;

  return (
    <div className="min-h-screen bg-background">
      {header}

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3">
            {gallery.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            {gallery.photos.length} photo
            {gallery.photos.length !== 1 ? "s" : ""} · Mark the photos you want
            to keep
          </p>

          {existingSelection && !submitted && (
            <div className="mt-4 p-4 border border-primary/30 bg-primary/5 text-sm text-primary">
              You've already submitted a selection — you can update it below.
            </div>
          )}
        </motion.div>

        {/* Success State */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mb-10 p-8 border border-primary/40 bg-primary/5 text-center"
              data-ocid="gallery.success_state"
            >
              <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="font-display text-2xl text-foreground mb-2">
                Selection Submitted!
              </h2>
              <p className="text-muted-foreground text-sm">
                Your selection has been sent to Anandstudio. We'll be in touch
                soon.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls row */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="text-sm text-muted-foreground">
            {wantedIds.length > 0 ? (
              <span>
                <span className="text-primary font-medium">
                  {wantedIds.length} wanted
                </span>
                {notSetCount > 0 && (
                  <span className="text-muted-foreground">
                    {" "}
                    · {notSetCount} not selected
                  </span>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">
                Click photos to mark what you want
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
            className="border-border hover:border-primary text-xs tracking-widest uppercase"
            data-ocid="gallery.secondary_button"
          >
            Select All
          </Button>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-10">
          {gallery.photos.map((photo, idx) => {
            const state: PhotoState = photoStates[photo.id] ?? "unset";
            const isWanted = state === "want";
            const isSkipped = state === "skip";
            return (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className={`relative aspect-square overflow-hidden border-2 transition-all duration-200 group ${
                  isWanted
                    ? "border-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.3)]"
                    : isSkipped
                      ? "border-border opacity-50"
                      : "border-transparent"
                }`}
                data-ocid={`gallery.item.${idx + 1}`}
              >
                <img
                  src={photo.blob.getDirectURL()}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Selection overlay for wanted */}
                {isWanted && <div className="absolute inset-0 bg-primary/15" />}

                {/* Wanted badge */}
                <AnimatePresence>
                  {isWanted && (
                    <motion.div
                      key="want-badge"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-primary-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action buttons on hover */}
                <div className="absolute inset-x-0 bottom-0 flex opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    type="button"
                    onClick={() => setPhotoState(photo.id, "want")}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${
                      isWanted
                        ? "bg-primary text-primary-foreground"
                        : "bg-background/90 text-foreground hover:bg-primary hover:text-primary-foreground"
                    }`}
                    data-ocid="gallery.toggle"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    Want
                  </button>
                  <div className="w-px bg-border" />
                  <button
                    type="button"
                    onClick={() => setPhotoState(photo.id, "skip")}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${
                      isSkipped
                        ? "bg-muted text-muted-foreground"
                        : "bg-background/90 text-foreground hover:bg-muted hover:text-muted-foreground"
                    }`}
                    data-ocid="gallery.toggle"
                  >
                    <ThumbsDown className="w-3 h-3" />
                    Skip
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Note + Submit */}
        <div className="max-w-xl space-y-5">
          <div>
            <label
              htmlFor="customer-note"
              className="text-xs tracking-widest uppercase text-muted-foreground block mb-2"
            >
              Note to Anandstudio (optional)
            </label>
            <Textarea
              id="customer-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. I'd like prints of the portraits, and digital copies of the rest..."
              className="bg-background border-border resize-none min-h-[100px]"
              data-ocid="gallery.textarea"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || wantedIds.length === 0}
            className="bg-primary text-primary-foreground hover:bg-primary/90 tracking-widest uppercase text-xs px-10 py-5"
            data-ocid="gallery.submit_button"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
              </>
            ) : existingSelection ? (
              "Update Selection"
            ) : (
              "Submit Selection"
            )}
          </Button>
        </div>
      </main>

      <footer className="border-t border-border mt-20 py-8 text-center text-muted-foreground text-xs">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="text-primary hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
