import Text "mo:core/Text";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import List "mo:core/List";
import Nat32 "mo:core/Nat32";
import Principal "mo:core/Principal";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

import Time "mo:core/Time";


actor {
  type Category = {
    #weddings;
    #portraits;
    #events;
    #commercial;
  };

  module Category {
    public func compare(a : Category, b : Category) : Order.Order {
      let aVal = switch (a) {
        case (#weddings) { Nat32.fromNat(0) };
        case (#portraits) { Nat32.fromNat(1) };
        case (#events) { Nat32.fromNat(2) };
        case (#commercial) { Nat32.fromNat(3) };
      };
      let bVal = switch (b) {
        case (#weddings) { Nat32.fromNat(0) };
        case (#portraits) { Nat32.fromNat(1) };
        case (#events) { Nat32.fromNat(2) };
        case (#commercial) { Nat32.fromNat(3) };
      };
      Nat32.compare(aVal, bVal);
    };
  };

  type Photo = {
    id : Text;
    title : Text;
    category : Category;
    blob : Storage.ExternalBlob;
  };

  module Photo {
    public func compare(photo1 : Photo, photo2 : Photo) : Order.Order {
      Text.compare(photo1.title, photo2.title);
    };

    public func compareByCategory(photo1 : Photo, photo2 : Photo) : Order.Order {
      switch (Category.compare(photo1.category, photo2.category)) {
        case (#equal) { Text.compare(photo1.title, photo2.title) };
        case (order) { order };
      };
    };
  };

  let photos = Map.empty<Text, Photo>();
  var nextPhotoId = 0;

  type Service = {
    id : Text;
    name : Text;
    description : Text;
    priceRange : Text;
  };

  module Service {
    public func compare(service1 : Service, service2 : Service) : Order.Order {
      Text.compare(service1.name, service2.name);
    };
  };

  let services = Map.empty<Text, Service>();
  var nextServiceId = 0;

  var aboutText : Text = "Welcome to Anandstudio!";
  var contactInfo : Text = "Contact us at anandstudio@example.com";
  // User Profile Management
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Client Gallery Types
  type GalleryPhoto = {
    id : Text;
    title : Text;
    blob : Storage.ExternalBlob;
  };

  type ClientGallery = {
    id : Text;
    name : Text;
    token : Text;
    accessCode : ?Text;
    photos : [GalleryPhoto];
    createdAt : Int;
  };

  type ClientGalleryPublic = {
    id : Text;
    name : Text;
    token : Text;
    photos : [GalleryPhoto];
    createdAt : Int;
  };

  type ClientSelection = {
    galleryId : Text;
    selectedPhotoIds : [Text];
    customerNote : Text;
    submittedAt : Int;
  };

  type GalleryAccessResult = {
    gallery : ?ClientGalleryPublic;
    selection : ?ClientSelection;
    hasCode : Bool;
  };

  var nextGalleryId = 0;
  var nextGalleryPhotoId = 0;

  let clientGalleries = Map.empty<Text, ClientGallery>();
  let galleryTokens = Map.empty<Text, Text>();
  let gallerySelections = Map.empty<Text, ClientSelection>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Photo Gallery Management
  public shared ({ caller }) func addPhoto(title : Text, category : Category, blob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add photos");
    };
    let id = nextPhotoId.toText();
    let photo : Photo = {
      id;
      title;
      category;
      blob;
    };
    photos.add(id, photo);
    nextPhotoId += 1;
  };

  public shared ({ caller }) func deletePhoto(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete photos");
    };
    if (not photos.containsKey(id)) {
      Runtime.trap("Photo not found");
    };
    photos.remove(id);
  };

  public query ({ caller }) func getAllPhotos() : async [Photo] {
    photos.values().toArray().sort();
  };

  public query ({ caller }) func getPhotosByCategory(category : Category) : async [Photo] {
    let filtered = photos.values().toArray().filter(
      func(photo) {
        photo.category == category;
      }
    );
    filtered.sort(Photo.compareByCategory);
  };

  // Services Management
  public shared ({ caller }) func addService(name : Text, description : Text, priceRange : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add services");
    };
    let id = nextServiceId.toText();
    let service : Service = {
      id;
      name;
      description;
      priceRange;
    };
    services.add(id, service);
    nextServiceId += 1;
  };

  public shared ({ caller }) func updateService(id : Text, name : Text, description : Text, priceRange : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update services");
    };
    switch (services.get(id)) {
      case (null) { Runtime.trap("Service not found") };
      case (?_) {
        let updatedService : Service = {
          id;
          name;
          description;
          priceRange;
        };
        services.add(id, updatedService);
      };
    };
  };

  public shared ({ caller }) func deleteService(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete services");
    };
    if (not services.containsKey(id)) {
      Runtime.trap("Service not found");
    };
    services.remove(id);
  };

  public query ({ caller }) func getAllServices() : async [Service] {
    services.values().toArray().sort();
  };

  // About Management
  public shared ({ caller }) func updateAbout(text : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update about text");
    };
    aboutText := text;
  };

  public query ({ caller }) func getAbout() : async Text {
    aboutText;
  };

  // Contact Management
  public shared ({ caller }) func updateContactInfo(info : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update contact info");
    };
    contactInfo := info;
  };

  public query ({ caller }) func getContactInfo() : async Text {
    contactInfo;
  };

  // Client Gallery Management
  public shared ({ caller }) func createClientGallery(name : Text, photos : [Storage.ExternalBlob], accessCode : ?Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create client galleries");
    };
    let galleryId = nextGalleryId.toText();
    let token = generateToken();

    var photoIndex = 0;
    let galleryPhotos = photos.map(
      func(blob) {
        let photoId = nextGalleryPhotoId.toText();
        nextGalleryPhotoId += 1;
        let title = name.concat(" Photo ").concat(photoIndex.toText());
        photoIndex += 1;
        {
          id = photoId;
          title;
          blob;
        };
      }
    );

    let gallery : ClientGallery = {
      id = galleryId;
      name;
      token;
      accessCode;
      photos = galleryPhotos;
      createdAt = Time.now();
    };

    clientGalleries.add(galleryId, gallery);
    galleryTokens.add(token, galleryId);
    nextGalleryId += 1;
    galleryId;
  };

  public shared ({ caller }) func deleteClientGallery(galleryId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete client galleries");
    };
    switch (clientGalleries.get(galleryId)) {
      case (null) { Runtime.trap("Client gallery not found") };
      case (?gallery) {
        clientGalleries.remove(galleryId);
        galleryTokens.remove(gallery.token);
        gallerySelections.remove(galleryId);
      };
    };
  };

  public query ({ caller }) func getAllClientGalleries() : async [{ gallery : ClientGallery; selection : ?ClientSelection }] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all client galleries");
    };
    clientGalleries.keys().toArray().map(
      func(galleryId) {
        let gallery = clientGalleries.get(galleryId).unwrap();
        {
          gallery;
          selection = gallerySelections.get(galleryId);
        };
      }
    );
  };

  public query ({ caller }) func getClientGalleryByToken(token : Text) : async GalleryAccessResult {
    switch (galleryTokens.get(token)) {
      case (null) {
        {
          gallery = null;
          selection = null;
          hasCode = false;
        };
      };
      case (?galleryId) {
        switch (clientGalleries.get(galleryId)) {
          case (null) {
            {
              gallery = null;
              selection = null;
              hasCode = false;
            };
          };
          case (?gallery) {
            let publicGallery : ClientGalleryPublic = {
              id = gallery.id;
              name = gallery.name;
              token = gallery.token;
              photos = gallery.photos;
              createdAt = gallery.createdAt;
            };
            {
              gallery = ?publicGallery;
              selection = gallerySelections.get(galleryId);
              hasCode = gallery.accessCode != null;
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func verifyGalleryCode(token : Text, code : Text) : async Bool {
    switch (galleryTokens.get(token)) {
      case (null) { false };
      case (?galleryId) {
        switch (clientGalleries.get(galleryId)) {
          case (null) { false };
          case (?gallery) {
            switch (gallery.accessCode) {
              case (null) { true };
              case (?accessCode) { accessCode == code };
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func submitClientSelection(galleryId : Text, token : Text, selectedPhotoIds : [Text], customerNote : Text) : async () {
    switch (galleryTokens.get(token)) {
      case (null) { Runtime.trap("Invalid token") };
      case (?storedGalleryId) {
        if (storedGalleryId != galleryId) {
          Runtime.trap("Token does not match gallery");
        };
        switch (clientGalleries.get(galleryId)) {
          case (null) { Runtime.trap("Gallery not found") };
          case (?gallery) {
            let selection : ClientSelection = {
              galleryId;
              selectedPhotoIds;
              customerNote;
              submittedAt = Time.now();
            };
            gallerySelections.add(galleryId, selection);
          };
        };
      };
    };
  };

  public query ({ caller }) func getClientGallerySelection(galleryId : Text) : async ?ClientSelection {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view client selections");
    };
    gallerySelections.get(galleryId);
  };

  public query ({ caller }) func getAllClientSelections() : async [ClientSelection] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all selections");
    };
    gallerySelections.keys().toArray().map(
      func(galleryId) {
        gallerySelections.get(galleryId).unwrap();
      }
    );
  };

  func generateToken() : Text {
    let timestamp = Time.now().toText();
    let randomSuffix = nextGalleryId.toText();
    timestamp.concat("_").concat(randomSuffix);
  };
};
