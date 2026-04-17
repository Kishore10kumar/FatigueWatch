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
import LiveLocation from "@/components/live-location";
import { useWebSocket } from "@/hooks/use-websocket";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { connectionStatus } = useWebSocket();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => date.toTimeString().slice(0, 8);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo + status */}
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Eye className="text-primary h-5 w-5 sm:h-6 sm:w-6" data-testid="logo-icon" />
                <h1 className="text-base sm:text-xl font-bold truncate" data-testid="app-title">
                  FatigueWatch
                </h1>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${connectionStatus === 'connected' ? 'bg-safe pulse-safe' : 'bg-critical'}`} data-testid="system-status-indicator" />
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap" data-testid="system-status-text">
                  {connectionStatus === 'connected' ? 'System Active' : 'System Offline'}
                </span>
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-1 sm:space-x-2 text-sm">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-xs sm:text-sm tabular-nums" data-testid="current-time">{formatTime(currentTime)}</span>
              </div>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm px-2 sm:px-4"
                data-testid="button-settings"
              >
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Video + Driver Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <WebcamFeed />
          </div>
          <div className="lg:col-span-1">
            <DriverProfile />
          </div>
        </div>

        {/* Metrics */}
        <MetricsDashboard />

        {/* Charts + Events */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <FatigueChart />
          <DetectionEvents />
        </div>

        {/* Live Location */}
        <LiveLocation />

        {/* System Health */}
        <SystemHealth />
      </main>

      <AlertNotification />
    </div>
  );
}
