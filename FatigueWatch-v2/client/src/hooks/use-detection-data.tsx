import { createContext, useContext, useState, ReactNode } from "react";

export interface DetectionData {
  yawnDetected: boolean;
  eyeState: 'open' | 'closed' | 'drowsy';
  blinkRate: number;
  headPosition: 'center' | 'left' | 'right' | 'down';
  drowsinessScore: number;
  alertLevel: 'safe' | 'warning' | 'critical';
  faceDetected: boolean;
  yawnCount: number;
}

const DetectionContext = createContext<{
  detectionData: DetectionData;
  updateDetection: (data: Partial<DetectionData>) => void;
} | undefined>(undefined);

export function DetectionProvider({ children }: { children: ReactNode }) {
  const [detectionData, setDetectionData] = useState<DetectionData>({
    yawnDetected: false,
    eyeState: 'open',
    blinkRate: 0,
    headPosition: 'center',
    drowsinessScore: 0,
    alertLevel: 'safe',
    faceDetected: false,
    yawnCount: 0
  });

  const updateDetection = (data: Partial<DetectionData>) => {
    setDetectionData(prev => ({
      ...prev,
      ...data,
      // Increment yawn count when yawn is detected
      yawnCount: data.yawnDetected && !prev.yawnDetected 
        ? prev.yawnCount + 1 
        : prev.yawnCount
    }));
  };

  return (
    <DetectionContext.Provider value={{ detectionData, updateDetection }}>
      {children}
    </DetectionContext.Provider>
  );
}

export function useDetectionData() {
  const context = useContext(DetectionContext);
  if (context === undefined) {
    throw new Error('useDetectionData must be used within a DetectionProvider');
  }
  return context;
}