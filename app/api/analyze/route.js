// API: POST /api/analyze
// Runs bottleneck analysis with algorithmic scoring + Gemini AI

import { NextResponse } from 'next/server';
import { analyzeBottleneck, calculatePowerDraw, getRecommendedPSU } from '@/lib/bottleneck';
import { checkCompatibility } from '@/lib/compatibility';
import { getAIAnalysis } from '@/lib/gemini';

export async function POST(request) {
  try {
    const body = await request.json();
    const { build, resolution = '1440p', workload = 'gaming' } = body;

    if (!build || !build.cpu || !build.gpu) {
      return NextResponse.json(
        { error: 'Please select at least a CPU and GPU to analyze' },
        { status: 400 }
      );
    }

    // 1. Run algorithmic analysis (instant, local)
    const algorithmResult = analyzeBottleneck(build, resolution, workload);

    // 2. Run compatibility checks
    const compatibility = checkCompatibility(build);

    // 3. Calculate power
    const powerDraw = calculatePowerDraw(build);
    const recommendedPSU = getRecommendedPSU(build);

    // 4. Get AI analysis (Gemini or fallback)
    const aiAnalysis = await getAIAnalysis(build, algorithmResult, resolution, workload);

    return NextResponse.json({
      ...algorithmResult,
      compatibility,
      powerDraw,
      recommendedPSU,
      aiAnalysis,
      resolution,
      workload,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
