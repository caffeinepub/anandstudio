import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Check,
  Copy,
  ImageIcon,
  KeyRound,
  Loader2,
  PlusCircle,
  Trash2,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../../backend";
import { useActor } from "../../hooks/useActor";
import { useAllClientGalleries } from "../../hooks/useQueries";

function formatDate(ts: bigint) {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors truncate max-w-full"
      data-ocid="galleries.button"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 shrink-0 text-primary" />
      ) : (
        <Copy className="w-3.5 h-3.5 shrink-0" />
      )}
      <span className="truncate">{link}</span>
    </button>
  );
}

export default function ClientGalleriesTab() {
  const { data: galleries, isLoading } = useAllClientGalleries();
  const { actor } = useActor();
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newGalleryLink, setNewGalleryLink] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    setFiles(selected);
    const readers = selected.map(
      (f) =>
        new Promise<string>((res) => {
          const r = new FileReader();
          r.onload = (ev) => res(ev.target?.result as string);
          r.readAsDataURL(f);
        }),
    );
    Promise.all(readers).then(setPreviews);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !name.trim() || files.length === 0) {
      toast.error("Please enter a gallery name and select photos.");
      return;
    }
    setCreating(true);
    setUploadProgress(0);
    setNewGalleryLink(null);
    try {
      const total = files.length;
      let done = 0;
      const blobs = await Promise.all(
        files.map(async (file) => {
          const buf = await file.arrayBuffer();
          const bytes = new Uint8Array(buf) as Uint8Array<ArrayBuffer>;
          const blob = ExternalBlob.fromBytes(bytes).withUploadProgress(() => {
            done += 1;
            setUploadProgress(Math.round((done / total) * 100));
          });
          return blob;
        }),
      );
      const codeValue = accessCode.trim() || null;
      const galleryId = await actor.createClientGallery(
        name.trim(),
        blobs,
        codeValue,
      );
      // Fetch the gallery to get the token
      const all = await actor.getAllClientGalleries();
      const created = all.find((g) => g.gallery.id === galleryId);
      if (created) {
        const link = `${window.location.origin}/gallery/${created.gallery.token}`;
        setNewGalleryLink(link);
      }
      setName("");
      setAccessCode("");
      setFiles([]);
      setPreviews([]);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
      qc.invalidateQueries({ queryKey: ["clientGalleries"] });
      toast.success("Gallery created!");
    } catch {
      toast.error("Failed to create gallery.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (galleryId: string) => {
    if (!actor) return;
    try {
      await actor.deleteClientGallery(galleryId);
      qc.invalidateQueries({ queryKey: ["clientGalleries"] });
      toast.success("Gallery deleted.");
    } catch {
      toast.error("Failed to delete gallery.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
      {/* Create Form */}
      <div className="lg:col-span-2">
        <div className="border border-border p-6">
          <h3 className="font-display text-xl text-foreground mb-6">
            Create Client Gallery
          </h3>
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
                Gallery Name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John's Wedding"
                className="bg-background border-border"
                data-ocid="galleries.input"
              />
            </div>

            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
                Access Code{" "}
                <span className="normal-case tracking-normal opacity-60">
                  (optional)
                </span>
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="e.g. WEDDING2024"
                  className="bg-background border-border pl-10 uppercase placeholder:normal-case"
                  data-ocid="galleries.input"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 opacity-70">
                If set, customers must enter this code to view their gallery.
              </p>
            </div>

            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
                Photos
              </Label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border hover:border-primary/50 p-6 text-center cursor-pointer transition-colors duration-200"
                data-ocid="galleries.dropzone"
              >
                {previews.length > 0 ? (
                  <div className="grid grid-cols-4 gap-1">
                    {previews.slice(0, 8).map((src) => (
                      <img
                        key={src}
                        src={src}
                        alt=""
                        className="aspect-square object-cover"
                      />
                    ))}
                    {previews.length > 8 && (
                      <div className="aspect-square bg-muted flex items-center justify-center text-muted-foreground text-xs">
                        +{previews.length - 8}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Click to select photos</p>
                    <p className="text-xs mt-1 opacity-60">
                      Multiple files supported
                    </p>
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
                className="hidden"
              />
              {files.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {files.length} file{files.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>

            {creating && uploadProgress > 0 && (
              <div data-ocid="galleries.loading_state">
                <Progress value={uploadProgress} className="h-1" />
                <p className="text-xs text-muted-foreground mt-1">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {newGalleryLink && (
              <div
                className="p-3 border border-primary/30 bg-primary/5"
                data-ocid="galleries.success_state"
              >
                <p className="text-xs text-muted-foreground mb-2 tracking-widest uppercase">
                  Share this link with your client:
                </p>
                <CopyLinkButton link={newGalleryLink} />
              </div>
            )}

            <Button
              type="submit"
              disabled={creating}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 tracking-widest uppercase text-xs py-5"
              data-ocid="galleries.primary_button"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 mr-2" /> Create Gallery
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Gallery List */}
      <div className="lg:col-span-3">
        <h3 className="font-display text-xl text-foreground mb-6">
          All Galleries ({galleries?.length ?? 0})
        </h3>

        {isLoading ? (
          <div className="space-y-4" data-ocid="galleries.loading_state">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-32" />
            ))}
          </div>
        ) : !galleries || galleries.length === 0 ? (
          <div
            className="text-center py-20 border border-dashed border-border text-muted-foreground"
            data-ocid="galleries.empty_state"
          >
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-display text-lg">No client galleries yet</p>
            <p className="text-sm mt-1">
              Create your first gallery using the form.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {galleries.map(({ gallery, selection }, idx) => (
              <div
                key={gallery.id}
                className="border border-border p-5 space-y-4"
                data-ocid={`galleries.item.${idx + 1}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-lg text-foreground truncate">
                      {gallery.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {gallery.photos.length} photo
                        {gallery.photos.length !== 1 ? "s" : ""}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {formatDate(gallery.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {selection ? (
                      <Badge className="bg-primary/20 text-primary border-primary/40 text-xs">
                        Selection received
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-muted text-muted-foreground text-xs"
                      >
                        Awaiting selection
                      </Badge>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive h-7 w-7 p-0"
                          data-ocid={`galleries.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-display">
                            Delete Gallery
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Delete "{gallery.name}"? This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            className="border-border"
                            data-ocid="galleries.cancel_button"
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(gallery.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            data-ocid="galleries.confirm_button"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Share Link */}
                <div className="bg-background px-3 py-2 border border-border">
                  <CopyLinkButton
                    link={`${window.location.origin}/gallery/${gallery.token}`}
                  />
                </div>

                {/* Access Code badge */}
                {gallery.accessCode && (
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Code:</span>
                    <Badge
                      variant="outline"
                      className="border-border text-muted-foreground text-xs font-mono tracking-widest"
                    >
                      {gallery.accessCode}
                    </Badge>
                  </div>
                )}

                {/* Selection Details */}
                {selection && (
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        <strong className="text-foreground">
                          {selection.selectedPhotoIds.length}
                        </strong>{" "}
                        photo
                        {selection.selectedPhotoIds.length !== 1 ? "s" : ""}{" "}
                        selected
                      </span>
                      <span>Submitted {formatDate(selection.submittedAt)}</span>
                    </div>
                    {selection.customerNote && (
                      <p className="text-sm text-muted-foreground italic border-l-2 border-primary/40 pl-3">
                        "{selection.customerNote}"
                      </p>
                    )}
                    {/* Selected photo thumbnails */}
                    <div className="flex gap-2 flex-wrap">
                      {gallery.photos
                        .filter((p) =>
                          selection.selectedPhotoIds.includes(p.id),
                        )
                        .map((p) => (
                          <div
                            key={p.id}
                            className="w-14 h-14 border border-primary/40 overflow-hidden shrink-0"
                          >
                            <img
                              src={p.blob.getDirectURL()}
                              alt={p.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
