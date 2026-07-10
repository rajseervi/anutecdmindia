import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const BRANDS_SHEET = 'Brands';
const BRANDS_HEADERS = ['id', 'name', 'description', 'imageUrl', 'sortOrder'];

const BRANDS_HEADERS_RANGE = `${BRANDS_SHEET}!A1:E1`;
const BRANDS_FULL_RANGE = `${BRANDS_SHEET}!A:E`;

export interface Brand {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  badgeColor?: string;
}

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

function isRowEmpty(row: string[]): boolean {
  return !row[1]?.trim() && !row[2]?.trim() && !row[3]?.trim();
}

function parseBrandRow(row: string[]): Brand {
  let id = (row[0] || '').trim();
  if (!id) {
    id = `brand_auto_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
  return {
    id,
    name: row[1] || '',
    description: row[2] || '',
    imageUrl: row[3] || '',
    sortOrder: parseInt(row[4] || '0') || 0,
  };
}

async function readBrands(sheets: ReturnType<typeof google.sheets>): Promise<{ rows: string[][]; dataRowStartIndex: number }> {
  let response;
  try {
    response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: BRANDS_FULL_RANGE,
    });
  } catch {
    return { rows: [BRANDS_HEADERS], dataRowStartIndex: 1 };
  }

  const allRows = response.data.values || [];
  const dataRows = allRows.slice(1).filter((row) => !isRowEmpty(row));
  return { rows: [allRows[0] || BRANDS_HEADERS, ...dataRows], dataRowStartIndex: 1 };
}

async function ensureBrandsSheet(sheets: ReturnType<typeof google.sheets>) {
  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: BRANDS_HEADERS_RANGE,
    });
    // Check if headers are outdated (old sheet with cols A-D)
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: BRANDS_HEADERS_RANGE,
    });
    const existingHeaders = resp.data.values?.[0] || [];
    if (existingHeaders.length < 5 || existingHeaders[0] !== 'id') {
      // Update to new headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: BRANDS_HEADERS_RANGE,
        valueInputOption: 'RAW',
        requestBody: { values: [BRANDS_HEADERS] },
      });
      // Migrate old data: read existing rows, prepend empty id column
      const oldResp = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${BRANDS_SHEET}!A:D`,
      });
      const oldRows = oldResp.data.values || [];
      for (let i = 1; i < oldRows.length; i++) {
        const row = oldRows[i];
        if (row[0]?.trim()) {
          // Migration: prepend id before name
          await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `${BRANDS_SHEET}!A${i + 1}:E${i + 1}`,
            valueInputOption: 'RAW',
            requestBody: {
              values: [[
                `brand_${Date.now()}_${i}`,
                row[0] || '', // name
                row[1] || '', // description
                '',
                row[2] || '0', // sortOrder
              ]],
            },
          });
        }
      }
    }
  } catch {
    // Sheet doesn't exist — create it
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{
          addSheet: { properties: { title: BRANDS_SHEET } },
        }],
      },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: BRANDS_HEADERS_RANGE,
      valueInputOption: 'RAW',
      requestBody: { values: [BRANDS_HEADERS] },
    });
  }
}

async function getBrandsSheetId(sheets: ReturnType<typeof google.sheets>): Promise<number> {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.title === BRANDS_SHEET);
  const sid = sheet?.properties?.sheetId;
  if (sid === undefined || sid === null) {
    throw new Error(`Sheet "${BRANDS_SHEET}" not found`);
  }
  return sid;
}

// GET /api/brands — fetch all brands
export async function GET() {
  try {
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets.readonly']);

    let dataRows: string[][] = [];
    try {
      const { rows } = await readBrands(sheets);
      dataRows = rows.slice(1);
    } catch {
      return NextResponse.json({ brands: [] });
    }

    const brands: Brand[] = dataRows.map((row) => parseBrandRow(row));
    brands.sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json({ brands });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ brands: [] });
  }
}

// POST /api/brands — create a new brand
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, imageUrl, sortOrder } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
    await ensureBrandsSheet(sheets);

    const { rows } = await readBrands(sheets);
    const existingDataRows = rows.slice(1);

    const nextId = `brand_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${BRANDS_SHEET}!A:E`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          nextId,
          name.trim(),
          description || '',
          imageUrl || '',
          (sortOrder ?? existingDataRows.length).toString(),
        ]],
      },
    });

    return NextResponse.json({ success: true, message: 'Brand added successfully', id: nextId });
  } catch (error) {
    console.error('Error adding brand:', error);
    return NextResponse.json({ error: 'Failed to add brand' }, { status: 500 });
  }
}

// PUT /api/brands — update a brand
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, imageUrl, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 });
    }

    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
    const { rows } = await readBrands(sheets);

    const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const updateRange = `${BRANDS_SHEET}!A${rowIndex + 1}:E${rowIndex + 1}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          id,
          name || '',
          description || '',
          imageUrl || '',
          (sortOrder ?? 0).toString(),
        ]],
      },
    });

    return NextResponse.json({ success: true, message: 'Brand updated successfully' });
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
  }
}

// DELETE /api/brands — delete a brand by id
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 });
    }

    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
    const { rows } = await readBrands(sheets);

    const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const sheetId = await getBrandsSheetId(sheets);

    try {
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
    } catch {
      // Fallback: clear the row
      const deleteRange = `${BRANDS_SHEET}!A${rowIndex + 1}:E${rowIndex + 1}`;
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: deleteRange,
      });
    }

    return NextResponse.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
