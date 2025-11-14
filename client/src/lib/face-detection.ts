// Robust MediaPipe imports with fallback handling
let FaceMesh: any = null;
let Camera: any = null;

export interface FaceDetectionResult {
  yawnDetected: boolean;
  eyeState: 'open' | 'closed' | 'drowsy';
  blinkRate: number;
  headPosition: 'center' | 'left' | 'right' | 'down';
  drowsinessScore: number;
  alertLevel: 'safe' | 'warning' | 'critical';
  landmarks?: any[];
}

export class FaceDetectionEngine {
  private faceMesh: any;
  private camera: any = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isInitialized = false;
  private lastBlinkTime = 0;
  private blinkCount = 0;
  private blinkHistory: number[] = [];
  private eyeClosureHistory: number[] = [];
  private mouthAspectHistory: number[] = [];
  private drowsinessScoreHistory: number[] = [];
  private onResultsCallback: ((results: FaceDetectionResult) => void) | null = null;

  constructor() {
    // Initialize will be handled in the initialize method for better error handling
    this.faceMesh = null;
  }

  private async loadMediaPipe(): Promise<boolean> {
    try {
      // Method 1: Check if already loaded
      if (FaceMesh && Camera) {
        console.log('Using pre-loaded MediaPipe modules');
        return true;
      }

      // Method 2: Dynamic import
      console.log('Attempting dynamic MediaPipe import...');
      try {
        const faceMeshModule = await import('@mediapipe/face_mesh');
        const cameraModule = await import('@mediapipe/camera_utils');
        FaceMesh = faceMeshModule.FaceMesh;
        Camera = cameraModule.Camera;
        
        if (FaceMesh && Camera) {
          console.log('Dynamic MediaPipe import successful');
          return true;
        }
      } catch (importError) {
        console.warn('ES6 import failed, trying CDN...', importError);
      }

      // Method 3: CDN Script loading fallback
      console.log('Attempting CDN fallback...');
      await this.loadMediaPipeFromCDN();
      return true;

    } catch (error) {
      console.error('All MediaPipe loading methods failed:', error);
      return false;
    }
  }

