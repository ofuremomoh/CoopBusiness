import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, User } from "lucide-react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const DriverTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [driverLocation, setDriverLocation] = useState({ lat: 6.5244, lng: 3.3792 }); // Default Lagos coordinates

  // In a real app, this would fetch real-time driver location from backend
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate driver movement (in production, this would be real WebSocket data)
      setDriverLocation((prev) => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gradient-to-br from-background via-muted/10 to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Track Your Delivery</h1>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Driver Info Card */}
              <Card className="p-6 lg:col-span-1">
                <h2 className="text-xl font-semibold mb-4">Driver Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-muted-foreground">Driver ID: DR-{orderId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="w-5 h-5" />
                    <span>+234 801 234 5678</span>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="w-5 h-5" />
                    <span>En route to delivery</span>
                  </div>

                  <Button className="w-full mt-4" onClick={() => navigate(`/order/${orderId}`)}>
                    View Order Details
                  </Button>
                </div>
              </Card>

              {/* Map Card */}
              <Card className="p-6 lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Live Location</h2>
                
                <LoadScript googleMapsApiKey="AIzaSyCWe6CqMsm7LmMZd9jytIuPbLy7UiIiTNk">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={driverLocation}
                    zoom={15}
                  >
                    <Marker position={driverLocation} />
                  </GoogleMap>
                </LoadScript>

                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Current Location:
                  </p>
                  <p className="font-medium">
                    Lat: {driverLocation.lat.toFixed(4)}, Lng: {driverLocation.lng.toFixed(4)}
                  </p>
                  <p className="text-sm text-success mt-2">
                    ✓ Driver is on the way
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DriverTracking;
