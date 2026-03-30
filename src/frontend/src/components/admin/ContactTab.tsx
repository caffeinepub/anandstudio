import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useGetContactInfo,
  useUpdateContactInfo,
} from "../../hooks/useQueries";

export default function ContactTab({ sessionToken }: { sessionToken: string }) {
  const { data: contactInfo, isLoading } = useGetContactInfo();
  const updateContact = useUpdateContactInfo();
  const [text, setText] = useState("");

  useEffect(() => {
    if (contactInfo !== undefined) setText(contactInfo);
  }, [contactInfo]);

  const handleSave = async () => {
    try {
      await updateContact.mutateAsync({ sessionToken, info: text });
      toast.success("Contact info updated.");
    } catch {
      toast.error("Failed to update contact info.");
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="border border-border p-6">
        <h3 className="font-display text-xl text-foreground mb-2">
          Contact Information
        </h3>
        <p className="text-muted-foreground text-sm mb-6">
          Edit the contact information shown on your website. Use labels like{" "}
          <code className="text-primary mx-1 text-xs">Email:</code>,{" "}
          <code className="text-primary mx-1 text-xs">Phone:</code>,{" "}
          <code className="text-primary mx-1 text-xs">Address:</code> on
          separate lines.
        </p>

        {isLoading ? (
          <div className="space-y-3" data-ocid="contact.loading_state">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-4 w-full" />
            ))}
          </div>
        ) : (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bg-background border-border resize-none min-h-[260px] leading-relaxed font-mono text-sm"
            placeholder="Email: hello@anandstudio.in\nPhone: +91 98765 43210\nAddress: 12 Lens Lane, Mumbai"
            data-ocid="contact.textarea"
          />
        )}

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updateContact.isPending || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 tracking-widest uppercase text-xs py-5 px-8"
            data-ocid="contact.save_button"
          >
            {updateContact.isPending ? (
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

        {updateContact.isSuccess && (
          <p
            className="text-sm text-primary mt-2 text-right"
            data-ocid="contact.success_state"
          >
            Contact info saved successfully.
          </p>
        )}
      </div>
    </div>
  );
}
