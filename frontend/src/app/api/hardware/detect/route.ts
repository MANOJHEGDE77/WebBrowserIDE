import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8080';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  const url = `${BACKEND_URL}/api/hardware/detect${queryString ? `?${queryString}` : ''}`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      {
        success: false,
        count: 0,
        detected: false,
        devices: [],
        primary_device: null,
        primary_chip: null,
        error: `Backend detector returned status ${res.status}`,
      },
      { status: res.status }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Backend detector unreachable';
    return NextResponse.json({
      success: false,
      count: 0,
      detected: false,
      devices: [],
      primary_device: null,
      primary_chip: null,
      error: message,
    });
  }
}
