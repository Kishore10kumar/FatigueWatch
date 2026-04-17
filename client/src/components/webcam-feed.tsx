import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebcam } from "@/hooks/use-webcam";
import { FaceDetectionEngine, type FaceDetectionResult } from "@/lib/face-detection";
import { apiRequest } from "@/lib/queryClient";
import { playAlertSound } from "@/lib/audio-alerts";
import { useQuery } from "@tanstack/react-query";
import { useDetectionData } from "@/hooks/use-detection-data";
import { type Driver, type DriverSession } from "@shared/schema";

type CurrentDriverResponse = {
  driver: Driver;
  session: DriverSession;
};

interface DetectionOverlay {
  faceDetected: boolean;
  eyeState: string;
  headPosition: string;
  alertLevel: 'safe' | 'warning' | 'critical';
  drowsinessScore: number;
  blinkRate: number;
  yawnDetected: boolean;
}

export default function WebcamFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceDetectionRef = useRef<FaceDetectionEngine | null>(null);
  const { stream, error, isLoading } = useWebcam();
  const [detectionOverlay, setDetectionOverlay] = useState<DetectionOverlay>({
    faceDetected: false,
    eyeState: 'Open',
    headPosition: 'Center',
    alertLevel: 'safe',
    drowsinessScore: 0,
    blinkRate: 0,
    yawnDetected: false
  });
  const [aiInitialized, setAiInitialized] = useState(false);
  const lastAlertTimeRef = useRef(0);
  const alertBeepCountRef = useRef(0);
  const prevAlertLevelRef = useRef<string>('safe');

  // Get current driver info
  const { data: currentDriver } = useQuery<CurrentDriverResponse>({
    queryKey: ['/api/drivers/current'],
  });

  // Get detection data context
  const { updateDetection } = useDetectionData();

  useEffect(() => {
    if (stream && videoRef.current && canvasRef.current) {
      videoRef.current.srcObject = stream;
      
      videoRef.current.onloadedmetadata = async () => {
        try {
          console.log('Video metadata loaded, initializing face detection...');
          
          // Initialize face detection engine
          faceDetectionRef.current = new FaceDetectionEngine();
          
          await faceDetectionRef.current.initialize(
            videoRef.current!, 
            canvasRef.current!
          );
          
          // Set up detection results callback
          faceDetectionRef.current.setOnResults(handleDetectionResults);
          setAiInitialized(true);
          console.log('Face detection setup complete');
          
        } catch (error) {
          console.error('Failed to initialize face detection:', error);
          console.log('Attempting to continue with basic camera functionality...');
          
          // Try again after a delay
          setTimeout(async () => {
            try {
              console.log('Retrying face detection initialization...');
              faceDetectionRef.current = new FaceDetectionEngine();
              await faceDetectionRef.current.initialize(videoRef.current!, canvasRef.current!);
              faceDetectionRef.current.setOnResults(handleDetectionResults);
              setAiInitialized(true);
              console.log('Face detection retry successful');
            } catch (retryError) {
              console.log('Face detection retry failed, continuing with basic camera');
            }
          }, 3000);
        }
      };
    }

    return () => {
      if (faceDetectionRef.current) {
        faceDetectionRef.current.stop();
      }
    };
  }, [stream]);

  const handleDetectionResults = async (results: FaceDetectionResult) => {
    // Update overlay state
    const overlayData = {
      faceDetected: !!results.landmarks,
      eyeState: results.eyeState === 'open' ? 'Open' : 
                results.eyeState === 'closed' ? 'Closed' : 'Drowsy',
      headPosition: results.headPosition === 'center' ? 'Center' : 
                   results.headPosition === 'left' ? 'Left' :
                   results.headPosition === 'right' ? 'Right' : 'Down',
      alertLevel: results.alertLevel,
      drowsinessScore: results.drowsinessScore,
      blinkRate: results.blinkRate,
      yawnDetected: results.yawnDetected
    };
    
    setDetectionOverlay(overlayData);

    // Update detection context for other components
    updateDetection({
      yawnDetected: results.yawnDetected,
      eyeState: results.eyeState,
      blinkRate: results.blinkRate,
      headPosition: results.headPosition,
      drowsinessScore: results.drowsinessScore,
      alertLevel: results.alertLevel,
      faceDetected: !!results.landmarks
    });

    // Send detection data to backend
    if (currentDriver?.driver?.id) {
      try {
        await apiRequest('POST', '/api/detection', {
          driverId: currentDriver.driver.id,
          yawnDetected: results.yawnDetected,
          eyeState: results.eyeState,
          blinkRate: results.blinkRate,
          headPosition: results.headPosition,
          drowsinessScore: results.drowsinessScore,
          alertLevel: results.alertLevel
        });
      } catch (error) {
        console.error('Failed to send detection data:', error);
      }
    }

    // Audio alerts: play up to 3 beeps (1 second apart), then silence until alert resets
    const now = Date.now();
    const currentLevel = results.alertLevel !== 'safe' ? results.alertLevel
      : results.yawnDetected ? 'warning'
      : 'safe';

    // Reset beep counter when returning to safe
    if (currentLevel === 'safe') {
      alertBeepCountRef.current = 0;
      prevAlertLevelRef.current = 'safe';
    } else {
      // New alert session — reset counter
      if (prevAlertLevelRef.current === 'safe') {
        alertBeepCountRef.current = 0;
      }
      prevAlertLevelRef.current = currentLevel;

      // Play beep if under 3 and at least 1 second since last beep
      if (alertBeepCountRef.current < 3 && now - lastAlertTimeRef.current >= 1000) {
        const soundType = currentLevel === 'critical' ? 'critical' : 'warning';
        playAlertSound(soundType);
        lastAlertTimeRef.current = now;
        alertBeepCountRef.current += 1;
      }
    }
  };

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'safe': return 'text-safe border-safe bg-safe/20';
      case 'warning': return 'text-warning border-warning bg-warning/20';
      case 'critical': return 'text-critical border-critical bg-critical/20';
      default: return 'text-safe border-safe bg-safe/20';
    }
  };

  const getStatusPulse = (level: string) => {
    switch (level) {
      case 'safe': return 'pulse-safe';
      case 'warning': return 'pulse-warning';
      case 'critical': return 'pulse-critical';
      default: return 'pulse-safe';
    }
  };

  if (error) {
    return (
      <Card data-testid="webcam-error">
        <CardHeader>
          <CardTitle>Live Camera Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-card border border-border rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-destructive mb-2">Camera Access Error</p>
              <p className="text-sm text-muted-foreground">
                Please allow camera access to use fatigue detection
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="webcam-feed">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Live Camera Feed</CardTitle>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${aiInitialized ? 'bg-safe pulse-safe' : 'bg-warning pulse-warning'}`} data-testid="recording-indicator" />
            <span className="text-sm text-muted-foreground">
              {aiInitialized ? 'AI Active' : 'Initializing AI'}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative bg-black aspect-video overflow-hidden rounded-b-lg">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center" data-testid="webcam-loading">
              <div className="text-white">Initializing camera...</div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                data-testid="video-stream"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ opacity: 0 }}
              />
              {!aiInitialized && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-white text-center">
                    <div className="mb-2">🤖 Initializing AI Detection...</div>
                    <div className="text-sm text-gray-300">Loading face detection models</div>
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="absolute inset-0 video-overlay">
            {/* Detection Status Overlay — top left */}
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
              <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:p-3" data-testid="detection-status">
                <div className="text-safe font-medium text-xs sm:text-sm leading-tight">
                  {detectionOverlay.faceDetected ? '✓ Face Detected' : '✗ No Face'}
                </div>
                <div className="text-muted-foreground text-xs mt-0.5 hidden sm:block">
                  Eyes: {detectionOverlay.eyeState} · Head: {detectionOverlay.headPosition}
                </div>
              </div>
            </div>

            {/* Alert badge — top right */}
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
              <div className={`border rounded-lg px-2 py-1 sm:px-3 sm:py-2 ${getStatusColor(detectionOverlay.alertLevel)} ${getStatusPulse(detectionOverlay.alertLevel)}`} data-testid="alert-status">
                <div className="flex items-center space-x-1.5">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${detectionOverlay.alertLevel === 'safe' ? 'bg-safe' : detectionOverlay.alertLevel === 'warning' ? 'bg-warning' : 'bg-critical'}`} />
                  <span className="font-medium text-xs sm:text-sm">{detectionOverlay.alertLevel.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Bottom stats bar */}
            <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4">
              <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-2 sm:p-3" data-testid="detection-landmarks">
                <div className="grid grid-cols-4 gap-1 sm:gap-4 text-xs">
                  <div className="text-center">
                    <div className={`text-base sm:text-lg mb-0.5 ${detectionOverlay.eyeState === 'Closed' ? 'text-critical' : detectionOverlay.eyeState === 'Drowsy' ? 'text-warning' : 'text-safe'}`}>👁️</div>
                    <div className="text-white leading-tight">{detectionOverlay.eyeState}</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-base sm:text-lg mb-0.5 ${detectionOverlay.yawnDetected ? 'text-warning' : 'text-safe'}`}>
                      {detectionOverlay.yawnDetected ? '🥱' : '😐'}
                    </div>
                    <div className="text-white leading-tight">{detectionOverlay.yawnDetected ? 'Yawn' : 'Normal'}</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-base sm:text-lg mb-0.5 ${detectionOverlay.headPosition === 'Center' ? 'text-safe' : 'text-warning'}`}>📐</div>
                    <div className="text-white leading-tight">{detectionOverlay.headPosition}</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-base sm:text-lg mb-0.5 ${detectionOverlay.alertLevel === 'safe' ? 'text-safe' : detectionOverlay.alertLevel === 'warning' ? 'text-warning' : 'text-critical'}`}>💤</div>
                    <div className="text-white leading-tight">{detectionOverlay.drowsinessScore}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
