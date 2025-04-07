const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();


function doGet() {
  // Load the HTML file as a template
  var html = HtmlService.createTemplateFromFile("index"); // Replace "index" with your HTML filename

  // Evaluate the template into HTML
  var evaluated = html.evaluate();

  // Add the meta tag for responsive design
  evaluated.addMetaTag("viewport", "width=device-width, initial-scale=1");

  // Set title and optional favicon
  evaluated.setTitle("VioletPass");
  evaluated.setFaviconUrl("https://www.nyu.edu/favicon.ico"); 

  return evaluated;
}
/**
 * Add a new coupon entry to the Google Sheet
 * Generate a QR code with a unique coupon ID.
 * @param {Object} couponData - Coupon details
 */

function addCouponEntry(couponData) {
  try {
    // Validate inputs
    if (!couponData) throw new Error("Coupon data is required.");
    if (!couponData.expirationDate) throw new Error("Expiration date is missing.");
    if (!couponData.serviceType) throw new Error("Service type is missing.");
    if (!couponData.discount || isNaN(couponData.discount)) throw new Error("Valid discount is required.");
    if (!couponData.usesAllowed) throw new Error("Uses allowed is missing.");
    if (!couponData.recipientEmail) throw new Error("Recipient email is missing.");
    if (!couponData.recipientName) throw new Error("Recipient name is missing.");

    // Generate a unique ID for the coupon
    const uniqueId = `C-${new Date().getTime()}`;

    // Generate QR code for the unique coupon IDsadf
    
     const passDetails = createPassInPasscreator({
      uniqueId: uniqueId,
      expirationDate: couponData.expirationDate,
      serviceType: couponData.serviceType,
      discount: couponData.discount,
      usesRemaining: couponData.usesAllowed,
      emailRecipient: couponData.recipientEmail,
      name:couponData.recipientName
    });
    Logger.log(passDetails);
    // Prepare the row data for the Google Sheet
    const qrUrl = generateQrCode(passDetails.linkToPassPage);

    sendEmailToUser(
      couponData.recipientEmail,
      couponData.recipientName,
      passDetails.linkToPassPage,
      qrUrl
    );

    const rowData = [
      uniqueId,                     // Coupon ID
      couponData.expirationDate,    // Expiration Date
      couponData.serviceType,       // Service Type
      couponData.discount,          // Discount
      couponData.usesAllowed,       // Total Uses Allowed
      couponData.usesAllowed,       // Remaining Uses
      couponData.recipientEmail,    // Recipient Email
      couponData.recipientName,     // Recipient Name
      couponData.phoneNumber, // Save phone number
      qrUrl,                        // QR Code URL
      passDetails.linkToPassPage,    // Pass Download Page,
      "Active",                      // Status
      
    ];

    // Ensure the sheet has the required headers
    ensureSheetHeaders();

    // Append the data to the Google Sheet
    sheet.appendRow(rowData);

     return {
      id: uniqueId,
      qrUrl: qrUrl,
      passUrl:passDetails.linkToPassPage

     
    };
  } catch (error) {
    Logger.log(error.message);
    throw new Error(`Failed to add coupon: ${error.message}`);
  }
}

/**
 * Generate a QR code using QuickChart API
 * @param {string} uniqueId - Unique coupon ID
 * @returns {string} - The URL to the generated QR code
 */
