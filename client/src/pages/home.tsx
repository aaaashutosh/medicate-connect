import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Heart, 
  Stethoscope, 
  PillBottle, 
  Dna, 
  Bot, 
  Video, 
  Pill as Prescription,
  Star
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg min-h-screen flex items-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 animate-float opacity-10">
            <Stethoscope className="h-24 w-24 text-medicate-primary" />
          </div>
          <div className="absolute top-40 right-20 animate-float opacity-10" style={{ animationDelay: "1s" }}>
            <PillBottle className="h-16 w-16 text-medicate-secondary" />
          </div>
          <div className="absolute bottom-20 left-1/4 animate-spin-slow opacity-10">
            <Dna className="h-20 w-20 text-medicate-primary" />
          </div>
          {/* Heartbeat line */}
          <div className="absolute top-1/2 left-0 right-0 heartbeat-line"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-slide-up">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Empowering <span className="text-medicate-primary">Healthcare</span> with AI
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Connect with certified doctors instantly, manage your health records, and experience the future of personalized healthcare through our AI-powered platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/login">
                  <Button className="btn-primary px-8 py-4 text-lg shadow-lg">
                    Get Started Today
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    className="px-8 py-4 text-lg border-2 border-medicate-primary text-medicate-primary hover:bg-medicate-light dark:hover:bg-medicate-dark"
                  >
                    Book Consultation
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
              {/* Medical professional consultation illustration */}
              <Card className="transform rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-medicate-primary rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Dr. Sarah Johnson</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Cardiologist</p>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full online-dot"></div>
                        <span className="text-xs text-green-600 dark:text-green-400">Available Now</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-medicate-light dark:bg-medicate-dark p-3 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">Your health report looks good! Continue with your current medication.</p>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-medicate-primary text-white p-3 rounded-lg text-sm max-w-xs">
                        Thank you, Doctor! Should I schedule a follow-up?
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">AI-Powered Healthcare Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Experience the future of healthcare with our innovative AI technology designed to enhance patient care and streamline medical processes.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="card-hover">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-medicate-light dark:bg-medicate-dark rounded-2xl flex items-center justify-center mb-6 animate-float">
                  <Bot className="h-8 w-8 text-medicate-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">AI Symptom Checker</h3>
                <p className="text-gray-600 dark:text-gray-300">Get instant preliminary assessments with our advanced AI that analyzes symptoms and provides guidance.</p>
              </CardContent>
            </Card>
            
            {/* Feature 2 */}
            <Card className="card-hover">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-medicate-light dark:bg-medicate-dark rounded-2xl flex items-center justify-center mb-6 animate-float" style={{ animationDelay: "0.5s" }}>
                  <Video className="h-8 w-8 text-medicate-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Telemedicine</h3>
                <p className="text-gray-600 dark:text-gray-300">Connect with certified doctors through secure video consultations from anywhere, anytime.</p>
              </CardContent>
            </Card>
            
            {/* Feature 3 */}
            <Card className="card-hover">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-medicate-light dark:bg-medicate-dark rounded-2xl flex items-center justify-center mb-6 animate-float" style={{ animationDelay: "1s" }}>
                  <Prescription className="h-8 w-8 text-medicate-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Smart Prescriptions</h3>
                <p className="text-gray-600 dark:text-gray-300">AI-assisted prescription management with drug interaction checks and refill reminders.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Thousands of patients and doctors trust Medicate for their healthcare needs.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Maria Rodriguez</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Patient</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">"Medicate made it so easy to consult with my doctor. The AI symptom checker was surprisingly accurate!"</p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Dr. Michael Chen</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Cardiologist</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">"The platform streamlines my practice. I can manage appointments and prescriptions efficiently."</p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">James Wilson</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Patient</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">"Outstanding service! The real-time chat with doctors is a game-changer for quick consultations."</p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
