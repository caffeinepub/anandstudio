import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Category,
  ClientGallery,
  ClientSelection,
  GalleryAccessResult,
  Photo,
  Service,
} from "../backend";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

export function useGetAllPhotos() {
  const { actor, isFetching } = useActor();
  return useQuery<Photo[]>({
    queryKey: ["photos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPhotos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPhotosByCategory(category: Category | "all") {
  const { actor, isFetching } = useActor();
  return useQuery<Photo[]>({
    queryKey: ["photos", category],
    queryFn: async () => {
      if (!actor) return [];
      if (category === "all") return actor.getAllPhotos();
      return actor.getPhotosByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllServices() {
  const { actor, isFetching } = useActor();
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllServices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAbout() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["about"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getAbout();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetContactInfo() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["contact"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getContactInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAllClientGalleries() {
  const { actor, isFetching } = useActor();
  return useQuery<
    Array<{ selection?: ClientSelection; gallery: ClientGallery }>
  >({
    queryKey: ["clientGalleries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClientGalleries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClientGalleryByToken(token: string) {
  const { actor, isFetching } = useActor();
  return useQuery<GalleryAccessResult>({
    queryKey: ["clientGallery", token],
    queryFn: async () => {
      if (!actor) return { hasCode: false };
      return actor.getClientGalleryByToken(token);
    },
    enabled: !!actor && !isFetching && !!token,
  });
}

export function useAddPhoto() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      category,
      file,
      onProgress,
    }: {
      title: string;
      category: Category;
      file: Uint8Array<ArrayBuffer>;
      onProgress?: (p: number) => void;
    }) => {
      if (!actor) throw new Error("Not connected");
      const blob = onProgress
        ? ExternalBlob.fromBytes(file).withUploadProgress(onProgress)
        : ExternalBlob.fromBytes(file);
      await actor.addPhoto(title, category, blob);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}

export function useDeletePhoto() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deletePhoto(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}

export function useAddService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: {
      name: string;
      description: string;
      priceRange: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.addService(s.name, s.description, s.priceRange);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useUpdateService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: {
      id: string;
      name: string;
      description: string;
      priceRange: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateService(s.id, s.name, s.description, s.priceRange);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useDeleteService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteService(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useUpdateAbout() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateAbout(text);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["about"] });
    },
  });
}

export function useUpdateContactInfo() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (info: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateContactInfo(info);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact"] });
    },
  });
}
