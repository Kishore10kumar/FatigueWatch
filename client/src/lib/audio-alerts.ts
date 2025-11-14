export type AlertType = 'notification' | 'warning' | 'critical' | 'emergency';

class AudioAlerts {
  private audioContext: AudioContext | null = null;
  private isEnabled = true;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private createBeep(frequency: number, duration: number, volume: number = 0.1): Promise<void> {
    return new Promise((resolve) => {
      if (!this.audioContext || !this.isEnabled) {
        resolve();
        return;
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);

      oscillator.onended = () => resolve();
    });
  }

  async playNotification(): Promise<void> {
    await this.createBeep(800, 0.2);
  }

  async playWarning(): Promise<void> {
    await this.createBeep(600, 0.3);
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.createBeep(600, 0.3);
  }

  async playCritical(): Promise<void> {
    for (let i = 0; i < 3; i++) {
      await this.createBeep(400, 0.5, 0.15);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  async playEmergency(): Promise<void> {
    for (let i = 0; i < 5; i++) {
      await this.createBeep(300, 0.8, 0.2);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  isAudioEnabled(): boolean {
    return this.isEnabled;
  }
}

const audioAlerts = new AudioAlerts();

export async function playAlertSound(type: AlertType): Promise<void> {
  try {
    switch (type) {
      case 'notification':
        await audioAlerts.playNotification();
        break;
      case 'warning':
        await audioAlerts.playWarning();
        break;
      case 'critical':
        await audioAlerts.playCritical();
        break;
      case 'emergency':
        await audioAlerts.playEmergency();
        break;
    }
  } catch (error) {
    console.warn('Failed to play alert sound:', error);
  }
}

export function enableAudioAlerts(): void {
  audioAlerts.enable();
}

export function disableAudioAlerts(): void {
  audioAlerts.disable();
}

export function isAudioEnabled(): boolean {
  return audioAlerts.isAudioEnabled();
}
