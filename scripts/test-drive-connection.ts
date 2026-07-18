/**
 * Run: npx tsx scripts/test-drive-connection.ts
 */
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const CLIENT_EMAIL = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const FOLDER_ID = process.env.GOOGLE_DRIVE_GALLERY_FOLDER_ID;

async function main() {
  console.log("=== Google Drive Connection Diagnostic ===\n");
  console.log("Client Email:", CLIENT_EMAIL || "❌ NOT SET");
  console.log("Private Key:", PRIVATE_KEY ? `✅ Present (${PRIVATE_KEY.length} chars)` : "❌ NOT SET");
  console.log("Folder ID:", FOLDER_ID || "❌ NOT SET");
  console.log("");

  if (!CLIENT_EMAIL || !PRIVATE_KEY || !FOLDER_ID) {
    console.error("❌ Missing required environment variables. Check .env.local.");
    process.exit(1);
  }

  // Step 1: Authenticate
  console.log("1️⃣  Authenticating...");
  let auth;
  try {
    auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    const token = await auth.authorize();
    console.log("   ✅ Auth successful, token expires:", new Date(token!.expiry_date!).toISOString());
  } catch (err) {
    console.error("   ❌ Auth failed:", (err as Error).message);
    process.exit(1);
  }

  const drive = google.drive({ version: "v3", auth });

  // Step 2: Try to get folder metadata
  console.log("\n2️⃣  Fetching folder metadata...");
  try {
    const folder = await drive.files.get({
      fileId: FOLDER_ID,
      fields: "id, name, mimeType, driveId, parents, shared, capabilities",
      supportsAllDrives: true,
    });
    console.log("   ✅ Folder found:", folder.data.name);
    console.log("   MIME Type:", folder.data.mimeType);
    console.log("   Drive ID:", folder.data.driveId || "(My Drive)");
    console.log("   Is Shared Drive:", !!folder.data.driveId);
    console.log("   Capabilities:", JSON.stringify(folder.data.capabilities, null, 2));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    let details = "";
    if (typeof err === "object" && err !== null && "response" in err) {
      const resp = (err as { response?: { status?: number; statusText?: string; data?: unknown } }).response;
      if (resp) {
        details = ` (${resp.status} ${resp.statusText}: ${JSON.stringify(resp.data)})`;
      }
    }
    console.error(`   ❌ Cannot access folder: ${message}${details}`);
    console.log("\n   💡 Possible causes:");
    console.log("      - Folder ID is wrong or folder doesn't exist");
    console.log("      - Service account was not shared on the folder");
    console.log("      - Folder is in a Shared Drive and SA isn't a member");
    console.log("      - Drive API is not enabled in Google Cloud Console");
    process.exit(1);
  }

  // Step 3: Try to list files in the folder
  console.log("\n3️⃣  Listing files in folder...");
  try {
    const res = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed = false`,
      fields: "files(id, name, mimeType)",
      pageSize: 5,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    console.log(`   ✅ Found ${(res.data.files || []).length} files`);
    (res.data.files || []).forEach((f) => {
      console.log(`      - ${f.name} (${f.mimeType})`);
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`   ❌ Cannot list files: ${message}`);
  }

  // Step 4: Try to create a test file
  console.log("\n4️⃣  Testing upload (creating a small test file)...");
  try {
    const res = await drive.files.create({
      requestBody: {
        name: "__TEST_UPLOAD_DELETE_ME__.txt",
        parents: [FOLDER_ID],
        mimeType: "text/plain",
      },
      media: {
        mimeType: "text/plain",
        body: "This is a test file created by the diagnostic script. You can delete it.",
      },
      fields: "id, name",
      supportsAllDrives: true,
    });
    console.log("   ✅ Upload successful! Created:", res.data.name, `(ID: ${res.data.id})`);

    // Step 5: Clean up — delete the test file
    console.log("\n5️⃣  Cleaning up test file...");
    await drive.files.delete({ fileId: res.data.id!, supportsAllDrives: true });
    console.log("   ✅ Test file deleted.");

    console.log("\n🎉 All tests passed! Upload should work from the app.");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`   ❌ Upload failed: ${message}`);

    let apiError = "";
    if (typeof err === "object" && err !== null && "response" in err) {
      const resp = (err as { response?: { status?: number; statusText?: string; data?: unknown } }).response;
      if (resp) {
        apiError = `\n   API Response: ${resp.status} ${resp.statusText}\n   Body: ${JSON.stringify(resp.data, null, 2)}`;
      }
    }
    console.error(apiError);

    console.log("\n   💡 Common fixes:");
    console.log("      403 'insufficientFilePermissions' → SA needs Editor access on the folder");
    console.log("      404 'File not found' → Wrong folder ID or SA not shared");
    console.log("      403 'domainPolicy' → Shared Drive restrictions; add SA as member");
    console.log("      403 'driveNotInFileScope' → Already connected but can't write");
    console.log("      Any 403 → Share folder with SA as Editor, or add SA to Shared Drive");
  }
}

main().catch(console.error);
