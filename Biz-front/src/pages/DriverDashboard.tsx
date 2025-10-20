import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  const startLocationSharing = () => {
    if (navigator.geolocation) {
      setIsSharing(true);
      
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          
          // In production, send this to backend via WebSocket or API
          console.log("Driver location updated:", location);
          
          toast({
            title: "Location Updated",
            description: "Your location is being shared with customers",
          });
        },
        (error) => {
          console.error("Location error:", error);
          toast({
            title: "Location Error",
            description: "Unable to access your location",
            variant: "destructive",
          });
          setIsSharing(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );

      // Store watchId to clear it later if needed
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
    }
  };

  const stopLocationSharing = () => {
    setIsSharing(false);
    setCurrentLocation(null);
    toast({
      title: "Location Sharing Stopped",
      description: "You are no longer sharing your location",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-br from-background via-muted/10 to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Driver Dashboard</h1>

            {/* Status Card */}
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Location Sharing Status</h2>
                <Badge variant={isSharing ? "default" : "secondary"}>
                  {isSharing ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Navigation className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {isSharing ? "Sharing your location" : "Not sharing location"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isSharing 
                      ? "Customers can track your delivery in real-time" 
                      : "Start sharing to enable customer tracking"}
                  </p>
                </div>
              </div>

              {currentLocation && (
                <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <p className="font-medium">Current Location:</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
                  </p>
                </div>
              )}

              <Button
                className="w-full"
                onClick={isSharing ? stopLocationSharing : startLocationSharing}
                variant={isSharing ? "destructive" : "default"}
              >
                {isSharing ? "Stop Sharing Location" : "Start Sharing Location"}
              </Button>
            </Card>

            {/* Active Deliveries */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Active Deliveries
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No active deliveries at the moment
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DriverDashboard;
