import { NextResponse } from 'next/server';

export function validateApiKey(request: Request): boolean {
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.RECIPEWISE_API_KEY;
  
  if (!expectedKey) {
    console.warn('RECIPEWISE_API_KEY is not set in environment variables');
    return false;
  }
  
  return apiKey === expectedKey;
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized. Invalid or missing x-api-key header.' },
    { status: 401 }
  );
}
