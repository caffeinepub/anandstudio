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
export interface backendInterface {
    // Auth
    isAdminSetup(): Promise<boolean>;
    setupAdmin(identifier: string, password: string): Promise<boolean>;
    adminLogin(identifier: string, password: string): Promise<string | null>;
    adminLogout(sessionToken: string): Promise<void>;
    verifyAdminToken(sessionToken: string): Promise<boolean>;
    changeAdminPassword(sessionToken: string, currentPassword: string, newPassword: string): Promise<boolean>;
    // Photos
    addPhoto(sessionToken: string, title: string, category: Category, blob: ExternalBlob): Promise<string>;
    deletePhoto(sessionToken: string, id: string): Promise<void>;
    getAllPhotos(): Promise<Array<Photo>>;
    getPhotosByCategory(category: Category): Promise<Array<Photo>>;
    // Services
    addService(sessionToken: string, name: string, description: string, priceRange: string): Promise<void>;
    updateService(sessionToken: string, id: string, name: string, description: string, priceRange: string): Promise<void>;
    deleteService(sessionToken: string, id: string): Promise<void>;
    getAllServices(): Promise<Array<Service>>;
    // About & Contact
    updateAbout(sessionToken: string, text: string): Promise<void>;
    getAbout(): Promise<string>;
    updateContactInfo(sessionToken: string, info: string): Promise<void>;
    getContactInfo(): Promise<string>;
    // Client Galleries
    createClientGallery(sessionToken: string, name: string, photos: Array<ExternalBlob>, accessCode: string | null): Promise<string>;
    deleteClientGallery(sessionToken: string, galleryId: string): Promise<void>;
    getAllClientGalleries(sessionToken: string): Promise<Array<{
        selection?: ClientSelection;
        gallery: ClientGallery;
    }>>;
    getClientGalleryByToken(token: string): Promise<GalleryAccessResult>;
    verifyGalleryCode(token: string, code: string): Promise<boolean>;
    submitClientSelection(galleryId: string, token: string, selectedPhotoIds: Array<string>, customerNote: string): Promise<void>;
    getClientGallerySelection(sessionToken: string, galleryId: string): Promise<ClientSelection | null>;
    // Storage (internal)
    _caffeineStorageBlobIsLive(hash: Uint8Array): Promise<boolean>;
    _caffeineStorageBlobsToDelete(): Promise<Array<Uint8Array>>;
    _caffeineStorageConfirmBlobDeletion(blobs: Array<Uint8Array>): Promise<void>;
    _caffeineStorageCreateCertificate(blobHash: string): Promise<{method: string; blob_hash: string}>;
    _caffeineStorageRefillCashier(refillInformation: {proposed_top_up_amount?: bigint} | null): Promise<{success?: boolean; topped_up_amount?: bigint}>;
    _caffeineStorageUpdateGatewayPrincipals(): Promise<void>;
}
