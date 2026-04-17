import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/use-websocket";
import { playAlertSound } from "@/lib/audio-alerts";

interface AlertData {
  id: string;
  message: string;
  severity: string;
  alertType: string;
}

export default function AlertNotification() {
  const [activeAlert, setActiveAlert] = useState<AlertData | null>(null);
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    // Listen for critical alerts
    if (lastMessage?.type === 'alert_created') {
      const alert = lastMessage.data;
      
      if (alert.severity === 'critical') {
        setActiveAlert(alert);
        playAlertSound('critical');
      }
    }
  }, [lastMessage]);

  const handleDismissAlert = () => {
    setActiveAlert(null);
  };

  if (!activeAlert) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      data-testid="alert-notification"
    >
      <div className="bg-destructive text-destructive-foreground p-8 rounded-lg max-w-md mx-4 text-center animate-pulse">
        <div className="text-4xl mb-4">
          <AlertTriangle className="h-16 w-16 mx-auto" />
        </div>
        <h2 className="text-xl font-bold mb-2">CRITICAL ALERT</h2>
        <p className="mb-4">{activeAlert.message}</p>
        <p className="text-sm mb-6 opacity-90">
          Immediate attention required. Please pull over safely.
        </p>
        <Button 
          className="bg-white text-destructive hover:bg-white/90 px-6 py-2 rounded-md font-medium" 
          onClick={handleDismissAlert}
          data-testid="button-dismiss-alert"
        >
          Acknowledge Alert
        </Button>
      </div>
    </div>
  );
}
