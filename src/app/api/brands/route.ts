import { NextRequest, NextResponse } from 'next/server';
import { readSheetReadonly, appendSheet, updateSheet, clearSheet } from '@/lib/sheets';

const BRANDS_RANGE = 'Brands!A2:D';
const BRANDS_FULL = 'Brands!A:D';
const BRANDS_HEADERS = 'Brands!A1:D1';
const BRAND_HEADERS = ['name', 'description', 'badgeColor', 'sortOrder'];

export interface Brand {
  name: string;
  description: string;
  badgeColor: string;
  sortOrder: number;
}

function parseBrand(row: string[]): Brand {
  return {
    name: row[0]?.trim() || '',
    description: row[1]?.trim() || '',
    badgeColor: row[2]?.trim() || 'emerald',
    sortOrder: parseInt(row[3] || '0') || 0,
  };
}

export async function GET() {
  try {
    const rows = await readSheetReadonly(BRANDS_RANGE);
    const brands: Brand[] = rows
      .filter(row => row[0]?.trim())
      .map(parseBrand)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json({ brands });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ brands: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, badgeColor, sortOrder } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    const values = [[name, description || '', badgeColor || 'emerald', (sortOrder ?? 0).toString()]];
    await appendSheet(BRANDS_RANGE, values);

    return NextResponse.json({ success: true, message: 'Brand added successfully' });
  } catch (error) {
    console.error('Error adding brand:', error);
    return NextResponse.json({ error: 'Failed to add brand' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { index, name, description, badgeColor, sortOrder } = body;

    if (index === undefined || index < 0) {
      return NextResponse.json({ error: 'Valid brand index is required' }, { status: 400 });
    }

    await updateSheet(`Brands!A${index + 2}:D${index + 2}`, [[
      name || '',
      description || '',
      badgeColor || 'emerald',
      (sortOrder ?? 0).toString(),
    ]]);

    return NextResponse.json({ success: true, message: 'Brand updated successfully' });
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { index } = await request.json();

    if (index === undefined || index < 0) {
      return NextResponse.json({ error: 'Valid brand index is required' }, { status: 400 });
    }

    await clearSheet(`Brands!A${index + 2}:D${index + 2}`);
    return NextResponse.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
