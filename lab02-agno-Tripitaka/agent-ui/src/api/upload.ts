import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const url = formData.get('url') as string | null;
    let pythonArgs: string[] = [];
    let tempFilePath = '';

    if (file && file.size > 0) {
      // Lưu file tạm vào /tmp
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = `upload_${Date.now()}.pdf`;
      tempFilePath = path.join('/tmp', fileName);
      fs.writeFileSync(tempFilePath, buffer);
      pythonArgs = ['process_pdf.py', '--file', tempFilePath];
    } else if (url && url.length > 0) {
      pythonArgs = ['process_pdf.py', '--url', url];
    } else {
      return new Response('Vui lòng upload file hoặc nhập URL.', { status: 400 });
    }

    // Tạo stream để trả về dữ liệu stdout từ Python
    const stream = new ReadableStream({
      start(controller) {
        const py = spawn('python3', pythonArgs);
        py.stdout.on('data', (data) => {
          controller.enqueue(data);
        });
        py.stderr.on('data', (data) => {
          // Đẩy lỗi ra stream (có thể custom lại nếu muốn riêng biệt)
          controller.enqueue(Buffer.from(`ERROR: ${data.toString()}`));
        });
        py.on('close', (code) => {
          // Xóa file tạm nếu có
          if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
          controller.close();
        });
        py.on('error', (err) => {
          controller.enqueue(Buffer.from(`ERROR: ${err.message}`));
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    return new Response(err.message || 'Lỗi server.', { status: 500 });
  }
} 