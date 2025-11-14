export interface DetectionResult {
  yawnDetected: boolean;
  eyeState: 'open' | 'closed' | 'drowsy';
  blinkRate: number;
  headPosition: 'center' | 'left' | 'right' | 'down';
  drowsinessScore: number;
  alertLevel: 'safe' | 'warning' | 'critical';
}

export class DetectionSimulator {
  private lastDetection: DetectionResult;
  private sessionStartTime: number;
  private yawnHistory: number[] = [];
  private blinkHistory: number[] = [];

  constructor() {
    this.sessionStartTime = Date.now();
    this.lastDetection = {
      yawnDetected: false,
      eyeState: 'open',
      blinkRate: 18,
      headPosition: 'center',
      drowsinessScore: 15,
      alertLevel: 'safe'
    };
  }

  generateDetection(): DetectionResult {
    const sessionDurationMinutes = (Date.now() - this.sessionStartTime) / (1000 * 60);
    
    // Simulate fatigue accumulation over time
    const baseFatigue = Math.min(sessionDurationMinutes * 0.5, 30); // Max 30% from time alone
    
    // Add some randomness
    const randomFactor = (Math.random() - 0.5) * 20; // ±10%
    
    // Simulate realistic patterns
    const timeOfDay = new Date().getHours();
    let timeOfDayFactor = 0;
    
    // Higher fatigue during typical drowsy hours
    if (timeOfDay >= 13 && timeOfDay <= 15) { // Post-lunch dip
      timeOfDayFactor = 10;
    } else if (timeOfDay >= 22 || timeOfDay <= 6) { // Night hours
      timeOfDayFactor = 20;
    }

    // Calculate drowsiness score
    let drowsinessScore = Math.max(0, Math.min(100, baseFatigue + randomFactor + timeOfDayFactor));

    // Simulate yawn detection (more likely when drowsy)
    const yawnProbability = drowsinessScore > 40 ? 0.08 : 0.02;
    const yawnDetected = Math.random() < yawnProbability;
    
    if (yawnDetected) {
      this.yawnHistory.push(Date.now());
      // Remove yawns older than 5 minutes
      this.yawnHistory = this.yawnHistory.filter(time => Date.now() - time < 5 * 60 * 1000);
      drowsinessScore += 10; // Increase drowsiness when yawning
    }

    // Simulate eye state based on drowsiness
    let eyeState: 'open' | 'closed' | 'drowsy' = 'open';
    if (drowsinessScore > 70) {
      const eyeRandom = Math.random();
      if (eyeRandom < 0.15) eyeState = 'closed';
      else if (eyeRandom < 0.4) eyeState = 'drowsy';
    } else if (drowsinessScore > 40) {
      if (Math.random() < 0.1) eyeState = 'drowsy';
    }

    // Simulate blink rate (increases with fatigue)
    const baseBlinks = 15;
    const fatigueBlinkIncrease = drowsinessScore * 0.2;
    const blinkRate = Math.round(baseBlinks + fatigueBlinkIncrease + (Math.random() - 0.5) * 5);

    // Simulate head position (more deviation when drowsy)
    let headPosition: 'center' | 'left' | 'right' | 'down' = 'center';
    if (drowsinessScore > 50 && Math.random() < 0.2) {
      const positions: ('left' | 'right' | 'down')[] = ['left', 'right', 'down'];
      headPosition = positions[Math.floor(Math.random() * positions.length)];
    }

    // Determine alert level
    let alertLevel: 'safe' | 'warning' | 'critical' = 'safe';
    if (drowsinessScore >= 70 || eyeState === 'closed') {
      alertLevel = 'critical';
    } else if (drowsinessScore >= 40 || eyeState === 'drowsy' || headPosition !== 'center') {
      alertLevel = 'warning';
    }

    // Ensure drowsiness score is realistic
    drowsinessScore = Math.max(0, Math.min(100, drowsinessScore));

    const detection: DetectionResult = {
      yawnDetected,
      eyeState,
      blinkRate,
      headPosition,
      drowsinessScore: Math.round(drowsinessScore),
      alertLevel
    };

    this.lastDetection = detection;
    return detection;
  }

  getYawnCount(): number {
    return this.yawnHistory.length;
  }

  reset(): void {
    this.sessionStartTime = Date.now();
    this.yawnHistory = [];
    this.blinkHistory = [];
    this.lastDetection = {
      yawnDetected: false,
      eyeState: 'open',
      blinkRate: 18,
      headPosition: 'center',
      drowsinessScore: 15,
      alertLevel: 'safe'
    };
  }
}
