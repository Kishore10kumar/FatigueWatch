import { useEffect, useState, useRef } from "react";

interface WebcamHook {
  stream: MediaStream | null;
  error: string | null;
  isLoading: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useWebcam(): WebcamHook {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsLoading(false);
    } catch (err) {
      console.error('Error accessing webcam:', err);
      let errorMessage = 'Failed to access camera';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera access and refresh the page.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please ensure a camera is connected.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  return {
    stream,
    error,
    isLoading,
    startCamera,
    stopCamera
  };
}
