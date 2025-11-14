import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/use-websocket";
import { useEffect, useState } from "react";

interface EventLog {
  id: string;
  timestamp: string;
  message: string;
  severity: 'safe' | 'warning' | 'critical';
}

export default function DetectionEvents() {
  const [events, setEvents] = useState<EventLog[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      message: 'System calibration completed',
      severity: 'safe'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      message: 'Drowsiness detected (resolved)',
      severity: 'warning'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      message: 'Driver session started',
      severity: 'safe'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 - 5000).toISOString(),
      message: 'Face recognition successful',
      severity: 'safe'
    }
  ]);

  const { lastMessage } = useWebSocket();

  useEffect(() => {
    // Listen for new alert events
    if (lastMessage?.type === 'alert_created') {
      const alert = lastMessage.data;
      const newEvent: EventLog = {
        id: alert.id,
        timestamp: alert.timestamp,
        message: alert.message,
        severity: alert.severity === 'critical' ? 'critical' : 
                 alert.severity === 'high' || alert.severity === 'medium' ? 'warning' : 'safe'
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 10)); // Keep only last 10 events
    }
  }, [lastMessage]);

  const handleClearLogs = () => {
    setEvents([]);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'safe': return 'bg-safe';
      case 'warning': return 'bg-warning';
      case 'critical': return 'bg-critical';
      default: return 'bg-muted-foreground';
    }
  };

  return (
    <Card data-testid="detection-events">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Events</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleClearLogs}
            className="text-primary hover:text-primary/80"
            data-testid="button-clear-logs"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto" data-testid="events-list">
          {events.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No recent events
            </div>
          ) : (
            events.map((event) => (
              <div 
                key={event.id}
                className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg"
                data-testid={`event-${event.id}`}
              >
                <div className={`w-2 h-2 rounded-full ${getSeverityColor(event.severity)}`} />
                <div className="flex-1">
                  <div className="text-sm text-foreground">{event.message}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(event.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
