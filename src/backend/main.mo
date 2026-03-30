import Text "mo:core/Text";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";



actor {
  include MixinStorage();

  // ===== Password-based Admin Auth =====
  var adminIdentifier : ?Text = null;
  var adminPassword : ?Text = null;
  var adminSessionToken : ?Text = null;
  var sessionExpiry : Int = 0;

  let SESSION_DURATION_NS : Int = 86_400_000_000_000; // 24h in nanoseconds

  func isValidSession(token : Text) : Bool {
    switch (adminSessionToken) {
      case (?t) { t == token and Time.now() <= sessionExpiry };
      case null { false };
    }
  };

  func requireSession(token : Text) {
    if (not isValidSession(token)) {
      Runtime.trap("Unauthorized: Invalid or expired session");
    }
  };

  public query func isAdminSetup() : async Bool {
    adminPassword != null
  };

  public func setupAdmin(identifier : Text, password : Text) : async Bool {
    if (adminPassword != null) { return false };
    adminIdentifier := ?identifier;
    adminPassword := ?password;
    true
  };

  public func adminLogin(identifier : Text, password : Text) : async ?Text {
    switch (adminIdentifier, adminPassword) {
      case (?storedId, ?storedPass) {
        if (storedId == identifier and storedPass == password) {
          let token = Time.now().toText() # "_session";
          adminSessionToken := ?token;
          sessionExpiry := Time.now() + SESSION_DURATION_NS;
          ?token
        } else { null }
      };
      case _ { null };
    }
  };

  public func adminLogout(token : Text) : async () {
    switch (adminSessionToken) {
      case (?t) {
        if (t == token) {
          adminSessionToken := null;
          sessionExpiry := 0;
        }
      };
      case null {};
    }
  };

  public query func verifyAdminToken(token : Text) : async Bool {
    isValidSession(token)
  };

  public func changeAdminPassword(token : Text, currentPassword : Text, newPassword : Text) : async Bool {
    requireSession(token);
    switch (adminPassword) {
      case (?pass) {
        if (pass == currentPassword) {
          adminPassword := ?newPassword;
          true
        } else { false }
      };
      case null { false };
    }
  };

  // ===== Types =====
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
    blob : Storage.ExternalBlob;
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

  // ===== State (Text keys to match deployed state) =====
  var aboutText : Text = "Welcome to Anandstudio!";
  var contactInfo : Text = "Contact us at anandstudio848@gmail.com";
  var photoCounter : Nat = 0;
  var nextServiceId : Nat = 0;
  var nextGalleryId : Nat = 0;
  var nextGalleryPhotoId : Nat = 0;

  let photos = Map.empty<Text, Photo>();
  let services = Map.empty<Text, Service>();
  let clientGalleries = Map.empty<Text, ClientGallery>();
  let galleryTokens = Map.empty<Text, Text>();
  let gallerySelections = Map.empty<Text, ClientSelection>();

  // ===== About & Contact =====
  public shared func updateAbout(sessionToken : Text, text : Text) : async () {
    requireSession(sessionToken);
    aboutText := text;
  };

  public query func getAbout() : async Text { aboutText };

  public shared func updateContactInfo(sessionToken : Text, info : Text) : async () {
    requireSession(sessionToken);
    contactInfo := info;
  };

  public query func getContactInfo() : async Text { contactInfo };

  // ===== Photos =====
  public shared func addPhoto(sessionToken : Text, title : Text, category : Category, blob : Storage.ExternalBlob) : async Text {
    requireSession(sessionToken);
    let id = photoCounter;
    photoCounter += 1;
    let idText = id.toText();
    photos.add(idText, { id = idText; title; category; blob });
    idText
  };

  public shared func deletePhoto(sessionToken : Text, id : Text) : async () {
    requireSession(sessionToken);
    photos.remove(id);
  };

  public query func getAllPhotos() : async [Photo] {
    photos.values().toArray()
  };

  public query func getPhotosByCategory(category : Category) : async [Photo] {
    photos.values().toArray().filter(func(p) { p.category == category })
  };

  // ===== Services =====
  public shared func addService(sessionToken : Text, name : Text, description : Text, priceRange : Text) : async () {
    requireSession(sessionToken);
    let id = nextServiceId;
    nextServiceId += 1;
    let idText = id.toText();
    services.add(idText, { id = idText; name; description; priceRange });
  };

  public shared func updateService(sessionToken : Text, id : Text, name : Text, description : Text, priceRange : Text) : async () {
    requireSession(sessionToken);
    services.add(id, { id; name; description; priceRange });
  };

  public shared func deleteService(sessionToken : Text, id : Text) : async () {
    requireSession(sessionToken);
    services.remove(id);
  };

  public query func getAllServices() : async [Service] {
    services.values().toArray()
  };

  // ===== Client Galleries =====
  public shared func createClientGallery(sessionToken : Text, name : Text, photoBlobs : [Storage.ExternalBlob], accessCode : ?Text) : async Text {
    requireSession(sessionToken);
    let galleryId = nextGalleryId;
    nextGalleryId += 1;
    let galleryIdText = galleryId.toText();
    let token = Time.now().toText() # "_" # galleryIdText;
    var i = 0;
    let galleryPhotos = photoBlobs.map(func(blob) {
      let photoId = nextGalleryPhotoId;
      nextGalleryPhotoId += 1;
      let title = name # " Photo " # i.toText();
      i += 1;
      { id = photoId.toText(); title; blob }
    });
    clientGalleries.add(galleryIdText, {
      id = galleryIdText;
      name;
      token;
      accessCode;
      photos = galleryPhotos;
      createdAt = Time.now();
    });
    galleryTokens.add(token, galleryIdText);
    galleryIdText
  };

  public shared func deleteClientGallery(sessionToken : Text, galleryId : Text) : async () {
    requireSession(sessionToken);
    switch (clientGalleries.get(galleryId)) {
      case null { Runtime.trap("Gallery not found") };
      case (?gallery) {
        clientGalleries.remove(galleryId);
        galleryTokens.remove(gallery.token);
        gallerySelections.remove(galleryId);
      };
    }
  };

  public query func getAllClientGalleries(sessionToken : Text) : async [{ gallery : ClientGallery; selection : ?ClientSelection }] {
    if (not isValidSession(sessionToken)) { Runtime.trap("Unauthorized") };
    clientGalleries.keys().toArray().map(func(galleryId) {
      let gallery = clientGalleries.get(galleryId).unwrap();
      { gallery; selection = gallerySelections.get(galleryId) }
    })
  };

  public query func getClientGalleryByToken(token : Text) : async GalleryAccessResult {
    switch (galleryTokens.get(token)) {
      case null { { gallery = null; selection = null; hasCode = false } };
      case (?galleryId) {
        switch (clientGalleries.get(galleryId)) {
          case null { { gallery = null; selection = null; hasCode = false } };
          case (?gallery) {
            let pub = {
              id = gallery.id;
              name = gallery.name;
              token = gallery.token;
              photos = gallery.photos;
              createdAt = gallery.createdAt;
            };
            {
              gallery = ?pub;
              selection = gallerySelections.get(galleryId);
              hasCode = gallery.accessCode != null;
            }
          };
        }
      };
    }
  };

  public query func verifyGalleryCode(token : Text, code : Text) : async Bool {
    switch (galleryTokens.get(token)) {
      case null { false };
      case (?galleryId) {
        switch (clientGalleries.get(galleryId)) {
          case null { false };
          case (?gallery) {
            switch (gallery.accessCode) {
              case null { true };
              case (?ac) { ac == code };
            }
          };
        }
      };
    }
  };

  public shared func submitClientSelection(galleryId : Text, token : Text, selectedPhotoIds : [Text], customerNote : Text) : async () {
    switch (galleryTokens.get(token)) {
      case null { Runtime.trap("Invalid token") };
      case (?storedGalleryId) {
        if (storedGalleryId != galleryId) { Runtime.trap("Token mismatch") };
        gallerySelections.add(galleryId, {
          galleryId;
          selectedPhotoIds;
          customerNote;
          submittedAt = Time.now();
        });
      };
    }
  };

  public query func getClientGallerySelection(sessionToken : Text, galleryId : Text) : async ?ClientSelection {
    if (not isValidSession(sessionToken)) { Runtime.trap("Unauthorized") };
    gallerySelections.get(galleryId)
  };
};
