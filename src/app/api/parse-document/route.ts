import { NextRequest, NextResponse } from 'next/server';
import { parseDocumentFlow } from '@/ai/flows/document-parser';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileContentBase64 = fileBuffer.toString('base64');
    
    const result = await parseDocumentFlow({
      fileContentBase64,
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
