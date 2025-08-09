import { NextRequest, NextResponse } from 'next/server';
import { parseDocumentFlow } from '@/ai/flows/document-parser';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Write file to a temporary location
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, file.name);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(tempFilePath, fileBuffer);
    
    const result = await parseDocumentFlow({
      filePath: tempFilePath,
      mimeType: file.type,
    });

    return NextResponse.json({ text: result.text });
  } catch (error: any) {
    console.error('Error parsing document:', error);
    return NextResponse.json(
      { error: 'Failed to parse document', details: error.message },
      { status: 500 }
    );
  }
}
