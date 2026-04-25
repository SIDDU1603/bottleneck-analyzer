// Gemini AI client for bottleneck analysis
// Falls back to local analysis when API key is not available

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/**
 * Get AI-powered analysis of a PC build using Gemini
 * Falls back to local analysis if no API key is configured
 */
export async function getAIAnalysis(build, algorithmResult, resolution, workload) {
  if (!genAI) {
    return getFallbackAnalysis(build, algorithmResult, resolution, workload);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = buildPrompt(build, algorithmResult, resolution, workload);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Try to parse as JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // If JSON parsing fails, return as plain text
    }

    return {
      explanation: text,
      technicalDetail: '',
      suggestions: [],
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return getFallbackAnalysis(build, algorithmResult, resolution, workload);
  }
}

function buildPrompt(build, result, resolution, workload) {
  const cpu = build.cpu;
  const gpu = build.gpu;
  const ram = build.ram;

  return `You are a PC hardware expert consultant. Analyze this PC build for performance bottlenecks.

BUILD CONFIGURATION:
- CPU: ${cpu?.name || 'Not selected'} (Performance Score: ${cpu?.benchmarkScore || 'N/A'}/100, TDP: ${cpu?.tdp || 'N/A'}W)
  Specs: ${cpu ? `${cpu.specs.cores} cores / ${cpu.specs.threads} threads, ${cpu.specs.boostClock}GHz boost, ${cpu.specs.socket}` : 'N/A'}
- GPU: ${gpu?.name || 'Not selected'} (Performance Score: ${gpu?.benchmarkScore || 'N/A'}/100, TDP: ${gpu?.tdp || 'N/A'}W)
  Specs: ${gpu ? `${gpu.specs.vram}GB ${gpu.specs.vramType}, ${gpu.specs.boostClock}GHz boost` : 'N/A'}
- RAM: ${ram?.name || 'Not selected'} (Performance Score: ${ram?.benchmarkScore || 'N/A'}/100)
  Specs: ${ram ? `${ram.specs.capacity}GB ${ram.specs.type}-${ram.specs.speed}` : 'N/A'}

USAGE: ${resolution} resolution, ${workload} workload
ALGORITHM RESULT: ${result.bottleneckPercentage}% bottleneck, ${result.bottleneckSeverity} severity, limiting component: ${result.bottleneckComponent || 'none'}

Provide your analysis as JSON with exactly this structure:
{
  "explanation": "A 2-3 sentence plain-English explanation of the build balance and any bottleneck, understandable by a non-technical user",
  "technicalDetail": "A technical paragraph explaining WHY the bottleneck occurs in terms of hardware architecture (draw calls, pixel throughput, memory bandwidth, etc.)",
  "suggestions": [
    {
      "component": "cpu or gpu or ram",
      "current": "current component name",
      "recommended": "specific recommended upgrade name",
      "reason": "why this upgrade helps",
      "estimatedImprovement": "percentage improvement estimate like 15-25%",
      "estimatedCost": approximate price in USD as a number
    }
  ]
}

Provide exactly 2-3 suggestions ranked by best cost-to-performance value. Focus on practical, commonly available components. If the system is well-balanced, say so and suggest only minor optimizations.`;
}

function getFallbackAnalysis(build, result, resolution, workload) {
  const { cpu, gpu, ram } = build;
  const suggestions = [];

  if (result.bottleneckComponent === 'cpu' && cpu) {
    suggestions.push({
      component: 'cpu',
      current: cpu.name,
      recommended: cpu.benchmarkScore < 60 ? 'AMD Ryzen 7 7800X3D' : 'Intel Core i9-14900K',
      reason: `Your CPU is limiting ${gpu?.name || 'GPU'} performance, especially at ${resolution} where CPU overhead is significant.`,
      estimatedImprovement: '20-35%',
      estimatedCost: cpu.benchmarkScore < 60 ? 369 : 549,
    });
  }

  if (result.bottleneckComponent === 'gpu' && gpu) {
    suggestions.push({
      component: 'gpu',
      current: gpu.name,
      recommended: gpu.benchmarkScore < 55 ? 'NVIDIA RTX 4070 SUPER' : 'NVIDIA RTX 4080 SUPER',
      reason: `Your GPU struggles at ${resolution}, unable to maintain high framerates with the detail levels your CPU can handle.`,
      estimatedImprovement: '30-50%',
      estimatedCost: gpu.benchmarkScore < 55 ? 599 : 999,
    });
  }

  if (ram && ram.specs?.type === 'DDR4') {
    suggestions.push({
      component: 'ram',
      current: ram.name,
      recommended: 'G.Skill Trident Z5 RGB 32GB DDR5-6000',
      reason: 'Upgrading to DDR5 provides better memory bandwidth, improving performance in memory-sensitive workloads.',
      estimatedImprovement: '5-12%',
      estimatedCost: 119,
    });
  }

  if (suggestions.length === 0 && result.bottleneckSeverity === 'none') {
    suggestions.push({
      component: 'overall',
      current: 'Current build',
      recommended: 'No changes needed',
      reason: 'Your build is well-balanced for the selected workload and resolution.',
      estimatedImprovement: 'N/A',
      estimatedCost: 0,
    });
  }

  return {
    explanation: result.details,
    technicalDetail: generateTechnicalDetail(build, result, resolution, workload),
    suggestions,
  };
}

function generateTechnicalDetail(build, result, resolution, workload) {
  const { cpu, gpu } = build;
  if (!cpu || !gpu) return '';

  if (result.bottleneckComponent === 'cpu') {
    return `The ${cpu.name} with ${cpu.specs.cores} cores and ${cpu.specs.boostClock}GHz boost clock is unable to keep up with the ${gpu.name}'s rendering capacity. At ${resolution}, the CPU must process draw calls, game logic, and physics calculations fast enough to feed the GPU. With a ${result.bottleneckPercentage}% performance gap, the GPU is frequently idle waiting for CPU-processed frames. This is most noticeable in CPU-intensive scenarios like large open worlds, high NPC counts, and competitive games targeting high refresh rates.`;
  }

  if (result.bottleneckComponent === 'gpu') {
    return `The ${gpu.name} with ${gpu.specs.vram}GB ${gpu.specs.vramType} is the limiting factor at ${resolution}. ${resolution === '4K' ? 'At 4K, the GPU must render over 8.3 million pixels per frame, requiring massive pixel throughput and memory bandwidth.' : `At ${resolution}, the GPU's ${gpu.specs.busWidth}-bit memory bus and ${gpu.specs.vram}GB VRAM limit texture quality and frame throughput.`} The ${cpu.name} is capable of preparing frames faster than the GPU can render them, resulting in ${result.bottleneckPercentage}% wasted CPU capacity.`;
  }

  return `The system is reasonably balanced with only ${result.bottleneckPercentage}% performance differential between components. Both the ${cpu.name} and ${gpu.name} are operating near their potential at ${resolution} ${workload}.`;
}
