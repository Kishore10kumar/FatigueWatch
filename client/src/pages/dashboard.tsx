import { useEffect, useState } from "react";
import { Eye, Clock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import WebcamFeed from "@/components/webcam-feed";
import DriverProfile from "@/components/driver-profile";
import MetricsDashboard from "@/components/metrics-dashboard";
import FatigueChart from "@/components/fatigue-chart";
import DetectionEvents from "@/components/detection-events";
import SystemHealth from "@/components/system-health";
import AlertNotification from "@/components/alert-notification";
import { useWebSocket } from "@/hooks/use-websocket";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { connectionStatus } = useWebSocket();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toTimeString().slice(0, 8);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Eye className="text-primary text-2xl" data-testid="logo-icon" />
                <h1 className="text-xl font-bold" data-testid="app-title">FatigueWatch</h1>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-safe pulse-safe' : 'bg-critical'}`} data-testid="system-status-indicator" />
                <span className="text-sm text-muted-foreground" data-testid="system-status-text">
                  {connectionStatus === 'connected' ? 'System Active' : 'System Offline'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span data-testid="current-time">{formatTime(currentTime)}</span>
              </div>
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-settings"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Video Feed */}
          <div className="lg:col-span-2">
            <WebcamFeed />
          </div>

          {/* Driver Profile and Quick Actions */}
          <div className="space-y-6">
            <DriverProfile />
          </div>
        </div>

        {/* Metrics Dashboard */}
        <div className="mt-8">
          <MetricsDashboard />
        </div>

        {/* Charts and History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <FatigueChart />
          <DetectionEvents />
        </div>

        {/* System Health */}
        <div className="mt-8">
          <SystemHealth />
        </div>
      </main>

      {/* Alert Notification Overlay */}
      <AlertNotification />
    </div>
  );
}
