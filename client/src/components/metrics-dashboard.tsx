import { useDetectionData } from "@/hooks/use-detection-data";

export default function MetricsDashboard() {
  const { detectionData } = useDetectionData();
  
  const metrics = {
    yawnCount: detectionData.yawnCount,
    eyeState: detectionData.eyeState.toUpperCase(),
    blinkRate: detectionData.blinkRate,
    headPosition: detectionData.headPosition.toUpperCase(),
    drowsinessScore: Math.round(detectionData.drowsinessScore),
    alertLevel: detectionData.alertLevel.toUpperCase()
  };

  const getMetricColor = (value: string | number, thresholds?: { warning?: number; critical?: number }) => {
    if (typeof value === 'string') {
      if (value === 'SAFE' || value === 'OPEN' || value === 'CENTER') return 'text-safe';
      if (value === 'DROWSY' || value === 'WARNING') return 'text-warning';
      if (value === 'CRITICAL' || value === 'CLOSED') return 'text-critical';
      return 'text-foreground';
    }
    
    if (thresholds) {
      if (thresholds.critical && value >= thresholds.critical) return 'text-critical';
      if (thresholds.warning && value >= thresholds.warning) return 'text-warning';
      return 'text-safe';
    }
    
    return 'text-safe';
  };

  const getMetricStatus = (alertLevel: string) => {
    switch (alertLevel) {
      case 'SAFE': return { text: 'All Clear', color: 'text-safe' };
      case 'DROWSY': return { text: 'Monitor', color: 'text-warning' };
      case 'CRITICAL': return { text: 'Alert!', color: 'text-critical' };
      default: return { text: 'Unknown', color: 'text-muted-foreground' };
    }
  };

  const status = getMetricStatus(metrics.alertLevel);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" data-testid="metrics-dashboard">
      {/* Yawn Detection */}
      <div className="metric-card rounded-lg p-4 text-center" data-testid="metric-yawn">
        <div className="text-2xl mb-2">🥱</div>
        <div className={`text-2xl font-bold ${getMetricColor(metrics.yawnCount, { warning: 3, critical: 5 })}`}>
          {metrics.yawnCount}
        </div>
        <div className="text-sm text-muted-foreground">Yawns</div>
        <div className="text-xs text-safe mt-1">Last 5 min</div>
      </div>

      {/* Eye State */}
      <div className="metric-card rounded-lg p-4 text-center" data-testid="metric-eyes">
        <div className="text-2xl mb-2">👁️</div>
        <div className={`text-sm font-bold ${getMetricColor(metrics.eyeState)}`}>
          {metrics.eyeState}
        </div>
        <div className="text-sm text-muted-foreground">Eye State</div>
        <div className="text-xs text-safe mt-1">Normal</div>
      </div>

      {/* Blink Rate */}
      <div className="metric-card rounded-lg p-4 text-center" data-testid="metric-blink">
        <div className="text-2xl mb-2">👀</div>
        <div className={`text-2xl font-bold ${getMetricColor(metrics.blinkRate, { warning: 25, critical: 30 })}`}>
          {metrics.blinkRate}
        </div>
        <div className="text-sm text-muted-foreground">Blinks/min</div>
        <div className="text-xs text-safe mt-1">Normal</div>
      </div>

      {/* Head Position */}
      <div className="metric-card rounded-lg p-4 text-center" data-testid="metric-head">
        <div className="text-2xl mb-2">🎯</div>
        <div className={`text-sm font-bold ${getMetricColor(metrics.headPosition)}`}>
          {metrics.headPosition}
        </div>
        <div className="text-sm text-muted-foreground">Head Pos</div>
        <div className="text-xs text-safe mt-1">Aligned</div>
      </div>

      {/* Drowsiness Score */}
      <div className="metric-card rounded-lg p-4 text-center" data-testid="metric-drowsiness">
        <div className="text-2xl mb-2">💤</div>
        <div className={`text-2xl font-bold ${getMetricColor(metrics.drowsinessScore, { warning: 40, critical: 70 })}`}>
          {metrics.drowsinessScore}%
        </div>
        <div className="text-sm text-muted-foreground">Drowsy</div>
        <div className="text-xs text-safe mt-1">Low Risk</div>
      </div>

      {/* Alert Level */}
      <div className="metric-card rounded-lg p-4 text-center" data-testid="metric-alert">
        <div className="text-2xl mb-2">⚡</div>
        <div className={`text-sm font-bold ${status.color} ${metrics.alertLevel === 'SAFE' ? 'pulse-safe' : metrics.alertLevel === 'DROWSY' ? 'pulse-warning' : 'pulse-critical'}`}>
          {metrics.alertLevel}
        </div>
        <div className="text-sm text-muted-foreground">Status</div>
        <div className={`text-xs mt-1 ${status.color}`}>{status.text}</div>
      </div>
    </div>
  );
}