function generateQrCode(uniqueId) {
  try {
    if (!uniqueId) throw new Error("Unique ID is required to generate a QR code.");

    const qrUrl = `https://quickchart.io/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(uniqueId)}`;
    return qrUrl;
  } catch (error) {
    Logger.log(error.message);
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
}
function sendEmailToUser(email, recipientName, passLink, qrCodeUrl) {
  try {
    if (!email || !passLink || !qrCodeUrl) {
      throw new Error("Missing required fields to send email.");
    }

    const subject = "Your Coupon Details";
    const body = `
      <p>Hi ${recipientName},</p>
      <p>Thank you for using our service. Here are your coupon details:</p>
      <ul>
        <li><strong>Pass Link:</strong> <a href="${passLink}" target="_blank">${passLink}</a></li>
      </ul>
      <p>You can also use the QR code below to access your coupon:</p>
      <img src="${qrCodeUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
      <p>If you have any questions, feel free to reach out.</p>
      <p>Best regards,<br>Your Company</p>
    `;

    GmailApp.sendEmail(email, subject, "", {
      htmlBody: body,
    });

    Logger.log(`Email sent successfully to ${email}`);
  } catch (error) {
    Logger.log(`Failed to send email: ${error.message}`);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}





/**
 * Ensure the Google Sheet has the necessary headers.
 */
/**
 * Ensure the Google Sheet has the necessary headers.
 */
function ensureSheetHeaders() {
  const headers = [
    "Coupon ID", "Expiration Date", "Service Type", "Discount",
    "Total Uses Allowed", "Remaining Uses", "Recipient Email",
    "Recipient Name", "Phone Number", "qrURL", "PassURL", "Status"
  ];
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Check if the current headers match the desired headers
  if (!headers.every((header, index) => currentHeaders[index] === header)) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}


function createPassInPasscreator(passData) {
  try {
    const apiKey = "IH1cco8Qad2/37Ayf2y.TrlLMO3lfQZs0oSe-kK67KGwSg&7OyPTOY&D5pfr!%AP=EjMpPxudESu_a/&";
    if (!apiKey) throw new Error("API key is missing!");

    const templateId = "77a79afc-07f3-4394-bd66-e30702d8382a"; // Replace with your template ID
    const endpoint = `https://app.passcreator.com/api/pass?passtemplate=${templateId}&zapierStyle=true`;

    const payload = {
      userProvidedId: passData.uniqueId,
      barcodeValue: passData.uniqueId,
      expirationDate: passData.expirationDate,
      serviceType: passData.serviceType, // Replace these with your template's unique field IDs
      discount: passData.discount,
      usesRemaining: passData.usesRemaining,
      emailRecipient: passData.emailRecipient,
      name: passData.name,
    };

    Logger.log(`Payload: ${JSON.stringify(payload)}`); // Log payload for debugging

    const options = {
      method: "post",
      contentType: "application/json",
      headers: {
        Authorization: apiKey,
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(endpoint, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log(`Response Code: ${responseCode}`);
    Logger.log(`Response Body: ${responseText}`);

    
    const responseData = JSON.parse(responseText);
    Logger.log(responseData);
    if (responseCode !== 201 || !responseData.identifier) {
      throw new Error(
      `Failed to create Passcreator pass: ${responseData.description || "Unknown error"}`
    );
}


    return responseData;
  } catch (error) {
    Logger.log(`Error: ${error.message}`);
    throw new Error(`Failed to create Passcreator pass: ${error.message}`);
  }
}


/**
 * Redeem a coupon by checking its status and updating remaining uses.
 * @param {string} couponId - The unique ID of the coupon.
 * @returns {string} - A message indicating the redemption result.
 */
function redeemCoupon(couponId) {
  try {
    if (!couponId) throw new Error("Coupon ID is required.");

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    const today = new Date(); // Current date for expiration validation

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Check if the coupon ID matches
      if (row[0] === couponId) {
        const expirationDate = new Date(row[1]); // Expiration Date column
        const status = row[11]; // Status column
        let remainingUses = row[5]; // Remaining Uses column

        // Check if the coupon is already redeemed or inactive
        if (status === "Redeemed" || status === "Inactive") {
          throw new Error(`Coupon ID ${couponId} cannot be redeemed. Status: ${status}.`);
        }

        // Check if the coupon is expired
        if (expirationDate < today) {
          sheet.getRange(i + 1, 12).setValue("Inactive"); // Mark as inactive
          throw new Error(`Coupon ID ${couponId} is expired and cannot be redeemed.`);
        }

        // Handle unlimited coupons
        if (remainingUses === "Unlimited") {
          return `Coupon ID ${couponId} successfully redeemed. Remaining uses: Unlimited.`;
        } else {
          // Parse remaining uses and ensure it is a valid number
          remainingUses = parseInt(remainingUses, 10);

          if (remainingUses <= 0) {
            sheet.getRange(i + 1, 12).setValue("Redeemed"); // Mark as redeemed
            throw new Error(`Coupon ID ${couponId} cannot be redeemed. No remaining uses.`);
          } else {
            // Decrement remaining uses by 1
            remainingUses -= 1;

            // Update the Google Sheet before returning the response
            sheet.getRange(i + 1, 6).setValue(remainingUses); // Update Remaining Uses column
            if (remainingUses === 0) {
              sheet.getRange(i + 1, 12).setValue("Redeemed"); // Mark as redeemed if no uses left
            }

            return `Coupon ID ${couponId} successfully redeemed. Remaining uses: ${remainingUses}.`;
          }
        }
      }
    }

    // If no matching coupon ID is found
    throw new Error(`Coupon ID ${couponId} not found.`);
  } catch (error) {
    Logger.log(error.message);
    throw new Error(`Failed to redeem coupon: ${error.message}`);
  }
}


/**
 * Include external files for client-side code.
 * @param {string} filename - Name of the file to include.
 * @returns {string} - Content of the file.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
