// API: GET /api/components?type=cpu
// Returns hardware components filtered by type

import { NextResponse } from 'next/server';
import cpus from '@/data/cpus.json';
import gpus from '@/data/gpus.json';
import ram from '@/data/ram.json';
import motherboards from '@/data/motherboards.json';
import psus from '@/data/psus.json';
import storage from '@/data/storage.json';

const componentDB = {
  cpu: cpus,
  gpu: gpus,
  ram: ram,
  motherboard: motherboards,
  psu: psus,
  storage: storage,
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const search = searchParams.get('search')?.toLowerCase();

  if (type && componentDB[type]) {
    let results = componentDB[type];
    if (search) {
      results = results.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.brand.toLowerCase().includes(search)
      );
    }
    return NextResponse.json(results);
  }

  // Return all types
  if (!type) {
    return NextResponse.json(componentDB);
  }

  return NextResponse.json({ error: 'Invalid component type' }, { status: 400 });
}
