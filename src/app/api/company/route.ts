import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from '@/types/company';

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const RANGE = 'Settings!A2:H2';
const HEADERS_RANGE = 'Settings!A1:H1';

const headers = ['name', 'tagline', 'description', 'email', 'phone', 'website', 'address', 'showPrices'];

async function getSheetsClient(scopes: string[]) {
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

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes,
  });

  return google.sheets({ version: 'v4', auth });
}

function normalizeCompanyRow(row?: string[]): CompanyProfile {
  if (!row || row.length === 0) {
    return DEFAULT_COMPANY_PROFILE;
  }

  const [name, tagline, description, email, phone, website, address, showPrices] = row;

  return {
    name: name?.trim() || DEFAULT_COMPANY_PROFILE.name,
    tagline: tagline?.trim() || DEFAULT_COMPANY_PROFILE.tagline,
    description: description?.trim() || DEFAULT_COMPANY_PROFILE.description,
    email: email?.trim() || DEFAULT_COMPANY_PROFILE.email,
    phone: phone?.trim() || DEFAULT_COMPANY_PROFILE.phone,
    website: website?.trim() || DEFAULT_COMPANY_PROFILE.website,
    address: address?.trim() || DEFAULT_COMPANY_PROFILE.address,
    showPrices: showPrices === 'FALSE' ? false : (showPrices === 'TRUE' ? true : DEFAULT_COMPANY_PROFILE.showPrices),
  };
}

export async function GET() {
  try {
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets.readonly']);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const row = response.data.values?.[0];
    const company = normalizeCompanyRow(row);

    return NextResponse.json({ company });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to fetch company profile',
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = (await request.json()) as Partial<CompanyProfile>;

    const values: CompanyProfile = {
      ...DEFAULT_COMPANY_PROFILE,
      ...payload,
    };

    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);

    // Ensure headers exist
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: HEADERS_RANGE,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    });

    // Update values
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: RANGE,
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            values.name,
            values.tagline,
            values.description,
            values.email,
            values.phone,
            values.website,
            values.address,
            values.showPrices ? 'TRUE' : 'FALSE',
          ],
        ],
      },
    });

    return NextResponse.json({ success: true, message: 'Company profile updated successfully' });
  } catch (error) {
    console.error('Error updating company profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to update company profile',
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}