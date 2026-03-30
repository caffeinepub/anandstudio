import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Category } from "../../backend";
import {
  useAddPhoto,
  useDeletePhoto,
  useGetAllPhotos,
} from "../../hooks/useQueries";

export default function PhotosTab({ sessionToken }: { sessionToken: string }) {
  const { data: photos, isLoading } = useGetAllPhotos();
  const addPhoto = useAddPhoto();
  const deletePhoto = useDeletePhoto();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(Category.weddings);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title.trim()) {
      toast.error("Please fill in all fields and select an image.");
      return;
    }
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>;
      await addPhoto.mutateAsync({
        sessionToken,
        title: title.trim(),
        category,
        file: bytes,
        onProgress: (p) => setUploadProgress(p),
      });
      setTitle("");
      setSelectedFile(null);
      setPreview(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Photo uploaded successfully!");
    } catch {
      toast.error("Failed to upload photo.");
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePhoto.mutateAsync({ sessionToken, id });
      toast.success("Photo deleted.");
    } catch {
      toast.error("Failed to delete photo.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
      {/* Upload Form */}
      <div className="lg:col-span-2">
        <div className="border border-border p-6">
          <h3 className="font-display text-xl text-foreground mb-6">
            Upload New Photo
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label
                htmlFor="photo-title"
                className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block"
              >
                Title
              </Label>
              <Input
                id="photo-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Golden Hour Wedding"
                className="bg-background border-border"
                data-ocid="photos.input"
              />
            </div>

            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
                Category
              </Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as Category)}
              >
                <SelectTrigger
                  className="bg-background border-border"
                  data-ocid="photos.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Category).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
                Image File
              </Label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border hover:border-primary/50 p-6 text-center cursor-pointer transition-colors duration-200"
                data-ocid="photos.dropzone"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-32 mx-auto object-contain"
                  />
                ) : (
                  <div className="text-muted-foreground">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Click to select image</p>
                    <p className="text-xs mt-1 opacity-60">JPG, PNG, WebP</p>
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {addPhoto.isPending && uploadProgress > 0 && (
              <div>
                <Progress
                  value={uploadProgress}
                  className="h-1"
                  data-ocid="photos.loading_state"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {uploadProgress}% uploaded
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={addPhoto.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 tracking-widest uppercase text-xs py-5"
              data-ocid="photos.upload_button"
            >
              {addPhoto.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" /> Upload Photo
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Photos List */}
      <div className="lg:col-span-3">
        <h3 className="font-display text-xl text-foreground mb-6">
          All Photos ({photos?.length ?? 0})
        </h3>

        {isLoading ? (
          <div
            className="grid grid-cols-2 gap-4"
            data-ocid="photos.loading_state"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Skeleton key={n} className="aspect-square" />
            ))}
          </div>
        ) : !photos || photos.length === 0 ? (
          <div
            className="text-center py-20 border border-dashed border-border text-muted-foreground"
            data-ocid="photos.empty_state"
          >
            <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-display text-lg">No photos yet</p>
            <p className="text-sm mt-1">
              Upload your first photo using the form.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className="group relative border border-border overflow-hidden"
                data-ocid={`photos.item.${idx + 1}`}
              >
                <img
                  src={photo.blob.getDirectURL()}
                  alt={photo.title}
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-3">
                  <p className="text-xs font-display text-foreground text-center truncate w-full">
                    {photo.title}
                  </p>
                  <span className="text-primary text-xs tracking-widest uppercase">
                    {photo.category}
                  </span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(photo.id)}
                    disabled={deletePhoto.isPending}
                    className="mt-1 text-xs"
                    data-ocid={`photos.delete_button.${idx + 1}`}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
