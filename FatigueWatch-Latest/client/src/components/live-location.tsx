import { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, AlertCircle, Locate, RefreshCw } from "lucide-react";

type LocationData = {
  lat: number;
  lng: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  timestamp: number;
};

type RoutePoint = { lat: number; lng: number };

declare global {
  interface Window {
    L: any;
  }
}

export default function LiveLocation() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const routePointsRef = useRef<RoutePoint[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const leafletLoadedRef = useRef(false);
  const mapInitializedRef = useRef(false);

  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [distanceTraveled, setDistanceTraveled] = useState(0);

  const haversineDistance = (a: RoutePoint, b: RoutePoint) => {
    const R = 6371000;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const s =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((a.lat * Math.PI) / 180) *
        Math.cos((b.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  };

  const loadLeaflet = (): Promise<void> =>
    new Promise((resolve, reject) => {
      if (window.L) { resolve(); return; }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load map library"));
      document.head.appendChild(script);
    });

  const initMap = useCallback((lat: number, lng: number) => {
    if (!mapRef.current || mapInitializedRef.current) return;
    mapInitializedRef.current = true;
    const L = window.L;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([lat, lng], 17);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const driverIcon = L.divIcon({
      className: "",
      html: `<div style="
        width:40px;height:40px;border-radius:50%;
        background:linear-gradient(135deg,#3b82f6,#1d4ed8);
        border:3px solid white;
        box-shadow:0 2px 12px rgba(59,130,246,0.6);
        display:flex;align-items:center;justify-content:center;
        font-size:18px;
      ">🚗</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    markerRef.current = L.marker([lat, lng], { icon: driverIcon })
      .addTo(map)
      .bindPopup("<b>You are here</b><br>Live GPS tracking")
      .openPopup();

    accuracyCircleRef.current = L.circle([lat, lng], {
      radius: 30,
      color: "#3b82f6",
      fillColor: "#3b82f6",
      fillOpacity: 0.12,
      weight: 1,
    }).addTo(map);

    polylineRef.current = L.polyline([], {
      color: "#3b82f6",
      weight: 4,
      opacity: 0.7,
      dashArray: "8 5",
    }).addTo(map);

    leafletMapRef.current = map;
    setIsMapReady(true);
  }, []);

  const updateMap = useCallback((loc: LocationData) => {
    if (!leafletMapRef.current || !window.L) return;
    const { lat, lng, accuracy } = loc;

    markerRef.current?.setLatLng([lat, lng]);
    accuracyCircleRef.current?.setLatLng([lat, lng]).setRadius(Math.max(accuracy, 10));
    leafletMapRef.current.panTo([lat, lng], { animate: true, duration: 1.2 });

    const pts = routePointsRef.current;
    pts.push({ lat, lng });
    if (pts.length > 300) pts.shift();
    polylineRef.current?.setLatLngs(pts.map((p) => [p.lat, p.lng]));

    if (pts.length >= 2) {
      const d = haversineDistance(pts[pts.length - 2], pts[pts.length - 1]);
      if (d < 500) setDistanceTraveled((prev) => prev + d);
    }
  }, []);

  const recenter = () => {
    if (leafletMapRef.current && location) {
      leafletMapRef.current.setView([location.lat, location.lng], 17, { animate: true });
    }
  };

  const startTracking = useCallback(async () => {
    setError(null);
    try {
      if (!leafletLoadedRef.current) {
        await loadLeaflet();
        leafletLoadedRef.current = true;
      }

      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: LocationData = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            timestamp: pos.timestamp,
          };
          setLocation(loc);
          routePointsRef.current = [{ lat: loc.lat, lng: loc.lng }];
          setDistanceTraveled(0);
          initMap(loc.lat, loc.lng);

          const id = navigator.geolocation.watchPosition(
            (p) => {
              const updated: LocationData = {
                lat: p.coords.latitude,
                lng: p.coords.longitude,
                accuracy: p.coords.accuracy,
                speed: p.coords.speed,
                heading: p.coords.heading,
                timestamp: p.timestamp,
              };
              setLocation(updated);
              updateMap(updated);
            },
            (err) => setError(`Tracking error: ${err.message}`),
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
          );
          watchIdRef.current = id;
        },
        (err) => {
          if (err.code === 1) {
            setError("Location permission denied. Please allow location access in your browser settings and refresh the page.");
          } else {
            setError(`Could not get location: ${err.message}`);
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } catch (e: any) {
      setError(e.message || "Failed to start location tracking.");
    }
  }, [initMap, updateMap]);

  useEffect(() => {
    startTracking();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, []);

  const formatSpeed = (speed: number | null) =>
    speed === null || speed < 0 ? "0.0 km/h" : `${(speed * 3.6).toFixed(1)} km/h`;
  const formatCoord = (val: number) => val.toFixed(5);
  const formatAccuracy = (acc: number) => `±${Math.round(acc)}m`;

  return (
    <Card data-testid="live-location">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle>Live Location</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {isMapReady ? (
              <Badge className="bg-safe text-white animate-pulse">
                <Navigation className="h-3 w-3 mr-1" />
                Live GPS
              </Badge>
            ) : error ? (
              <Badge variant="destructive">Error</Badge>
            ) : (
              <Badge variant="secondary">Acquiring GPS…</Badge>
            )}
            {isMapReady && (
              <Button variant="outline" size="icon" onClick={recenter} title="Re-center">
                <Locate className="h-4 w-4" />
              </Button>
            )}
            {error && (
              <Button variant="outline" size="sm" onClick={startTracking}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Map */}
        <div className="relative rounded-lg overflow-hidden border border-border" style={{ height: 380 }}>
          <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

          {!isMapReady && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/70 backdrop-blur-sm z-10 space-y-3">
              <div className="relative">
                <MapPin className="h-12 w-12 text-primary animate-bounce" />
              </div>
              <p className="text-sm font-medium">Acquiring your location…</p>
              <p className="text-xs text-muted-foreground text-center px-6">
                Please allow location access when your browser asks.
              </p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start space-x-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        {location && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground mb-1">Latitude</p>
              <p className="text-sm font-mono font-semibold">{formatCoord(location.lat)}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground mb-1">Longitude</p>
              <p className="text-sm font-mono font-semibold">{formatCoord(location.lng)}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground mb-1">Speed</p>
              <p className="text-sm font-semibold">{formatSpeed(location.speed)}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground mb-1">Accuracy</p>
              <p className="text-sm font-semibold">{formatAccuracy(location.accuracy)}</p>
            </div>
          </div>
        )}

        {distanceTraveled > 0 && (
          <div className="flex items-center justify-between text-sm px-1 py-1 rounded bg-muted/30">
            <span className="text-muted-foreground flex items-center gap-1">
              <Navigation className="h-3 w-3" /> Distance this session
            </span>
            <span className="font-semibold">
              {distanceTraveled >= 1000
                ? `${(distanceTraveled / 1000).toFixed(2)} km`
                : `${Math.round(distanceTraveled)} m`}
            </span>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Powered by OpenStreetMap · GPS data stays on-device
        </p>
      </CardContent>
    </Card>
  );
}
