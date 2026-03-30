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

export function useAllClientGalleries(sessionToken: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<
    Array<{ selection?: ClientSelection; gallery: ClientGallery }>
  >({
    queryKey: ["clientGalleries", sessionToken],
    queryFn: async () => {
      if (!actor || !sessionToken) return [];
      // New API: getAllClientGalleries(sessionToken)
      return (actor as any).getAllClientGalleries(sessionToken);
    },
    enabled: !!actor && !isFetching && !!sessionToken,
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
      sessionToken,
      title,
      category,
      file,
      onProgress,
    }: {
      sessionToken: string;
      title: string;
      category: Category;
      file: Uint8Array<ArrayBuffer>;
      onProgress?: (p: number) => void;
    }) => {
      if (!actor) throw new Error("Not connected");
      const blob = onProgress
        ? ExternalBlob.fromBytes(file).withUploadProgress(onProgress)
        : ExternalBlob.fromBytes(file);
      // New API: addPhoto(sessionToken, title, category, blob)
      await (actor as any).addPhoto(sessionToken, title, category, blob);
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
    mutationFn: async ({
      sessionToken,
      id,
    }: {
      sessionToken: string;
      id: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      // New API: deletePhoto(sessionToken, id)
      await (actor as any).deletePhoto(sessionToken, id);
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
      sessionToken: string;
      name: string;
      description: string;
      priceRange: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      // New API: addService(sessionToken, name, description, priceRange)
      await (actor as any).addService(
        s.sessionToken,
        s.name,
        s.description,
        s.priceRange,
      );
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
      sessionToken: string;
      id: string;
      name: string;
      description: string;
      priceRange: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      // New API: updateService(sessionToken, id, name, description, priceRange)
      await (actor as any).updateService(
        s.sessionToken,
        s.id,
        s.name,
        s.description,
        s.priceRange,
      );
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
    mutationFn: async ({
      sessionToken,
      id,
    }: {
      sessionToken: string;
      id: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      // New API: deleteService(sessionToken, id)
      await (actor as any).deleteService(sessionToken, id);
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
    mutationFn: async ({
      sessionToken,
      text,
    }: {
      sessionToken: string;
      text: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      // New API: updateAbout(sessionToken, text)
      await (actor as any).updateAbout(sessionToken, text);
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
    mutationFn: async ({
      sessionToken,
      info,
    }: {
      sessionToken: string;
      info: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      // New API: updateContactInfo(sessionToken, info)
      await (actor as any).updateContactInfo(sessionToken, info);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact"] });
    },
  });
}
