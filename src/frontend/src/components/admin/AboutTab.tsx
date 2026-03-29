import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useGetAbout, useUpdateAbout } from "../../hooks/useQueries";

export default function AboutTab() {
  const { data: about, isLoading } = useGetAbout();
  const updateAbout = useUpdateAbout();
  const [text, setText] = useState("");

  useEffect(() => {
    if (about !== undefined) setText(about);
  }, [about]);

  const handleSave = async () => {
    try {
      await updateAbout.mutateAsync(text);
      toast.success("About section updated.");
    } catch {
      toast.error("Failed to update about section.");
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="border border-border p-6">
        <h3 className="font-display text-xl text-foreground mb-2">
          About Section
        </h3>
        <p className="text-muted-foreground text-sm mb-6">
          Edit the text shown in the About section of your website. Use double
          line breaks to separate paragraphs.
        </p>

        {isLoading ? (
          <div className="space-y-3" data-ocid="about.loading_state">
            {[1, 2, 3, 4, 5].map((n) => (
              <Skeleton key={n} className="h-4 w-full" />
            ))}
          </div>
        ) : (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bg-background border-border resize-none min-h-[300px] leading-relaxed"
            placeholder="Write about your studio here..."
            data-ocid="about.textarea"
          />
        )}

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updateAbout.isPending || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 tracking-widest uppercase text-xs py-5 px-8"
            data-ocid="about.save_button"
          >
            {updateAbout.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </>
            )}
          </Button>
        </div>

        {updateAbout.isSuccess && (
          <p
            className="text-sm text-primary mt-2 text-right"
            data-ocid="about.success_state"
          >
            Changes saved successfully.
          </p>
        )}
      </div>
    </div>
  );
}
