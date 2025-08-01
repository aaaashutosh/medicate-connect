import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<"patient" | "doctor">("patient");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast({
        title: "Login successful",
        description: "Welcome back to Medicate!",
      });
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: "patient" | "doctor") => {
    setIsLoading(true);
    try {
      const email = role === "patient" ? "patient@medicate.com" : "doctor@medicate.com";
      await login(email, "password123");
      toast({
        title: "Demo login successful",
        description: `Logged in as demo ${role}`,
      });
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Demo login failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medicate-light via-white to-medicate-light dark:from-background dark:via-card dark:to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-medicate-primary animate-heartbeat" />
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">Medicate</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Welcome Back</h2>
            <p className="text-gray-600 dark:text-gray-400">Sign in to access your healthcare dashboard</p>
          </div>
          
          {/* Role Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setSelectedRole("patient")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                selectedRole === "patient"
                  ? "bg-white dark:bg-gray-700 text-medicate-primary shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("doctor")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                selectedRole === "doctor"
                  ? "bg-white dark:bg-gray-700 text-medicate-primary shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Doctor
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked as boolean })}
                />
                <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </Label>
              </div>
              <Button variant="link" className="text-sm text-medicate-primary hover:text-medicate-dark p-0">
                Forgot password?
              </Button>
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full btn-primary">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          {/* Demo Login Buttons */}
          <div className="mt-6 space-y-2">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              Or try demo access:
            </div>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => handleDemoLogin("patient")}
              disabled={isLoading}
              className="w-full border-medicate-primary text-medicate-primary hover:bg-medicate-light dark:hover:bg-medicate-dark"
            >
              Demo Patient Login
            </Button>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => handleDemoLogin("doctor")}
              disabled={isLoading}
              className="w-full border-medicate-primary text-medicate-primary hover:bg-medicate-light dark:hover:bg-medicate-dark"
            >
              Demo Doctor Login
            </Button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Button variant="link" className="text-medicate-primary hover:text-medicate-dark p-0">
                Sign up here
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
