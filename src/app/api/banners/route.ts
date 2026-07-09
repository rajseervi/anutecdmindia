import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Banner } from '@/types/banner';

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const BANNERS_SHEET = 'Banners';
const BANNERS_FULL_RANGE = `${BANNERS_SHEET}!A:I`;
const BANNERS_HEADERS_RANGE = `${BANNERS_SHEET}!A1:I1`;

const BANNER_HEADERS = ['id', 'title', 'subtitle', 'description', 'imageUrl', 'ctaText', 'ctaLink', 'isActive', 'sortOrder'];

async function getSheetsClient(scopes: string[]) {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL!;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');

  if (
    !clientEmail ||
    clientEmail.includes('your-service-account') ||
    !privateKey ||
    privateKey.includes('YOUR_PRIVATE_KEY')
  ) {
    throw new Error('Google Sheets credentials not properly configured.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes,
  });

  return google.sheets({ version: 'v4', auth });
}

/** Check if a row is effectively empty (no meaningful content) */
function isRowEmpty(row: string[]): boolean {
  // A row is empty if id, title, subtitle, description, and imageUrl are all blank
  return !row[1]?.trim() && !row[2]?.trim() && !row[3]?.trim() && !row[4]?.trim();
}

function parseBannerRow(row: string[], index: number): Banner {
  // If id is empty, derive a unique id from the row index + timestamp-like suffix
  let id = (row[0] || '').trim();
  if (!id) {
    id = `banner_auto_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 8)}`;
  }
  const isActive = row[7]?.toString().toLowerCase() === 'true' || row[7] === '1';
  const sortOrder = parseInt(row[8] || '0') || index;
  return {
    id,
    title: row[1] || '',
    subtitle: row[2] || '',
    description: row[3] || '',
    imageUrl: row[4] || '',
    ctaText: row[5] || '',
    ctaLink: row[6] || '',
    isActive,
    sortOrder,
  };
}

/** Read all banner rows from the sheet, filtering out empty rows */
async function readBanners(sheets: ReturnType<typeof google.sheets>): Promise<{ rows: string[][]; dataRowStartIndex: number }> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: BANNERS_FULL_RANGE,
  });

  const allRows = response.data.values || [];
  
  // allRows[0] = headers row (A1:I1)
  // subsequent rows = data
  const dataRows = allRows.slice(1).filter((row) => !isRowEmpty(row));
  
  return { rows: [allRows[0] || BANNER_HEADERS, ...dataRows], dataRowStartIndex: 1 };
}

// GET /api/banners — fetch all banners
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const includeInactive = searchParams.get('includeInactive') === 'true';

  try {
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets.readonly']);

    let dataRows: string[][] = [];
    try {
      const { rows } = await readBanners(sheets);
      dataRows = rows.slice(1); // skip header
    } catch {
      // Banners sheet might not exist yet — return empty
      return NextResponse.json({ banners: [] });
    }

    const banners: Banner[] = dataRows.map((row, i) => parseBannerRow(row, i));

    // Filter active unless includeInactive is set
    const filtered = includeInactive ? banners : banners.filter((b) => b.isActive);

    // Sort by sortOrder
    filtered.sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json({ banners: filtered });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ error: 'Failed to fetch banners', banners: [] }, { status: 500 });
  }
}

/** Utility: ensure the Banners sheet exists, create it if not */
async function ensureBannersSheet(sheets: ReturnType<typeof google.sheets>) {
  try {
    // Try reading headers — will throw if sheet doesn't exist
    await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: BANNERS_HEADERS_RANGE,
    });
  } catch {
    // Sheet doesn't exist — create it and write headers
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{
          addSheet: {
            properties: { title: BANNERS_SHEET },
          },
        }],
      },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: BANNERS_HEADERS_RANGE,
      valueInputOption: 'RAW',
      requestBody: { values: [BANNER_HEADERS] },
    });
  }
}

// POST /api/banners — create a new banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, subtitle, description, imageUrl, ctaText, ctaLink, isActive, sortOrder } = body;

    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);

    // Ensure the Banners sheet exists
    await ensureBannersSheet(sheets);

    // Get existing rows to determine next id and append position
    const { rows } = await readBanners(sheets);
    const existingDataRows = rows.slice(1); // skip header

    const nextId = `banner_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${BANNERS_SHEET}!A:I`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          nextId,
          title || '',
          subtitle || '',
          description || '',
          imageUrl || '',
          ctaText || '',
          ctaLink || '',
          isActive ? 'true' : 'false',
          (sortOrder ?? existingDataRows.length).toString(),
        ]],
      },
    });

    return NextResponse.json({ success: true, message: 'Banner created successfully', id: nextId });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}

// PUT /api/banners — update a banner
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, subtitle, description, imageUrl, ctaText, ctaLink, isActive, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);

    // Re-read with readBanners to skip empty rows
    const { rows } = await readBanners(sheets);
    // rows[0] = header, rows[1..N] = data
    const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === id);

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    const updateRange = `Banners!A${rowIndex + 1}:I${rowIndex + 1}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          id,
          title || '',
          subtitle || '',
          description || '',
          imageUrl || '',
          ctaText || '',
          ctaLink || '',
          isActive ? 'true' : 'false',
          (sortOrder ?? rowIndex).toString(),
        ]],
      },
    });

    return NextResponse.json({ success: true, message: 'Banner updated successfully' });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

/** Resolve the Banners sheet ID from the spreadsheet metadata */
async function getBannersSheetId(sheets: ReturnType<typeof google.sheets>): Promise<number> {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  });
  const sheet = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === BANNERS_SHEET
  );
  const sid = sheet?.properties?.sheetId;
  if (sid === undefined || sid === null) {
    throw new Error(`Sheet "${BANNERS_SHEET}" not found`);
  }
  return sid;
}

// DELETE /api/banners — deletes a banner
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);

    // Re-read with readBanners to get only non-empty rows
    const { rows } = await readBanners(sheets);
    const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === id);

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    // Resolve the actual sheet ID dynamically
    const sheetId = await getBannersSheetId(sheets);

    // Use batchUpdate to physically delete the row instead of just clearing values
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        }],
      },
    });

    return NextResponse.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error: unknown) {
    // Fallback: if batchUpdate fails, use clear
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Error deleting banner (will fallback to clear):', errMsg);
    try {
      const { id } = await request.json();
      const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
      const { rows } = await readBanners(sheets);
      const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === id);
      if (rowIndex !== -1) {
        const deleteRange = `Banners!A${rowIndex + 1}:I${rowIndex + 1}`;
        await sheets.spreadsheets.values.clear({
          spreadsheetId: SHEET_ID,
          range: deleteRange,
        });
        return NextResponse.json({ success: true, message: 'Banner deleted (fallback clear)' });
      }
    } catch {
      // Give up
    }
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