  private async loadMediaPipeFromCDN(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Load MediaPipe from CDN
      const script1 = document.createElement('script');
      script1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
      script1.onload = () => {
        const script2 = document.createElement('script');
        script2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
        script2.onload = () => {
          // Access from global window object
          FaceMesh = (window as any).FaceMesh;
          Camera = (window as any).Camera;
          if (FaceMesh && Camera) {
            console.log('MediaPipe loaded from CDN successfully');
            resolve();
          } else {
            reject(new Error('MediaPipe not available on window object'));
          }
        };
        script2.onerror = () => reject(new Error('Failed to load camera_utils from CDN'));
        document.head.appendChild(script2);
      };
      script1.onerror = () => reject(new Error('Failed to load face_mesh from CDN'));
      document.head.appendChild(script1);
    });
  }

  async initialize(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): Promise<void> {
    try {
      console.log('Initializing face detection...');
      
      this.canvas = canvasElement;
      this.ctx = canvasElement.getContext('2d');

      if (!this.ctx) {
        throw new Error('Could not get canvas context');
      }

      // Step 1: Load MediaPipe libraries
      console.log('Loading MediaPipe libraries...');
      const mediapiperLoaded = await this.loadMediaPipe();
      
      if (!mediapiperLoaded) {
        throw new Error('Failed to load MediaPipe libraries - check internet connection');
      }

      // Step 2: Initialize FaceMesh
      console.log('Initializing FaceMesh...');
      if (!FaceMesh) {
        throw new Error('FaceMesh constructor not available');
      }

      this.faceMesh = new FaceMesh({
        locateFile: (file: string) => {
          // Try multiple CDN sources for reliability
          const cdnSources = [
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
            `https://unpkg.com/@mediapipe/face_mesh/${file}`,
            `https://cdn.skypack.dev/@mediapipe/face_mesh/${file}`
          ];
          return cdnSources[0]; // Primary CDN
        }
      });

      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.faceMesh.onResults(this.onResults.bind(this));

      // Step 3: Wait for video to be ready
      console.log('Waiting for video to be ready...');
      await new Promise((resolve) => {
        if (videoElement.readyState >= 2) {
          resolve(void 0);
        } else {
          videoElement.addEventListener('loadeddata', () => resolve(void 0), { once: true });
        }
      });

      // Step 4: Initialize Camera
      console.log('Initializing camera...');
      if (!Camera) {
        throw new Error('Camera constructor not available');
      }

      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          if (this.faceMesh && this.isInitialized) {
            try {
              await this.faceMesh.send({ image: videoElement });
            } catch (frameError) {
              console.warn('Frame processing error:', frameError);
            }
          }
        },
        width: 1280,
        height: 720
      });

      await this.camera.start();
      
      // Step 5: Add delay to ensure everything is properly initialized
      console.log('Finalizing initialization...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isInitialized = true;
      console.log('Face detection initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize face detection:', error);
      console.log('Error details:', {
        faceMeshAvailable: !!FaceMesh,
        cameraAvailable: !!Camera,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Try to continue with basic functionality
      this.isInitialized = false;
      throw error;
    }
  }

  setOnResults(callback: (results: FaceDetectionResult) => void): void {
    this.onResultsCallback = callback;
  }

  private onResults(results: any): void {
    if (!this.canvas || !this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      
      // Draw face mesh
      this.drawFaceMesh(landmarks);
      
      // Analyze facial features
      const detectionResult = this.analyzeFacialFeatures(landmarks);
      
      if (this.onResultsCallback) {
        this.onResultsCallback(detectionResult);
      }
    } else {
      // No face detected
      if (this.onResultsCallback) {
        this.onResultsCallback({
          yawnDetected: false,
          eyeState: 'open',
          blinkRate: 0,
          headPosition: 'center',
          drowsinessScore: 0,
          alertLevel: 'safe'
        });
      }
    }
  }

  private drawFaceMesh(landmarks: any[]): void {
    if (!this.ctx || !this.canvas) return;

    // Set canvas size to match video
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    // Define eye landmark indices manually (MediaPipe Face Mesh 468 landmarks)
    const leftEyeLandmarks = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
    const rightEyeLandmarks = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
    const mouthLandmarks = [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318];
    
    // Draw eye regions
    this.ctx.strokeStyle = '#FF6B6B';
    this.ctx.lineWidth = 2;
    this.drawLandmarkSet(landmarks, leftEyeLandmarks);
    this.drawLandmarkSet(landmarks, rightEyeLandmarks);
    
    // Draw mouth region
    this.ctx.strokeStyle = '#4ECDC4';
    this.ctx.lineWidth = 2;
    this.drawLandmarkSet(landmarks, mouthLandmarks);
    
    // Draw key detection points
    this.ctx.fillStyle = '#FFE66D';
    const keyPoints = [
      // Eye corners and centers
      33, 133, 362, 263, // Eye corners
      159, 145, 374, 386, // Eye centers
      // Mouth corners and center
      61, 291, 13, 14, 15, // Mouth key points
      // Nose and face center
      1, 2, 5, 4, 6, 19, 20 // Nose bridge and tip
    ];
    
    keyPoints.forEach(pointIndex => {
      if (landmarks[pointIndex]) {
        const x = landmarks[pointIndex].x * this.canvas!.width;
        const y = landmarks[pointIndex].y * this.canvas!.height;
        this.ctx!.beginPath();
        this.ctx!.arc(x, y, 3, 0, 2 * Math.PI);
        this.ctx!.fill();
      }
    });
  }

  private drawLandmarkSet(landmarks: any[], landmarkIndices: number[]): void {
    if (!this.ctx || !this.canvas) return;

    // Draw points in the landmark set
    for (let i = 0; i < landmarkIndices.length; i++) {
      const currentIndex = landmarkIndices[i];
      const nextIndex = landmarkIndices[(i + 1) % landmarkIndices.length];
      
      const start = landmarks[currentIndex];
      const end = landmarks[nextIndex];
      
      if (start && end) {
        const startX = start.x * this.canvas.width;
        const startY = start.y * this.canvas.height;
        const endX = end.x * this.canvas.width;
        const endY = end.y * this.canvas.height;
        
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
      }
    }
  }

  private analyzeFacialFeatures(landmarks: any[]): FaceDetectionResult {
    // Calculate Eye Aspect Ratio (EAR)
    const leftEAR = this.calculateEyeAspectRatio(landmarks, 'left');
    const rightEAR = this.calculateEyeAspectRatio(landmarks, 'right');
    const avgEAR = (leftEAR + rightEAR) / 2;

    // Calculate Mouth Aspect Ratio (MAR) for yawn detection
    const mouthAR = this.calculateMouthAspectRatio(landmarks);

    // Detect blinks
    const eyeState = this.detectEyeState(avgEAR);
    const blinkRate = this.updateBlinkDetection(eyeState);

    // Detect yawns
    const yawnDetected = this.detectYawn(mouthAR);

    // Calculate head pose
    const headPosition = this.calculateHeadPose(landmarks);

    // Calculate drowsiness score
    const drowsinessScore = this.calculateDrowsinessScore(avgEAR, mouthAR, blinkRate, yawnDetected);

    // Determine alert level
    const alertLevel = this.determineAlertLevel(drowsinessScore, eyeState, yawnDetected);

    return {
      yawnDetected,
      eyeState,
      blinkRate,
      headPosition,
      drowsinessScore,
      alertLevel,
      landmarks
    };
  }

  private calculateEyeAspectRatio(landmarks: any[], eye: 'left' | 'right'): number {
    // Corrected eye landmark indices for MediaPipe Face Mesh 468 model
    const eyePoints = eye === 'left' ? {
      // Left eye (from viewer's perspective) - person's actual left eye
      outerCorner: 33,   // Left eye outer corner
      innerCorner: 133,  // Left eye inner corner
      topCenter: 159,    // Left eye top center
      bottomCenter: 145, // Left eye bottom center
      topOuter: 158,     // Left eye top outer
      bottomOuter: 153   // Left eye bottom outer
    } : {
      // Right eye (from viewer's perspective) - person's actual right eye  
      outerCorner: 362,  // Right eye outer corner
      innerCorner: 263,  // Right eye inner corner
      topCenter: 386,    // Right eye top center
      bottomCenter: 374, // Right eye bottom center
      topOuter: 387,     // Right eye top outer
      bottomOuter: 373   // Right eye bottom outer
    };

    const outerCorner = landmarks[eyePoints.outerCorner];
    const innerCorner = landmarks[eyePoints.innerCorner];
    const topCenter = landmarks[eyePoints.topCenter];
    const bottomCenter = landmarks[eyePoints.bottomCenter];
    const topOuter = landmarks[eyePoints.topOuter];
    const bottomOuter = landmarks[eyePoints.bottomOuter];

    if (!outerCorner || !innerCorner || !topCenter || !bottomCenter || !topOuter || !bottomOuter) {
      return 0.25; // Default open eye ratio
    }

    // Calculate vertical distances (eye opening)
    const vertical1 = this.euclideanDistance(topCenter, bottomCenter);
    const vertical2 = this.euclideanDistance(topOuter, bottomOuter);

    // Calculate horizontal distance (eye width)
    const horizontal = this.euclideanDistance(outerCorner, innerCorner);

    // Eye Aspect Ratio - higher values mean more open eyes
    const ear = (vertical1 + vertical2) / (2.0 * horizontal);
    return ear;
  }

  private calculateMouthAspectRatio(landmarks: any[]): number {
    // Mouth landmark indices for MediaPipe Face Mesh
    const mouth = {
      top: 13,    // Top of upper lip
      bottom: 14, // Bottom of lower lip
      left: 78,   // Left corner
      right: 308  // Right corner
    };

    const top = landmarks[mouth.top];
    const bottom = landmarks[mouth.bottom];
    const left = landmarks[mouth.left];
    const right = landmarks[mouth.right];

    if (!top || !bottom || !left || !right) return 0.0;

    // Calculate vertical distance (mouth opening)
    const vertical = this.euclideanDistance(top, bottom);
    
    // Calculate horizontal distance (mouth width)
    const horizontal = this.euclideanDistance(left, right);

    // Mouth Aspect Ratio
    const mar = vertical / horizontal;
    return mar;
  }

  private euclideanDistance(p1: any, p2: any): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private detectEyeState(ear: number): 'open' | 'closed' | 'drowsy' {
    // Realistic thresholds based on MediaPipe Face Mesh EAR values
    // Normal open eyes typically have EAR around 0.25-0.35
    const EAR_THRESHOLD_CLOSED = 0.15;  // Below this = closed eyes
    const EAR_THRESHOLD_DROWSY = 0.20;  // Below this = drowsy/droopy eyes


    if (ear < EAR_THRESHOLD_CLOSED) {
      return 'closed';
    } else if (ear < EAR_THRESHOLD_DROWSY) {
      return 'drowsy';
    } else {
      return 'open';
    }
  }

  private updateBlinkDetection(eyeState: 'open' | 'closed' | 'drowsy'): number {
    const now = Date.now();
    
    if (eyeState === 'closed' && now - this.lastBlinkTime > 300) {
      this.blinkCount++;
      this.lastBlinkTime = now;
      this.blinkHistory.push(now);
    }

    // Keep only blinks from the last minute
    this.blinkHistory = this.blinkHistory.filter(time => now - time < 60000);

    return this.blinkHistory.length;
  }

  private detectYawn(mouthAR: number): boolean {
    const YAWN_THRESHOLD = 0.07;
    
    this.mouthAspectHistory.push(mouthAR);
    if (this.mouthAspectHistory.length > 10) {
      this.mouthAspectHistory.shift();
    }

    // Detect sustained mouth opening
    const avgMouthAR = this.mouthAspectHistory.reduce((sum, val) => sum + val, 0) / this.mouthAspectHistory.length;
    return avgMouthAR > YAWN_THRESHOLD;
  }

  private calculateHeadPose(landmarks: any[]): 'center' | 'left' | 'right' | 'down' {
    // More reliable head pose estimation using multiple facial landmarks
    const noseTip = landmarks[1];          // Nose tip
    const chinCenter = landmarks[18];      // Chin center
    const foreheadCenter = landmarks[9];   // Forehead center
    const leftFace = landmarks[234];       // Left face boundary
    const rightFace = landmarks[454];      // Right face boundary
    const leftEyeCenter = landmarks[159];  // Left eye center
    const rightEyeCenter = landmarks[386]; // Right eye center

    if (!noseTip || !chinCenter || !foreheadCenter || !leftFace || !rightFace || !leftEyeCenter || !rightEyeCenter) {
      return 'center';
    }

    // Calculate face center using eye centers
    const faceCenterX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
    const faceCenterY = (leftEyeCenter.y + rightEyeCenter.y) / 2;

    // Calculate face dimensions
    const faceWidth = this.euclideanDistance(leftFace, rightFace);
    const faceHeight = this.euclideanDistance(foreheadCenter, chinCenter);

    // Horizontal head movement (left/right turn)
    const noseHorizontalOffset = noseTip.x - faceCenterX;
    const horizontalRatio = Math.abs(noseHorizontalOffset) / faceWidth;

    // Vertical head movement (looking down/up)
    const expectedNoseY = faceCenterY + (faceHeight * 0.1); // Nose should be slightly below eye level
    const noseVerticalOffset = noseTip.y - expectedNoseY;
    const verticalRatio = noseVerticalOffset / faceHeight;

    // Thresholds for head pose detection
    const HORIZONTAL_THRESHOLD = 0.08;  // 8% of face width
    const VERTICAL_THRESHOLD = 0.15;    // 15% of face height for looking down

    // Determine head position with priority: down > left/right > center
    if (verticalRatio > VERTICAL_THRESHOLD) {
      return 'down';
    } else if (horizontalRatio > HORIZONTAL_THRESHOLD) {
      if (noseHorizontalOffset > 0) {
        return 'right'; // Nose moved to person's right (viewer's left)
      } else {
        return 'left';  // Nose moved to person's left (viewer's right)
      }
    } else {
      return 'center';
    }
  }

  private calculateDrowsinessScore(ear: number, mouthAR: number, blinkRate: number, yawnDetected: boolean): number {
    let score = 0;

    // Add current EAR to history for stability
    this.eyeClosureHistory.push(ear);
    if (this.eyeClosureHistory.length > 20) {
      this.eyeClosureHistory.shift();
    }

    // Use averaged EAR for more stable detection
    const avgEAR = this.eyeClosureHistory.reduce((sum, val) => sum + val, 0) / this.eyeClosureHistory.length;

    // Eye closure contributes to drowsiness (0-40 points) - using smoothed EAR
    if (avgEAR < 0.15) {
      score += 40; // Eyes closed
    } else if (avgEAR < 0.20) {
      score += 25; // Eyes drowsy
    } else if (avgEAR < 0.22) {
      score += 10; // Eyes slightly droopy
    }

    // Abnormal blink rate (0-25 points) - more lenient thresholds
    if (blinkRate > 35) {
      score += 25; // Too many blinks
    } else if (blinkRate < 5) {
      score += 15; // Too few blinks
    } else if (blinkRate > 30 || blinkRate < 8) {
      score += 10; // Moderately abnormal
    }

    // Yawn detection (0-20 points)
    if (yawnDetected) {
      score += 20;
    }

    // Time-based fatigue (0-15 points)
    const sessionTime = (Date.now() - (this.lastBlinkTime || Date.now())) / (1000 * 60);
    if (sessionTime > 120) { // 2+ hours
      score += 15;
    } else if (sessionTime > 60) { // 1+ hours
      score += 10;
    } else if (sessionTime > 30) { // 30+ minutes
      score += 5;
    }

    // Raw score calculation
    const rawScore = Math.min(Math.max(score, 0), 100);

    // Add temporal smoothing to reduce rapid fluctuations
    this.drowsinessScoreHistory.push(rawScore);
    if (this.drowsinessScoreHistory.length > 15) {
      this.drowsinessScoreHistory.shift();
    }

    // Return weighted average with more weight on recent scores
    const weights = this.drowsinessScoreHistory.map((_, index) => Math.pow(1.2, index));
    const weightedSum = this.drowsinessScoreHistory.reduce((sum, score, index) => sum + score * weights[index], 0);
    const totalWeights = weights.reduce((sum, weight) => sum + weight, 0);
    
    return Math.round((weightedSum / totalWeights) * 10) / 10; // Round to 1 decimal place
  }

  private determineAlertLevel(drowsinessScore: number, eyeState: 'open' | 'closed' | 'drowsy', yawnDetected: boolean): 'safe' | 'warning' | 'critical' {
    // More stable alert level determination with hysteresis
    if (drowsinessScore >= 65 || (eyeState === 'closed' && drowsinessScore >= 50)) {
      return 'critical';
    } else if (drowsinessScore >= 35 || eyeState === 'drowsy' || yawnDetected) {
      return 'warning';
    } else {
      return 'safe';
    }
  }

  stop(): void {
    if (this.camera) {
      this.camera.stop();
    }
    this.isInitialized = false;
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}