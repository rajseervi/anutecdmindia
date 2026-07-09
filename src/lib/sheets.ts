import { JWT } from 'google-auth-library';

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

function getCredentials() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL!;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');

  if (
    !clientEmail ||
    clientEmail.includes('your-service-account') ||
    !privateKey ||
    privateKey.includes('YOUR_PRIVATE_KEY')
  ) {
    throw new Error(
      'Google Sheets credentials not properly configured. Please update .env.local with real service account credentials.'
    );
  }

  return { clientEmail, privateKey };
}

async function getAccessToken(scopes: string[]): Promise<string> {
  const { clientEmail, privateKey } = getCredentials();
  const jwt = new JWT({ email: clientEmail, key: privateKey, scopes });
  const result = await jwt.getAccessToken();
  return result.token!;
}

function getReadonlyToken(): Promise<string> {
  return getAccessToken(['https://www.googleapis.com/auth/spreadsheets.readonly']);
}

function getWriteToken(): Promise<string> {
  return getAccessToken(['https://www.googleapis.com/auth/spreadsheets']);
}

/**
 * Read values from a Google Sheet range (read-only scope).
 */
export async function readSheetReadonly(range: string): Promise<string[][]> {
  const token = await getReadonlyToken();
  const url = `${SHEETS_BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets API error ${res.status}: ${text}`);
  }

  const data = await res.json() as { values?: string[][] };
  return data.values || [];
}

/**
 * Update values in a Google Sheet range.
 */
export async function updateSheet(range: string, values: unknown[][]): Promise<void> {
  const token = await getWriteToken();
  const url = `${SHEETS_BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sheets update error ${res.status}: ${err}`);
  }
}

/**
 * Append values to a Google Sheet range.
 */
export async function appendSheet(range: string, values: unknown[][]): Promise<void> {
  const token = await getWriteToken();
  const url = `${SHEETS_BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sheets append error ${res.status}: ${err}`);
  }
}

/**
 * Clear values from a Google Sheet range.
 */
export async function clearSheet(range: string): Promise<void> {
  const token = await getWriteToken();
  const url = `${SHEETS_BASE}/${SHEET_ID}/values/${encodeURIComponent(range)}:clear`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sheets clear error ${res.status}: ${err}`);
  }
}

/**
 * Execute a batchUpdate operation (e.g., to delete rows).
 */
export async function batchUpdate(requests: unknown[]): Promise<void> {
  const token = await getWriteToken();
  const url = `${SHEETS_BASE}/${SHEET_ID}:batchUpdate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sheets batchUpdate error ${res.status}: ${err}`);
  }
}

/**
 * Get spreadsheet metadata (used to find sheet IDs).
 */
export async function getSpreadsheet(): Promise<{ sheets: Array<{ properties: { sheetId: number; title: string } }> }> {
  const token = await getReadonlyToken();
  const url = `${SHEETS_BASE}/${SHEET_ID}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Sheets get error ${res.status}`);
  return res.json();
}
