import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Service } from "../../backend";
import {
  useAddService,
  useDeleteService,
  useGetAllServices,
  useUpdateService,
} from "../../hooks/useQueries";

type ServiceForm = { name: string; description: string; priceRange: string };
const EMPTY_FORM: ServiceForm = { name: "", description: "", priceRange: "" };

export default function ServicesTab() {
  const { data: services, isLoading } = useGetAllServices();
  const addService = useAddService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ServiceForm>(EMPTY_FORM);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.priceRange.trim()
    ) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      await addService.mutateAsync(form);
      setForm(EMPTY_FORM);
      toast.success("Service added.");
    } catch {
      toast.error("Failed to add service.");
    }
  };

  const startEdit = (s: Service) => {
    setEditingId(s.id);
    setEditForm({
      name: s.name,
      description: s.description,
      priceRange: s.priceRange,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateService.mutateAsync({ id, ...editForm });
      setEditingId(null);
      toast.success("Service updated.");
    } catch {
      toast.error("Failed to update service.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService.mutateAsync(id);
      toast.success("Service deleted.");
    } catch {
      toast.error("Failed to delete service.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
      {/* Add Form */}
      <div className="lg:col-span-2">
        <div className="border border-border p-6">
          <h3 className="font-display text-xl text-foreground mb-6">
            Add Service
          </h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
                Name
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Wedding Photography"
                className="bg-background border-border"
                data-ocid="services.input"
              />
            </div>
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
                Description
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Describe the service..."
                className="bg-background border-border resize-none"
                rows={3}
                data-ocid="services.textarea"
              />
            </div>
            <div>
              <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
                Price Range
              </Label>
              <Input
                value={form.priceRange}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priceRange: e.target.value }))
                }
                placeholder="e.g. ₹50,000 – ₹1,00,000"
                className="bg-background border-border"
                data-ocid="services.input"
              />
            </div>
            <Button
              type="submit"
              disabled={addService.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 tracking-widest uppercase text-xs py-5"
              data-ocid="services.submit_button"
            >
              {addService.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" /> Add Service
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Services List */}
      <div className="lg:col-span-3">
        <h3 className="font-display text-xl text-foreground mb-6">
          Services ({services?.length ?? 0})
        </h3>

        {isLoading ? (
          <div className="space-y-4" data-ocid="services.loading_state">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-28 w-full" />
            ))}
          </div>
        ) : !services || services.length === 0 ? (
          <div
            className="text-center py-20 border border-dashed border-border text-muted-foreground"
            data-ocid="services.empty_state"
          >
            <p className="font-display text-lg">No services yet</p>
            <p className="text-sm mt-1">
              Add your first service using the form.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service, idx) => (
              <div
                key={service.id}
                className="border border-border p-5"
                data-ocid={`services.item.${idx + 1}`}
              >
                {editingId === service.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="bg-background border-border"
                      data-ocid="services.input"
                    />
                    <Textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                      className="bg-background border-border resize-none"
                      rows={2}
                      data-ocid="services.textarea"
                    />
                    <Input
                      value={editForm.priceRange}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          priceRange: e.target.value,
                        }))
                      }
                      className="bg-background border-border"
                      data-ocid="services.input"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(service.id)}
                        disabled={updateService.isPending}
                        className="bg-primary text-primary-foreground text-xs"
                        data-ocid={`services.save_button.${idx + 1}`}
                      >
                        {updateService.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEdit}
                        className="text-xs"
                        data-ocid={`services.cancel_button.${idx + 1}`}
                      >
                        <X className="w-3 h-3" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-display text-base text-foreground">
                          {service.name}
                        </h4>
                        <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                          {service.description}
                        </p>
                        <p className="text-primary text-xs tracking-wide mt-2">
                          {service.priceRange}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(service)}
                          className="text-muted-foreground hover:text-foreground"
                          data-ocid={`services.edit_button.${idx + 1}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(service.id)}
                          disabled={deleteService.isPending}
                          className="text-muted-foreground hover:text-destructive"
                          data-ocid={`services.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
