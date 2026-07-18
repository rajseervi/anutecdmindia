import { NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const results: string[] = [];
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  results.push("=== Firebase Storage REST API Test ===");
  results.push(`Bucket: ${bucketName || "NOT SET"}`);
  results.push(`SA Email: ${clientEmail || "NOT SET"}`);

  if (!bucketName || !clientEmail || !privateKey) {
    results.push("❌ Missing env vars");
    return NextResponse.json({ success: false, results });
  }

  // Step 1: Get token
  let accessToken: string;
  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        "https://www.googleapis.com/auth/devstorage.read_write",
        "https://www.googleapis.com/auth/firebase",
      ],
    });
    const tokenRes = await auth.getAccessToken();
    accessToken = tokenRes.token!;
    results.push("✅ Token obtained");
  } catch (err: unknown) {
    results.push(`❌ Token error: ${err instanceof Error ? err.message : String(err)}`);
    return NextResponse.json({ success: false, results });
  }

  // Step 2: Try list (to verify bucket access)
  const listUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o?maxResults=1`;
  try {
    const listRes = await fetch(listUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const listText = await listRes.text();
    results.push(`List response [${listRes.status}]: ${listText.substring(0, 200)}`);
  } catch (err: unknown) {
    results.push(`❌ List error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Step 3: Try upload
  const timestamp = Date.now();
  const filePath = `gallery/test_${timestamp}.txt`;
  const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o?name=${encodeURIComponent(filePath)}&uploadType=media`;

  try {
    const body = new Uint8Array(Buffer.from("test content"));
    const upRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "text/plain",
      },
      body,
    });
    const upText = await upRes.text();
    if (upRes.ok) {
      results.push(`✅ Upload OK: ${filePath}`);
      results.push(`Response: ${upText.substring(0, 200)}`);
      // Cleanup
      const delUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(filePath)}`;
      const delRes = await fetch(delUrl, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      results.push(`Cleanup: ${delRes.ok ? "✅ deleted" : `❌ ${delRes.status}`}`);
    } else {
      results.push(`❌ Upload failed [${upRes.status}]: ${upText}`);
    }
  } catch (err: unknown) {
    results.push(`❌ Upload exception: ${err instanceof Error ? err.message : String(err)}`);
  }

  return NextResponse.json({ success: true, results });
}
