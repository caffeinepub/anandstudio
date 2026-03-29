import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  type Category = {
    #weddings;
    #portraits;
    #events;
    #commercial;
  };

  // Old Types
  type OldPhoto = {
    id : Text;
    title : Text;
    category : Category;
    blob : Storage.ExternalBlob;
  };

  type OldClientGallery = {
    id : Text;
    name : Text;
    token : Text;
    photos : [OldGalleryPhoto];
    createdAt : Int;
  };

  type OldGalleryPhoto = {
    id : Text;
    title : Text;
    blob : Storage.ExternalBlob;
  };

  type OldClientSelection = {
    galleryId : Text;
    selectedPhotoIds : [Text];
    customerNote : Text;
    submittedAt : Int;
  };

  type OldService = {
    id : Text;
    name : Text;
    description : Text;
    priceRange : Text;
  };

  type OldUserProfile = {
    name : Text;
  };

  type OldActor = {
    photos : Map.Map<Text, OldPhoto>;
    services : Map.Map<Text, OldService>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    clientGalleries : Map.Map<Text, OldClientGallery>;
    galleryTokens : Map.Map<Text, Text>;
    gallerySelections : Map.Map<Text, OldClientSelection>;
    nextPhotoId : Nat;
    nextServiceId : Nat;
    aboutText : Text;
    contactInfo : Text;
    nextGalleryId : Nat;
    nextGalleryPhotoId : Nat;
  };

  // New Types
  type NewPhoto = {
    id : Text;
    title : Text;
    category : Category;
    blob : Storage.ExternalBlob;
  };

  type NewClientGallery = {
    id : Text;
    name : Text;
    token : Text;
    accessCode : ?Text;
    photos : [NewGalleryPhoto];
    createdAt : Int;
  };

  type NewGalleryPhoto = {
    id : Text;
    title : Text;
    blob : Storage.ExternalBlob;
  };

  type NewClientSelection = {
    galleryId : Text;
    selectedPhotoIds : [Text];
    customerNote : Text;
    submittedAt : Int;
  };

  type NewService = {
    id : Text;
    name : Text;
    description : Text;
    priceRange : Text;
  };

  type NewUserProfile = {
    name : Text;
  };

  type NewActor = {
    photos : Map.Map<Text, NewPhoto>;
    services : Map.Map<Text, NewService>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    clientGalleries : Map.Map<Text, NewClientGallery>;
    galleryTokens : Map.Map<Text, Text>;
    gallerySelections : Map.Map<Text, NewClientSelection>;
    nextPhotoId : Nat;
    nextServiceId : Nat;
    aboutText : Text;
    contactInfo : Text;
    nextGalleryId : Nat;
    nextGalleryPhotoId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newPhotos = old.photos;
    let newServices = old.services;
    let newUserProfiles = old.userProfiles;
    let newClientGalleries = old.clientGalleries.map<Text, OldClientGallery, NewClientGallery>(
      func(_id, oldGallery) {
        {
          oldGallery with
          accessCode = null;
        };
      }
    );
    let newGalleryTokens = old.galleryTokens;
    let newGallerySelections = old.gallerySelections;

    let newAboutText = old.aboutText;
    let newContactInfo = old.contactInfo;

    {
      photos = newPhotos;
      services = newServices;
      userProfiles = newUserProfiles;
      clientGalleries = newClientGalleries;
      galleryTokens = newGalleryTokens;
      gallerySelections = newGallerySelections;
      nextPhotoId = old.nextPhotoId;
      nextServiceId = old.nextServiceId;
      aboutText = newAboutText;
      contactInfo = newContactInfo;
      nextGalleryId = old.nextGalleryId;
      nextGalleryPhotoId = old.nextGalleryPhotoId;
    };
  };
};
