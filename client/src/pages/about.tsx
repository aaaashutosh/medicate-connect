import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, MapPin, Brain, Link as LinkIcon } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen py-20 bg-white dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">About Medicate</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">We're revolutionizing healthcare by bridging the gap between patients and quality medical care through innovative AI technology.</p>
        </div>
        
        {/* Mission & Vision */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <Card className="card-hover bg-gradient-to-br from-medicate-light to-white dark:from-medicate-dark dark:to-card">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-medicate-primary rounded-2xl flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Our Mission</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">To democratize healthcare access by providing a comprehensive, AI-powered platform that connects patients with qualified healthcare professionals, making quality medical care available to everyone, everywhere.</p>
            </CardContent>
          </Card>
          
          <Card className="card-hover bg-gradient-to-br from-medicate-light to-white dark:from-medicate-dark dark:to-card">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-medicate-primary rounded-2xl flex items-center justify-center mb-6">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Our Vision</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">To create a world where healthcare is accessible, efficient, and personalized for every individual, powered by cutting-edge AI technology and human compassion working in perfect harmony.</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Timeline */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-12">How Medicate Bridges Healthcare Gaps</h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-medicate-primary opacity-20"></div>
            
            {/* Timeline Items */}
            <div className="space-y-12">
              <div className="flex items-center">
                <div className="flex-1 text-right pr-8">
                  <Card className="card-hover">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Accessibility Challenge</h3>
                      <p className="text-gray-600 dark:text-gray-300">Many patients struggle to access quality healthcare due to geographic, financial, or time constraints.</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="w-12 h-12 bg-medicate-primary rounded-full flex items-center justify-center relative z-10">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 pl-8">
                  <Card className="card-hover bg-medicate-light dark:bg-medicate-dark">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-medicate-dark dark:text-medicate-secondary mb-2">Medicate Solution</h3>
                      <p className="text-gray-700 dark:text-gray-300">24/7 telemedicine platform with AI-powered triage and instant doctor connections.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex-1 text-right pr-8">
                  <Card className="card-hover">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Information Gap</h3>
                      <p className="text-gray-600 dark:text-gray-300">Patients often lack reliable health information and struggle to understand medical conditions.</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="w-12 h-12 bg-medicate-primary rounded-full flex items-center justify-center relative z-10">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 pl-8">
                  <Card className="card-hover bg-medicate-light dark:bg-medicate-dark">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-medicate-dark dark:text-medicate-secondary mb-2">AI-Powered Education</h3>
                      <p className="text-gray-700 dark:text-gray-300">Personalized health insights, symptom explanations, and evidence-based health tips.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex-1 text-right pr-8">
                  <Card className="card-hover">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Fragmented Care</h3>
                      <p className="text-gray-600 dark:text-gray-300">Medical records and care history are often scattered across different providers and systems.</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="w-12 h-12 bg-medicate-primary rounded-full flex items-center justify-center relative z-10">
                  <LinkIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 pl-8">
                  <Card className="card-hover bg-medicate-light dark:bg-medicate-dark">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-medicate-dark dark:text-medicate-secondary mb-2">Unified Health Records</h3>
                      <p className="text-gray-700 dark:text-gray-300">Centralized, secure platform for all health information, accessible to both patients and providers.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
