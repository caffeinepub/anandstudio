import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type Category = {
    #weddings;
    #portraits;
    #events;
    #commercial;
  };

  type Photo = {
    id : Text;
    title : Text;
    category : Category;
    blob : Blob;
  };

  type Service = {
    id : Text;
    name : Text;
    description : Text;
    priceRange : Text;
  };

  type GalleryPhoto = {
    id : Text;
    title : Text;
    blob : Blob;
  };

  type ClientGallery = {
    id : Text;
    name : Text;
    token : Text;
    accessCode : ?Text;
    photos : [GalleryPhoto];
    createdAt : Int;
  };

  type ClientSelection = {
    galleryId : Text;
    selectedPhotoIds : [Text];
    customerNote : Text;
    submittedAt : Int;
  };

  type UserRole = {
    #admin;
    #user;
    #guest;
  };

  // Old UserProfile without email/phone fields
  type OldUserProfile = {
    name : Text;
  };

  // Old AccessControlState with mutable adminAssigned
  type OldAccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  // OldActor matches the actual deployed stable state
  type OldActor = {
    accessControlState : OldAccessControlState;
    nextPhotoId : Nat;
    photos : Map.Map<Text, Photo>;
    services : Map.Map<Text, Service>;
    nextServiceId : Nat;
    nextGalleryId : Nat;
    nextGalleryPhotoId : Nat;
    clientGalleries : Map.Map<Text, ClientGallery>;
    galleryTokens : Map.Map<Text, Text>;
    gallerySelections : Map.Map<Text, ClientSelection>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    aboutText : Text;
    contactInfo : Text;
  };

  // NewActor matches new main.mo stable variables
  type NewActor = {
    adminIdentifier : ?Text;
    adminPassword : ?Text;
    adminSessionToken : ?Text;
    sessionExpiry : Int;
    photoCounter : Nat;
    photos : Map.Map<Text, Photo>;
    services : Map.Map<Text, Service>;
    nextServiceId : Nat;
    nextGalleryId : Nat;
    nextGalleryPhotoId : Nat;
    clientGalleries : Map.Map<Text, ClientGallery>;
    galleryTokens : Map.Map<Text, Text>;
    gallerySelections : Map.Map<Text, ClientSelection>;
    aboutText : Text;
    contactInfo : Text;
  };

  public func run(old : OldActor) : NewActor {
    {
      adminIdentifier = null;
      adminPassword = null;
      adminSessionToken = null;
      sessionExpiry = 0;
      photoCounter = old.nextPhotoId;
      photos = old.photos;
      services = old.services;
      nextServiceId = old.nextServiceId;
      nextGalleryId = old.nextGalleryId;
      nextGalleryPhotoId = old.nextGalleryPhotoId;
      clientGalleries = old.clientGalleries;
      galleryTokens = old.galleryTokens;
      gallerySelections = old.gallerySelections;
      aboutText = old.aboutText;
      contactInfo = old.contactInfo;
    };
  };
};
