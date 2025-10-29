import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Blocks, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { INITIAL_LOYALTY, USER_TYPE_LABELS } from "@/types";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    user_type: "individual",
  });
  const [phoneError, setPhoneError] = useState("");

  const validatePhone = (phone) => {
    const pattern = /^\+234[0-9]{10}$/;
    return pattern.test(phone);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, phone: value });

    if (value === "") {
      setPhoneError("Phone number is required");
    } else if (!validatePhone(value)) {
      setPhoneError("Enter a valid number e.g. +2348123456789");
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone format before submitting
    if (!validatePhone(formData.phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be in the format +234XXXXXXXXXX.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          user_type: formData.user_type,
        }),
      });

      const data = await response.json();

      if (response.ok && data.user_id) {
        toast({
          title: "Registration Successful!",
          description: "Please log in with your credentials.",
        });
        navigate("/login");
      } else {
        toast({
          title: "Registration Failed",
          description: data.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
              <Blocks className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">Create Your Account</CardTitle>
            <CardDescription>
              Join Nigeria's marketplace that rewards both buyers and sellers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                {/* ✅ PHONE VALIDATION FIELD */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+2348123456789"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    required
                    maxLength={14}
                    className={phoneError ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Rest of your form unchanged */}
              <div className="space-y-3">
                <Label>Account Type</Label>
                <RadioGroup
                  value={formData.user_type}
                  onValueChange={(value) => setFormData({ ...formData, user_type: value })}
                >
                  {Object.entries(INITIAL_LOYALTY).map(([type, loyalty]) => (
                    <div
                      key={type}
                      className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer"
                    >
                      <RadioGroupItem value={type} id={type} />
                      <Label htmlFor={type} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            {USER_TYPE_LABELS[type as keyof typeof USER_TYPE_LABELS]}
                          </span>
                          <Badge variant="secondary">
                            {loyalty.toLocaleString()} Loyalty Points
                          </Badge>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2 text-sm">
                <p className="font-semibold">Loyalty Rewards Benefits:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Create sales up to 10x your Loyalty value</li>
                  <li>• Earn 20% Loyalty on all purchases</li>
                  <li>• Loyalty points are tradeable and withdrawable</li>
                  <li>• All earned Loyalty available immediately</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => navigate("/login")}
                >
                  Sign in
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
