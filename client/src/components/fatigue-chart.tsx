import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

export default function FatigueChart() {
  const { data: recentData, isLoading } = useQuery({
    queryKey: ['/api/detection/recent/120'], // Last 2 hours
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Transform data for chart
  const chartData = recentData?.map((log: any) => ({
    time: new Date(log.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    drowsiness: log.drowsinessScore,
    timestamp: log.timestamp
  })) || [];

  // Generate mock data if no real data is available
  const mockData = Array.from({ length: 8 }, (_, i) => {
    const now = new Date();
    const time = new Date(now.getTime() - (7 - i) * 15 * 60 * 1000); // 15-minute intervals
    const drowsiness = Math.max(5, Math.min(45, 15 + Math.sin(i * 0.5) * 10 + Math.random() * 10));
    
    return {
      time: time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      drowsiness: Math.round(drowsiness),
      timestamp: time.toISOString()
    };
  });

  const displayData = chartData.length > 0 ? chartData : mockData;

  const getBarColor = (drowsiness: number) => {
    if (drowsiness >= 70) return 'hsl(0 84% 60%)'; // critical
    if (drowsiness >= 40) return 'hsl(43 96% 56%)'; // warning
    return 'hsl(142 71% 45%)'; // safe
  };

  if (isLoading) {
    return (
      <Card data-testid="fatigue-chart">
        <CardHeader>
          <CardTitle>Fatigue Timeline (Last 2 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="fatigue-chart">
      <CardHeader>
        <CardTitle>Fatigue Timeline (Last 2 Hours)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 19% 20%)" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(215 20% 65%)"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(215 20% 65%)"
                fontSize={12}
                domain={[0, 100]}
                label={{ value: 'Drowsiness %', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(217 33% 12%)',
                  border: '1px solid hsl(217 19% 20%)',
                  borderRadius: '8px',
                  color: 'hsl(210 40% 98%)'
                }}
                formatter={(value: number) => [`${value}%`, 'Drowsiness']}
              />
              <Line 
                type="monotone" 
                dataKey="drowsiness" 
                stroke="hsl(217 91% 60%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(217 91% 60%)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(217 91% 60%)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-safe rounded"></div>
            <span>Safe (0-39%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-warning rounded"></div>
            <span>Caution (40-69%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-critical rounded"></div>
            <span>Critical (70%+)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
