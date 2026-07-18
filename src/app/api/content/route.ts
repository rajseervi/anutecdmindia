import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { ContactContent, FooterContent, SocialLink, FooterCategory, DEFAULT_CONTACT, DEFAULT_FOOTER } from '@/types/content';

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const CONTACT_RANGE = 'Content!A2:K2';
const FOOTER_RANGE = 'Content!A4:L4';
const HEADERS_RANGE = 'Content!A1:L1';
const CONTACT_HEADERS = 'Content!A1:K1';
const FOOTER_HEADERS = 'Content!A3:L3';

const CONTACT_FIELDS = ['phone', 'email', 'address', 'businessHours', 'weekendHours', 'closedDay', 'mapEmbedUrl', 'facebook', 'instagram', 'youtube', 'whatsapp'];
const FOOTER_FIELDS = ['aboutText', 'showIsoBadge', 'isoLabel', 'showMadeInIndia', 'gstin', 'copyrightText', 'link1Label', 'link1Url', 'link2Label', 'link2Url', 'link3Label', 'link3Url'];

async function getSheetsClient(scopes: string[]) {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL!;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');

  if (!clientEmail || clientEmail.includes('your-service-account') || !privateKey || privateKey.includes('YOUR_PRIVATE_KEY')) {
    throw new Error('Google Sheets credentials not properly configured.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes,
  });

  return google.sheets({ version: 'v4', auth });
}

function parseContactRow(row?: string[]): ContactContent {
  if (!row || row.length === 0) return DEFAULT_CONTACT;
  return {
    phone: row[0] || DEFAULT_CONTACT.phone,
    email: row[1] || DEFAULT_CONTACT.email,
    address: row[2] || DEFAULT_CONTACT.address,
    businessHours: row[3] || DEFAULT_CONTACT.businessHours,
    weekendHours: row[4] || DEFAULT_CONTACT.weekendHours,
    closedDay: row[5] || DEFAULT_CONTACT.closedDay,
    mapEmbedUrl: row[6] || '',
    socialLinks: [
      { platform: 'facebook', label: 'Facebook', url: row[7] || '#', icon: 'facebook' },
      { platform: 'instagram', label: 'Instagram', url: row[8] || '#', icon: 'instagram' },
      { platform: 'youtube', label: 'YouTube', url: row[9] || '#', icon: 'youtube' },
      { platform: 'whatsapp', label: 'WhatsApp', url: row[10] || '', icon: 'whatsapp' },
    ],
  };
}

function parseFooterRow(row?: string[]): FooterContent {
  if (!row || row.length === 0) return DEFAULT_FOOTER;
  return {
    aboutText: row[0] || '',
    showIsoBadge: row[1] !== 'FALSE',
    isoLabel: row[2] || DEFAULT_FOOTER.isoLabel,
    showMadeInIndia: row[3] !== 'FALSE',
    gstin: row[4] || DEFAULT_FOOTER.gstin,
    copyrightText: row[5] || DEFAULT_FOOTER.copyrightText,
    footerLinks: [
      { label: row[6] || 'Privacy Policy', url: row[7] || '/privacy' },
      { label: row[8] || 'Terms of Service', url: row[9] || '/terms' },
      { label: row[10] || 'Sitemap', url: row[11] || '/sitemap' },
    ],
    categories: DEFAULT_FOOTER.categories,
  };
}

export async function GET() {
  try {
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets.readonly']);

    const [contactRes, footerRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: CONTACT_RANGE }).catch(() => null),
      sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: FOOTER_RANGE }).catch(() => null),
    ]);

    const contact = parseContactRow(contactRes?.data?.values?.[0]);
    const footer = parseFooterRow(footerRes?.data?.values?.[0]);

    return NextResponse.json({ contact, footer });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({
      contact: DEFAULT_CONTACT,
      footer: DEFAULT_FOOTER,
      _usingDefaults: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await request.json();
    const { contact, footer } = payload;

    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);

    // Write contact row
    if (contact) {
      const contactValues = [
        contact.phone || '',
        contact.email || '',
        contact.address || '',
        contact.businessHours || '',
        contact.weekendHours || '',
        contact.closedDay || '',
        contact.mapEmbedUrl || '',
        contact.socialLinks?.find((s: SocialLink) => s.icon === 'facebook')?.url || '#',
        contact.socialLinks?.find((s: SocialLink) => s.icon === 'instagram')?.url || '#',
        contact.socialLinks?.find((s: SocialLink) => s.icon === 'youtube')?.url || '#',
        contact.socialLinks?.find((s: SocialLink) => s.icon === 'whatsapp')?.url || '',
      ];
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: CONTACT_RANGE,
        valueInputOption: 'RAW',
        requestBody: { values: [contactValues] },
      });
    }

    // Write footer row
    if (footer) {
      const footerValues = [
        footer.aboutText || '',
        footer.showIsoBadge !== false ? 'TRUE' : 'FALSE',
        footer.isoLabel || '',
        footer.showMadeInIndia !== false ? 'TRUE' : 'FALSE',
        footer.gstin || '',
        footer.copyrightText || '',
        footer.footerLinks?.[0]?.label || 'Privacy Policy',
        footer.footerLinks?.[0]?.url || '/privacy',
        footer.footerLinks?.[1]?.label || 'Terms of Service',
        footer.footerLinks?.[1]?.url || '/terms',
        footer.footerLinks?.[2]?.label || 'Sitemap',
        footer.footerLinks?.[2]?.url || '/sitemap',
      ];
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: FOOTER_RANGE,
        valueInputOption: 'RAW',
        requestBody: { values: [footerValues] },
      });

      // Also update footer categories in a separate row
      if (footer.categories) {
        const catRange = 'Content!A6:D9';
        const catValues = footer.categories.map((c: FooterCategory) => [c.name || '', c.description || '']);
        while (catValues.length < 4) catValues.push(['', '']);
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: catRange,
          valueInputOption: 'RAW',
          requestBody: { values: catValues },
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Content updated successfully' });
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
