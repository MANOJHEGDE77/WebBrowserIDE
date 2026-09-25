import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8080';

export async function GET() {
  const url = `${BACKEND_URL}/api/hardware/ports`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ success: false, ports: [] });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, ports: [] });
  }
}
