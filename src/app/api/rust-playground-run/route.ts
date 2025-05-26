
// This file is no longer needed as requests are made directly to the external backend.
// You can safely delete this file.
// To prevent build errors if it's somehow still referenced, we'll leave a minimal export.

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'This mock API is deprecated. Configure your frontend to call the actual backend.' }, { status: 404 });
}
