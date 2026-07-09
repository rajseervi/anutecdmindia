import { NextRequest, NextResponse } from 'next/server';
import { readSheetReadonly, updateSheet, appendSheet, clearSheet, batchUpdate, getSpreadsheet } from '@/lib/sheets';
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from '@/types/company';

const RANGE = 'Sheet1!A2:I';
const FULL_RANGE = 'Sheet1!A:I';
const SETTINGS_RANGE = 'Settings!A2:H2';

function parseCompanyRow(row?: string[]): CompanyProfile {
  if (!row || row.length === 0) {
    return DEFAULT_COMPANY_PROFILE;
  }
  const [name, tagline, description, email, phone, website, address, showPrices] = row;
  return {
    name: name || DEFAULT_COMPANY_PROFILE.name,
    tagline: tagline || DEFAULT_COMPANY_PROFILE.tagline,
    description: description || DEFAULT_COMPANY_PROFILE.description,
    email: email || DEFAULT_COMPANY_PROFILE.email,
    phone: phone || DEFAULT_COMPANY_PROFILE.phone,
    website: website || DEFAULT_COMPANY_PROFILE.website,
    address: address || DEFAULT_COMPANY_PROFILE.address,
    showPrices: showPrices === 'FALSE' ? false : true,
  };
}

function isValidUrl(string: string) {
  try { new URL(string); return true; }
  catch { return false; }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const includeHidden = searchParams.get('includeHidden') === 'true';
  const search = (searchParams.get('search') || '').toLowerCase();
  const category = (searchParams.get('category') || '').toLowerCase();

  try {
    const [productRows, settingsRows] = await Promise.all([
      readSheetReadonly(RANGE),
      readSheetReadonly(SETTINGS_RANGE).catch(() => undefined as undefined),
    ]);

    const settingsRow = settingsRows?.[0];
    const company = parseCompanyRow(settingsRow);

    const products = productRows
      .filter((row) => {
        // Skip rows that have been cleared (deleted) or are completely empty
        return row[0] && row[0].trim().length > 0 && row[1] && row[1].trim().length > 0;
      })
      .map((row) => {
        let imageUrl = row[4];
        if (!imageUrl || imageUrl.trim() === '' || !isValidUrl(imageUrl)) {
          imageUrl = 'https://via.placeholder.com/400x300?text=No+Image';
        }
        return {
          id: row[0],
          name: row[1],
          description: row[2],
          price: parseFloat(row[3]) || 0,
          imageUrl,
          qrCode: row[5],
          inventory: parseInt(row[6] || '0') || 0,
          category: (row[7] || '').toString(),
          hidden: row[8]?.toString().toLowerCase() === 'true' || row[8] === '1',
        };
      });

    if (id) {
      const product = products.find(p => p.id === id);
      if (!product) {
        return NextResponse.json({ error: 'Product not found', company }, { status: 404 });
      }
      return NextResponse.json({ company, product });
    }

    const visibleProducts = includeHidden ? products : products.filter(p => !p.hidden);
    const categories = Array.from(
      new Set(visibleProducts.map((p) => (p.category || '').trim()).filter(Boolean))
    );

    let filteredProducts = visibleProducts;
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(p => (p.category || '').toLowerCase() === category);
    }
    if (search) {
      filteredProducts = filteredProducts.filter(p => {
        return [p.name, p.description, p.id, p.category]
          .filter(Boolean)
          .some((val) => (val as string).toLowerCase().includes(search));
      });
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const total = filteredProducts.length;

    if (limit === -1) {
      return NextResponse.json({ products: filteredProducts, total, page: 1, limit, totalPages: 1, categories, company });
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedProducts = filteredProducts.slice(start, end);

    return NextResponse.json({
      products: paginatedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      categories,
      company,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch products', details: errorMessage, timestamp: new Date().toISOString() }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, price, imageUrl, qrCode, inventory, category, hidden } = body;

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Validate required fields for updates too
    const errors: string[] = [];
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Product name is required');
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      errors.push('Description is required');
    }
    if (price === undefined || price === null || typeof price !== 'number' || isNaN(price) || price < 0) {
      errors.push('A valid price is required');
    }
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
      errors.push('Image URL is required');
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const safeName = name.trim();
    const safeDescription = description.trim();
    const safePrice = price;
    const safeImageUrl = imageUrl.trim();
    const safeQrCode = (qrCode || '').trim();
    const safeInventory = typeof inventory === 'number' && !isNaN(inventory) && inventory >= 0 ? Math.floor(inventory) : 0;
    const safeCategory = (category || '').trim();
    const safeHidden = !!hidden;

    const rows = await readSheetReadonly(FULL_RANGE);
    const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // rowIndex is 0-based in the array; sheet rows are 1-based with header at row 1.
    // rows[0]=header(sheet row 1), rows[1]=first product(sheet row 2), etc.
    // So rows[rowIndex] maps to sheet row (rowIndex + 1).
    const sheetRow = rowIndex + 1;
    const updateRange = `Sheet1!A${sheetRow}:I${sheetRow}`;
    const values = [[id, safeName, safeDescription, safePrice.toString(), safeImageUrl, safeQrCode, safeInventory.toString(), safeCategory, safeHidden ? 'true' : 'false']];
    await updateSheet(updateRange, values);

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to update product', details: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, imageUrl, qrCode, inventory, category, hidden } = body;

    // Validate required fields
    const errors: string[] = [];
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Product name is required');
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      errors.push('Description is required');
    }
    if (price === undefined || price === null || typeof price !== 'number' || isNaN(price) || price < 0) {
      errors.push('A valid price is required');
    }
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
      errors.push('Image URL is required');
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    // Sanitize and cast
    const safeName = name.trim();
    const safeDescription = description.trim();
    const safePrice = price;
    const safeImageUrl = imageUrl.trim();
    const safeQrCode = (qrCode || '').trim();
    const safeInventory = typeof inventory === 'number' && !isNaN(inventory) && inventory >= 0 ? Math.floor(inventory) : 0;
    const safeCategory = (category || '').trim();
    const safeHidden = !!hidden;

    // Generate a unique ID using timestamp + random to avoid collisions
    const nextId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const values = [[nextId, safeName, safeDescription, safePrice.toString(), safeImageUrl, safeQrCode, safeInventory.toString(), safeCategory, safeHidden ? 'true' : 'false']];
    await appendSheet('Sheet1!A:I', values);

    return NextResponse.json({ success: true, message: 'Product added successfully', id: nextId });
  } catch (error) {
    console.error('Error adding product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to add product', details: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const [rows, spreadsheet] = await Promise.all([
      readSheetReadonly(FULL_RANGE),
      getSpreadsheet(),
    ]);

    const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // rows[0]=header(sheet row 1), rows[1]=first product(sheet row 2), etc.
    // Sheet rows are 0-based in deleteDimension, so rows[rowIndex] → 0-based index rowIndex
    const sheet1 = spreadsheet.sheets.find((s) => s.properties.title === 'Sheet1');
    if (!sheet1) {
      return NextResponse.json({ error: 'Sheet1 not found' }, { status: 500 });
    }

    const sheetId = sheet1.properties.sheetId;
    // Delete the row entirely instead of just clearing it
    await batchUpdate([
      {
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex, // 0-based, same as rows array index
            endIndex: rowIndex + 1,
          },
        },
      },
    ]);

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
