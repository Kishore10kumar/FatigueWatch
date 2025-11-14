import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Brain, Database } from "lucide-react";

export default function SystemHealth() {
  const { data: health, isLoading } = useQuery({
    queryKey: ['/api/system/health'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <Card data-testid="system-health">
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="text-center animate-pulse">
                <div className="w-8 h-8 bg-muted rounded mx-auto mb-2"></div>
                <div className="h-4 bg-muted rounded mb-1"></div>
                <div className="h-3 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!health) {
    return (
      <Card data-testid="system-health">
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Unable to load system health data
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'optimal':
      case 'connected': 
        return 'text-safe';
      case 'warning':
      case 'degraded':
        return 'text-warning';
      case 'error':
      case 'offline':
        return 'text-critical';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card data-testid="system-health">
      <CardHeader>
        <CardTitle>System Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Camera System */}
          <div className="text-center" data-testid="health-camera">
            <div className={`text-2xl mb-2 ${getStatusColor(health.camera.status)}`}>
              <Video className="h-8 w-8 mx-auto" />
            </div>
            <div className="font-medium text-foreground">Camera Feed</div>
            <div className={`text-sm ${getStatusColor(health.camera.status)}`}>
              {health.camera.status} • {health.camera.resolution}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              FPS: {health.camera.fps} • Latency: {health.camera.latency}ms
            </div>
          </div>
          
          {/* AI Processing */}
          <div className="text-center" data-testid="health-ai">
            <div className={`text-2xl mb-2 ${getStatusColor(health.ai.status)}`}>
              <Brain className="h-8 w-8 mx-auto" />
            </div>
            <div className="font-medium text-foreground">AI Processing</div>
            <div className={`text-sm ${getStatusColor(health.ai.status)}`}>
              {health.ai.status} • {health.ai.accuracy}% accuracy
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              CPU: {health.ai.cpu}% • Memory: {health.ai.memory}GB
            </div>
          </div>
          
          {/* Data Storage */}
          <div className="text-center" data-testid="health-storage">
            <div className={`text-2xl mb-2 ${getStatusColor(health.storage.status)}`}>
              <Database className="h-8 w-8 mx-auto" />
            </div>
            <div className="font-medium text-foreground">Data Storage</div>
            <div className={`text-sm ${getStatusColor(health.storage.status)}`}>
              {health.storage.status} • {health.storage.used} used
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Last sync: {new Date(health.storage.lastSync).toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
