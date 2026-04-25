// Bottleneck analysis algorithm
// Computes performance balance between CPU, GPU, and RAM
// considering resolution and workload adjustments.

import { RESOLUTION_WEIGHTS, WORKLOAD_WEIGHTS } from './constants';

/**
 * Calculate the bottleneck analysis for a given build.
 * @param {Object} build - The PC build with components
 * @param {string} resolution - '1080p' | '1440p' | '4K'
 * @param {string} workload - 'gaming' | 'streaming' | 'rendering' | 'general'
 * @returns {Object} Analysis result with scores, severity, and balance
 */
export function analyzeBottleneck(build, resolution = '1440p', workload = 'gaming') {
  const { cpu, gpu, ram } = build;

  if (!cpu || !gpu) {
    return {
      overallScore: 0,
      bottleneckPercentage: 0,
      bottleneckComponent: null,
      bottleneckSeverity: 'none',
      cpuGpuBalance: 0,
      componentScores: {},
      details: 'Please select at least a CPU and GPU to analyze.',
    };
  }

  const resWeights = RESOLUTION_WEIGHTS[resolution] || RESOLUTION_WEIGHTS['1440p'];
  const workWeights = WORKLOAD_WEIGHTS[workload] || WORKLOAD_WEIGHTS['gaming'];

  // Calculate weighted scores
  const cpuWeighted = cpu.benchmarkScore * resWeights.cpu * workWeights.cpu;
  const gpuWeighted = gpu.benchmarkScore * resWeights.gpu * workWeights.gpu;
  const ramWeighted = ram ? ram.benchmarkScore * resWeights.ram * workWeights.ram : 50;

  // Find the weakest link
  const scores = { cpu: cpuWeighted, gpu: gpuWeighted, ram: ramWeighted };
  const maxScore = Math.max(...Object.values(scores));
  const minScore = Math.min(...Object.values(scores));
  const bottleneckComponent = Object.keys(scores).find(k => scores[k] === minScore);

  // Calculate bottleneck percentage
  const bottleneckPercentage = maxScore > 0 
    ? Math.round(((maxScore - minScore) / maxScore) * 100) 
    : 0;

  // CPU vs GPU balance: negative = CPU bottleneck, positive = GPU bottleneck
  const cpuGpuBalance = Math.round(cpuWeighted - gpuWeighted);

  // Determine severity
  let bottleneckSeverity;
  if (bottleneckPercentage <= 10) bottleneckSeverity = 'none';
  else if (bottleneckPercentage <= 25) bottleneckSeverity = 'minor';
  else if (bottleneckPercentage <= 45) bottleneckSeverity = 'moderate';
  else bottleneckSeverity = 'severe';

  // Overall system score (100 = perfectly balanced, drops with imbalance)
  const overallScore = Math.max(0, Math.round(100 - bottleneckPercentage * 0.8));

  // Generate human-readable details
  const details = generateDetails(build, bottleneckComponent, bottleneckPercentage, resolution, workload, cpuGpuBalance);

  return {
    overallScore,
    bottleneckPercentage,
    bottleneckComponent,
    bottleneckSeverity,
    cpuGpuBalance,
    componentScores: {
      cpu: Math.round(cpuWeighted),
      gpu: Math.round(gpuWeighted),
      ram: Math.round(ramWeighted),
    },
    details,
  };
}

function generateDetails(build, bottleneckComponent, percentage, resolution, workload, balance) {
  const { cpu, gpu } = build;

  if (percentage <= 10) {
    return `Your ${cpu.name} and ${gpu.name} are well-balanced for ${resolution} ${workload}. No significant bottleneck detected.`;
  }

  const bottleneckName = bottleneckComponent === 'cpu' ? cpu.name
    : bottleneckComponent === 'gpu' ? gpu.name
    : build.ram?.name || 'your RAM';

  let explanation = `Your ${bottleneckName} is the primary bottleneck (${percentage}% imbalance) `;

  if (bottleneckComponent === 'cpu') {
    explanation += `at ${resolution} ${workload}. `;
    if (resolution === '1080p') {
      explanation += `At 1080p, the CPU handles more draw calls and game logic per frame, making CPU performance critical. `;
    }
    explanation += `The ${gpu.name} is being held back and cannot reach its full potential.`;
  } else if (bottleneckComponent === 'gpu') {
    explanation += `at ${resolution} ${workload}. `;
    if (resolution === '4K') {
      explanation += `At 4K resolution, the GPU must render 4x more pixels than 1080p, putting enormous strain on it. `;
    }
    explanation += `The ${cpu.name} is waiting on the GPU to finish rendering frames.`;
  } else {
    explanation += `for ${workload}. Insufficient or slow RAM can cause stuttering and limit both CPU and GPU performance.`;
  }

  return explanation;
}

/**
 * Calculate total power draw of the build
 */
export function calculatePowerDraw(build) {
  let totalTdp = 0;
  const components = ['cpu', 'gpu', 'ram', 'storage'];
  
  for (const key of components) {
    if (build[key]) {
      totalTdp += build[key].tdp || 0;
    }
  }

  // Add ~50W for motherboard, fans, etc.
  totalTdp += 50;

  return totalTdp;
}

/**
 * Get recommended PSU wattage (TDP + 20% headroom)
 */
export function getRecommendedPSU(build) {
  const draw = calculatePowerDraw(build);
  return Math.ceil(draw * 1.2 / 50) * 50; // Round to nearest 50W
}
