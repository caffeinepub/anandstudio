import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    name: string;
}
export interface GalleryPhoto {
    id: string;
    title: string;
    blob: ExternalBlob;
}
export interface GalleryAccessResult {
    hasCode: boolean;
    selection?: ClientSelection;
    gallery?: ClientGalleryPublic;
}
export interface ClientSelection {
    customerNote: string;
    selectedPhotoIds: Array<string>;
    submittedAt: bigint;
    galleryId: string;
}
export interface Photo {
    id: string;
    title: string;
    blob: ExternalBlob;
    category: Category;
}
export interface Service {
    id: string;
    name: string;
    description: string;
    priceRange: string;
}
export interface ClientGalleryPublic {
    id: string;
    token: string;
    name: string;
    createdAt: bigint;
    photos: Array<GalleryPhoto>;
}
export interface ClientGallery {
    id: string;
    token: string;
    name: string;
    createdAt: bigint;
    accessCode?: string;
    photos: Array<GalleryPhoto>;
}
export enum Category {
    commercial = "commercial",
    events = "events",
    weddings = "weddings",
    portraits = "portraits"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPhoto(title: string, category: Category, blob: ExternalBlob): Promise<void>;
    addService(name: string, description: string, priceRange: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createClientGallery(name: string, photos: Array<ExternalBlob>, accessCode: string | null): Promise<string>;
    deleteClientGallery(galleryId: string): Promise<void>;
    deletePhoto(id: string): Promise<void>;
    deleteService(id: string): Promise<void>;
    getAbout(): Promise<string>;
    getAllClientGalleries(): Promise<Array<{
        selection?: ClientSelection;
        gallery: ClientGallery;
    }>>;
    getAllClientSelections(): Promise<Array<ClientSelection>>;
    getAllPhotos(): Promise<Array<Photo>>;
    getAllServices(): Promise<Array<Service>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClientGalleryByToken(token: string): Promise<GalleryAccessResult>;
    getClientGallerySelection(galleryId: string): Promise<ClientSelection | null>;
    getContactInfo(): Promise<string>;
    getPhotosByCategory(category: Category): Promise<Array<Photo>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitClientSelection(galleryId: string, token: string, selectedPhotoIds: Array<string>, customerNote: string): Promise<void>;
    updateAbout(text: string): Promise<void>;
    updateContactInfo(info: string): Promise<void>;
    updateService(id: string, name: string, description: string, priceRange: string): Promise<void>;
    verifyGalleryCode(token: string, code: string): Promise<boolean>;
}
