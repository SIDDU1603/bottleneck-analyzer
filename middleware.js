import { NextResponse } from 'next/server';

export const config = { matcher: '/welcome' };

export async function middleware() {
  let greeting = 'Welcome to Bottleneck Analyzer!';

  // Use Vercel Edge Config if available, otherwise use default greeting
  if (process.env.EDGE_CONFIG) {
    try {
      const { get } = await import('@vercel/edge-config');
      const edgeGreeting = await get('greeting');
      if (edgeGreeting) {
        greeting = edgeGreeting;
      }
    } catch (error) {
      console.warn('Edge Config unavailable, using default greeting:', error.message);
    }
  }

  return NextResponse.json({ greeting });
}
