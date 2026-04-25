'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const BuildContext = createContext();

export function BuildProvider({ children }) {
  const [build, setBuild] = useState({
    cpu: null, gpu: null, ram: null,
    motherboard: null, psu: null, storage: null,
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resolution, setResolution] = useState('1440p');
  const [workload, setWorkload] = useState('gaming');

  const updateComponent = useCallback((type, component) => {
    setBuild(prev => ({ ...prev, [type]: component }));
    setAnalysisResult(null);
  }, []);

  const clearBuild = useCallback(() => {
    setBuild({ cpu: null, gpu: null, ram: null, motherboard: null, psu: null, storage: null });
    setAnalysisResult(null);
  }, []);

  const loadBuild = useCallback((savedBuild) => {
    setBuild(savedBuild.components || savedBuild);
    setAnalysisResult(null);
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!build.cpu || !build.gpu) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ build, resolution, workload }),
      });
      const data = await res.json();
      setAnalysisResult(data);
      return data;
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [build, resolution, workload]);

  const totalPrice = Object.values(build).reduce((sum, c) => sum + (c?.price || 0), 0);
  const selectedCount = Object.values(build).filter(Boolean).length;

  return (
    <BuildContext.Provider value={{
      build, updateComponent, clearBuild, loadBuild,
      analysisResult, setAnalysisResult, runAnalysis, isAnalyzing,
      resolution, setResolution, workload, setWorkload,
      totalPrice, selectedCount,
    }}>
      {children}
    </BuildContext.Provider>
  );
}

export function useBuild() {
  const ctx = useContext(BuildContext);
  if (!ctx) throw new Error('useBuild must be used within BuildProvider');
  return ctx;
}
