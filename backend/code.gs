const ADMIN_EMAIL = "Admin@gmail.com";
const ADMIN_PASS = "Admin";
const IMAGE_FOLDER_ID = "13VB59I38SzW4ekhRN4zMsFU1fpkeBxOE";

// Sheet Names
const GALLERY_SHEET = "Sheet1"; // Gallery Images
const CONTENT_SHEET = "Sheet2"; // Website Content
const MEMBERS_SHEET = "Sheet3"; // Tour Members

function doGet(e) {
  const action = e.parameter.action;

  if (action === "getImages") {
    return ContentService.createTextOutput(
      JSON.stringify(getImages())
    ).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getContent") {
    return ContentService.createTextOutput(
      JSON.stringify(getContent())
    ).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getMembers") {
    return ContentService.createTextOutput(
      JSON.stringify(getMembers())
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;

  // Handle different actions
  if (action === "uploadGallery") {
    return uploadGalleryImage(data);
  }

  if (action === "updateContent") {
    return updateWebsiteContent(data);
  }

  if (action === "addMember") {
    return addTourMember(data);
  }

  // Legacy support for old admin page
  if (data.email && data.password) {
    if (data.email !== ADMIN_EMAIL || data.password !== ADMIN_PASS) {
      throw new Error("Unauthorized");
    }
    return uploadGalleryImage(data);
  }
}

// GALLERY MANAGEMENT (Sheet1)
function uploadGalleryImage(data) {
  const blob = Utilities.newBlob(
    Utilities.base64Decode(data.image.split(",")[1]),
    "image/png",
    data.title
  );

  const folder = DriveApp.getFolderById(IMAGE_FOLDER_ID);
  const file = folder.createFile(blob);

  // Make file publicly accessible
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // Get direct image URL in /file/d/ format
  const directUrl = `https://drive.google.com/file/d/${file.getId()}/view?usp=drivesdk`;

  const sheet = SpreadsheetApp.getActive().getSheetByName(GALLERY_SHEET);
  sheet.appendRow([
    data.title,
    data.desc,
    directUrl,
    data.category,
    new Date(),
  ]);

  return ContentService.createTextOutput("OK");
}

function getImages() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(GALLERY_SHEET);
  const data = sheet.getDataRange().getValues();
  data.shift();
  return data;
}

// WEBSITE CONTENT MANAGEMENT (Sheet2)
function updateWebsiteContent(data) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(CONTENT_SHEET);

  // Clear existing content
  sheet.clear();

  // Add headers
  sheet.appendRow(["Key", "Value"]);

  // Hero Section
  sheet.appendRow(["heroTitle", data.heroTitle || ""]);
  sheet.appendRow(["heroSubtitle", data.heroSubtitle || ""]);
  sheet.appendRow(["heroDescription", data.heroDescription || ""]);

  // About Section
  sheet.appendRow(["aboutTitle", data.aboutTitle || ""]);
  sheet.appendRow(["aboutDesc", data.aboutDesc || ""]);
  sheet.appendRow(["tourDays", data.tourDays || ""]);

  // Features (1-4)
  for (let i = 1; i <= 4; i++) {
    sheet.appendRow([`feature${i}Icon`, data[`feature${i}Icon`] || ""]);
    sheet.appendRow([`feature${i}Title`, data[`feature${i}Title`] || ""]);
    sheet.appendRow([`feature${i}Desc`, data[`feature${i}Desc`] || ""]);
  }

  // Itinerary Days (1-4)
  for (let i = 1; i <= 4; i++) {
    sheet.appendRow([`day${i}Title`, data[`day${i}Title`] || ""]);
    sheet.appendRow([`day${i}Subtitle`, data[`day${i}Subtitle`] || ""]);
    sheet.appendRow([`day${i}Schedule`, data[`day${i}Schedule`] || ""]);
  }

  // Rules Section
  sheet.appendRow(["rulesTitle", data.rulesTitle || ""]);
  sheet.appendRow(["rulesDescription", data.rulesDescription || ""]);
  sheet.appendRow(["rulesHeading", data.rulesHeading || ""]);
  sheet.appendRow(["rulesContact", data.rulesContact || ""]);
  for (let i = 1; i <= 5; i++) {
    sheet.appendRow([`rule${i}`, data[`rule${i}`] || ""]);
  }

  // Sponsor Section
  sheet.appendRow(["sponsorTitle", data.sponsorTitle || ""]);
  sheet.appendRow(["sponsorDescription", data.sponsorDescription || ""]);
  sheet.appendRow(["sponsorHeading", data.sponsorHeading || ""]);
  sheet.appendRow(["sponsorSubtitle", data.sponsorSubtitle || ""]);

  // Contact Section
  sheet.appendRow(["contactEmail", data.contactEmail || ""]);
  sheet.appendRow(["departmentName", data.departmentName || ""]);
  sheet.appendRow(["facebookLink", data.facebookLink || ""]);
  sheet.appendRow(["instagramLink", data.instagramLink || ""]);
  sheet.appendRow(["youtubeLink", data.youtubeLink || ""]);

  // Footer
  sheet.appendRow(["footerText", data.footerText || ""]);

  sheet.appendRow(["lastUpdated", new Date()]);

  return ContentService.createTextOutput(
    JSON.stringify({ success: true, message: "Content updated successfully!" })
  ).setMimeType(ContentService.MimeType.JSON);
}

function getContent() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(CONTENT_SHEET);
  const data = sheet.getDataRange().getValues();
  data.shift(); // Remove header

  const content = {};
  data.forEach((row) => {
    content[row[0]] = row[1];
  });

  return content;
}

// TOUR MEMBERS MANAGEMENT (Sheet3)
function addTourMember(data) {
  const blob = Utilities.newBlob(
    Utilities.base64Decode(data.image.split(",")[1]),
    "image/png",
    data.name
  );

  const folder = DriveApp.getFolderById(IMAGE_FOLDER_ID);
  const file = folder.createFile(blob);

  // Make file publicly accessible
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // Get direct image URL in /file/d/ format
  const photoUrl = `https://drive.google.com/file/d/${file.getId()}/view?usp=drivesdk`;

  const sheet = SpreadsheetApp.getActive().getSheetByName(MEMBERS_SHEET);

  // Add header if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Name", "Email", "Phone", "Role", "Photo", "Date Added"]);
  }

  sheet.appendRow([
    data.name,
    data.email,
    data.phone,
    data.role,
    photoUrl,
    new Date(),
  ]);

  return ContentService.createTextOutput("OK");
}

function getMembers() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(MEMBERS_SHEET);
  const data = sheet.getDataRange().getValues();
  data.shift(); // Remove header
  return data;
}
