// Hardware compatibility checker
// Validates socket, DDR generation, PSU wattage, and PCIe compatibility

import { calculatePowerDraw } from './bottleneck';

/**
 * Run all compatibility checks for a build
 * @param {Object} build - The PC build
 * @returns {Array} Array of compatibility results
 */
export function checkCompatibility(build) {
  const results = [];

  // Socket compatibility
  if (build.cpu && build.motherboard) {
    const cpuSocket = build.cpu.specs?.socket;
    const mbSocket = build.motherboard.specs?.socket;
    if (cpuSocket && mbSocket) {
      if (cpuSocket === mbSocket) {
        results.push({
          type: 'socket',
          status: 'pass',
          message: `CPU socket (${cpuSocket}) matches motherboard`,
          components: ['cpu', 'motherboard'],
        });
      } else {
        results.push({
          type: 'socket',
          status: 'fail',
          message: `CPU socket (${cpuSocket}) is incompatible with motherboard socket (${mbSocket})`,
          components: ['cpu', 'motherboard'],
        });
      }
    }
  }

  // RAM / Motherboard DDR compatibility
  if (build.ram && build.motherboard) {
    const ramType = build.ram.specs?.type;
    const mbMemType = build.motherboard.specs?.memoryType;
    if (ramType && mbMemType) {
      if (ramType === mbMemType) {
        results.push({
          type: 'memory',
          status: 'pass',
          message: `RAM type (${ramType}) is compatible with motherboard`,
          components: ['ram', 'motherboard'],
        });
      } else {
        results.push({
          type: 'memory',
          status: 'fail',
          message: `RAM (${ramType}) is incompatible with motherboard (${mbMemType}). Different DDR generation!`,
          components: ['ram', 'motherboard'],
        });
      }
    }
  }

  // PSU wattage check
  if (build.psu) {
    const psuWattage = build.psu.specs?.wattage || 0;
    const totalDraw = calculatePowerDraw(build);
    const headroom = psuWattage - totalDraw;
    const percentage = Math.round((totalDraw / psuWattage) * 100);

    if (headroom >= totalDraw * 0.2) {
      results.push({
        type: 'power',
        status: 'pass',
        message: `PSU (${psuWattage}W) provides adequate power. Estimated draw: ${totalDraw}W (${percentage}% load)`,
        components: ['psu'],
      });
    } else if (headroom > 0) {
      results.push({
        type: 'power',
        status: 'warn',
        message: `PSU (${psuWattage}W) has limited headroom. Estimated draw: ${totalDraw}W (${percentage}% load). Recommend at least ${Math.ceil(totalDraw * 1.2 / 50) * 50}W`,
        components: ['psu'],
      });
    } else {
      results.push({
        type: 'power',
        status: 'fail',
        message: `PSU (${psuWattage}W) is insufficient! Estimated draw: ${totalDraw}W. System may crash under load.`,
        components: ['psu'],
      });
    }
  }

  // PCIe generation check
  if (build.gpu && build.motherboard) {
    const gpuPcie = build.gpu.specs?.pciGen;
    const mbPcie = build.motherboard.specs?.pciGen;
    if (gpuPcie && mbPcie) {
      const gpuGen = parseFloat(gpuPcie.replace(/[^0-9.]/g, ''));
      const mbGen = parseFloat(mbPcie.replace(/[^0-9.]/g, ''));
      
      if (gpuGen <= mbGen) {
        results.push({
          type: 'pcie',
          status: 'pass',
          message: `GPU (${gpuPcie}) is fully supported by motherboard (${mbPcie})`,
          components: ['gpu', 'motherboard'],
        });
      } else {
        results.push({
          type: 'pcie',
          status: 'warn',
          message: `GPU supports ${gpuPcie} but motherboard only supports ${mbPcie}. GPU will work but at reduced bandwidth.`,
          components: ['gpu', 'motherboard'],
        });
      }
    }
  }

  // RAM capacity check for workload
  if (build.ram) {
    const capacity = build.ram.specs?.capacity || 0;
    if (capacity < 16) {
      results.push({
        type: 'ram_capacity',
        status: 'warn',
        message: `${capacity}GB RAM may be insufficient for modern gaming and multitasking. Consider 16GB or more.`,
        components: ['ram'],
      });
    } else if (capacity >= 32) {
      results.push({
        type: 'ram_capacity',
        status: 'pass',
        message: `${capacity}GB RAM is excellent for gaming, streaming, and content creation.`,
        components: ['ram'],
      });
    } else {
      results.push({
        type: 'ram_capacity',
        status: 'pass',
        message: `${capacity}GB RAM is adequate for most workloads.`,
        components: ['ram'],
      });
    }
  }

  return results;
}
