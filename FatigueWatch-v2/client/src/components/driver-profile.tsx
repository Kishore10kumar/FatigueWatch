import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Coffee, Settings2, ChevronDown, ChevronUp, Phone, Mail, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { playAlertSound } from "@/lib/audio-alerts";
import type { Driver } from "@shared/schema";

type DriverSession = {
  id: string;
  driverId: string;
  startTime: string;
  endTime: string | null;
  totalDriveTime: number | null;
  totalAlerts: number;
  maxDrowsinessScore: number;
};

type CurrentDriverResponse = {
  driver: Driver;
  session: DriverSession;
};

export default function DriverProfile() {
  const { toast } = useToast();
  const [showFullProfile, setShowFullProfile] = useState(false);

  const { data: currentDriver, isLoading } = useQuery<CurrentDriverResponse>({
    queryKey: ['/api/drivers/current'],
  });

  const handleEmergencyAlert = () => {
    playAlertSound('emergency');
    toast({
      variant: "destructive",
      title: "Emergency Alert Activated",
      description: "Emergency services have been notified. Please pull over safely.",
    });
  };

  const handleSuggestBreak = () => {
    playAlertSound('notification');
    toast({
      title: "Break Suggested",
      description: "It's recommended to take a 15-minute break.",
    });
  };

  const handleCalibrate = () => {
    toast({
      title: "System Calibration",
      description: "Calibrating detection system... Please look straight ahead.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-muted rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentDriver) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground">No active driver found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const driver = currentDriver.driver;
  const session = currentDriver.session;
  const driveTimeMinutes = session?.startTime ? 
    Math.floor((Date.now() - new Date(session.startTime).getTime()) / (1000 * 60)) : 0;
  const driveTimeHours = Math.floor(driveTimeMinutes / 60);
  const driveTimeRemainder = driveTimeMinutes % 60;

  return (
    <div className="space-y-6">
      <Card data-testid="driver-profile">
        <CardHeader>
          <CardTitle>Current Driver</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <img 
              src={driver.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150"}
              alt="Driver profile photo" 
              className="w-16 h-16 rounded-full object-cover border-2 border-border"
              data-testid="driver-photo"
            />
            <div>
              <h4 className="font-medium text-foreground" data-testid="driver-name">{driver.name}</h4>
              <p className="text-sm text-muted-foreground" data-testid="driver-id">ID: {driver.driverId}</p>
              <p className="text-sm text-muted-foreground" data-testid="driver-shift">
                Shift: {driver.shiftStart} - {driver.shiftEnd}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className={`font-medium ${driver.status === 'active' ? 'text-safe' : 'text-muted-foreground'}`} data-testid="driver-status">
                {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Drive Time</span>
              <span className="text-foreground" data-testid="drive-time">
                {driveTimeHours}h {driveTimeRemainder}m
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Alert</span>
              <span className="text-muted-foreground" data-testid="last-alert">None</span>
            </div>
          </div>

          <Button 
            variant="secondary" 
            className="w-full mt-4"
            onClick={() => setShowFullProfile(!showFullProfile)}
            data-testid="button-view-profile"
          >
            {showFullProfile ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                View Full Profile
              </>
            )}
          </Button>

          {/* Expanded Profile Details */}
          {showFullProfile && (
            <div className="mt-6 pt-6 border-t border-border space-y-4" data-testid="full-profile-details">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-foreground mb-2">Contact Information</h5>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      <span data-testid="driver-phone">+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      <span data-testid="driver-email">{driver.name.toLowerCase().replace(' ', '.')}@company.com</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-foreground mb-2">License Information</h5>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span data-testid="license-expiry">Expires: Dec 2025</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="text-xs bg-muted px-2 py-1 rounded" data-testid="license-class">Class A CDL</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-foreground mb-2">Recent Activity</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total Drive Time Today</span>
                    <span className="text-foreground" data-testid="total-drive-time">
                      {driveTimeHours}h {driveTimeRemainder}m
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Fatigue Alerts Today</span>
                    <span className="text-foreground" data-testid="fatigue-alerts">0</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Last Break</span>
                    <span className="text-foreground" data-testid="last-break">
                      {session?.startTime ? 'At shift start' : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Safety Score</span>
                    <span className="text-safe font-medium" data-testid="safety-score">95/100</span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-foreground mb-2">Emergency Contact</h5>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="font-medium mr-2">Sarah Johnson (Spouse)</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    <span data-testid="emergency-contact">+1 (555) 987-6543</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card data-testid="quick-actions">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button 
              variant="destructive"
              className="w-full py-3"
              onClick={handleEmergencyAlert}
              data-testid="button-emergency"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Emergency Alert
            </Button>
            <Button 
              className="w-full py-2 bg-warning text-black hover:bg-warning/90"
              onClick={handleSuggestBreak}
              data-testid="button-break"
            >
              <Coffee className="h-4 w-4 mr-2" />
              Suggest Break
            </Button>
            <Button 
              variant="secondary"
              className="w-full py-2"
              onClick={handleCalibrate}
              data-testid="button-calibrate"
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Calibrate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
