// API: GET/POST /api/builds
// Save and retrieve user PC builds

import { NextResponse } from 'next/server';

// In-memory store for server-side (when no Firestore)
// Client also uses localStorage as fallback
let serverBuilds = [];

export async function GET() {
  return NextResponse.json(serverBuilds);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'save') {
      const build = {
        ...body.build,
        id: `build-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      serverBuilds.push(build);
      return NextResponse.json(build);
    }

    if (action === 'delete') {
      serverBuilds = serverBuilds.filter(b => b.id !== body.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Builds API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
