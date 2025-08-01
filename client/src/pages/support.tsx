import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Mail, 
  Clock, 
  Headphones,
  Heart,
  Send,
  PhoneCall,
  Ambulance
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Support() {
  const [chatMessage, setChatMessage] = useState("");
  const [supportForm, setSupportForm] = useState({
    subject: "",
    message: ""
  });
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    toast({
      title: "Message sent",
      description: "Our support team will respond shortly.",
    });
    setChatMessage("");
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Message submitted",
      description: "We'll get back to you within 24 hours.",
    });
    setSupportForm({ subject: "", message: "" });
  };

  const mockMessages = [
    {
      id: 1,
      sender: "support",
      content: "Hello! I'm Sarah from Medicate support. How can I help you today?",
      time: "2:34 PM",
      isRead: true
    },
    {
      id: 2,
      sender: "user",
      content: "Hi Sarah! I'm having trouble accessing my prescription history. Can you help?",
      time: "2:35 PM",
      isRead: true
    },
    {
      id: 3,
      sender: "support",
      content: "Of course! I'd be happy to help you with that. Let me guide you through accessing your prescription history.",
      time: "2:35 PM",
      isRead: true
    }
  ];

  const faqItems = [
    {
      question: "How do I book an appointment?",
      answer: "You can book appointments through your patient dashboard by clicking 'Book Consultation' and selecting your preferred doctor and time slot."
    },
    {
      question: "Is my health data secure?",
      answer: "Yes, we use bank-level encryption and comply with HIPAA regulations to ensure your health information is completely secure and private."
    },
    {
      question: "How does the AI symptom checker work?",
      answer: "Our AI analyzes your symptoms using machine learning algorithms trained on medical databases to provide preliminary assessments and recommendations."
    },
    {
      question: "Can I access my prescriptions online?",
      answer: "Yes, all your prescriptions are digitally stored in your patient dashboard where you can view, download, and request refills easily."
    }
  ];

  return (
    <div className="min-h-screen py-20 bg-white dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">Customer Care</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">We're here to help you 24/7. Get instant support through live chat, browse our FAQ, or contact our expert support team.</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Live Chat */}
          <div className="lg:col-span-2">
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Live Support Chat</h2>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full online-dot"></div>
                    <span className="text-sm text-green-600 dark:text-green-400">Support Online</span>
                  </div>
                </div>
                
                {/* Chat Messages */}
                <div className="h-96 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 overflow-y-auto">
                  <div className="space-y-4">
                    {mockMessages.map((message) => (
                      <div key={message.id} className={`flex items-start space-x-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                        {message.sender === 'support' && (
                          <div className="w-8 h-8 bg-medicate-primary rounded-full flex items-center justify-center">
                            <Headphones className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div className={`max-w-xs ${message.sender === 'user' ? 'order-first' : ''}`}>
                          <div className={`rounded-lg p-3 ${
                            message.sender === 'support' 
                              ? 'bg-white dark:bg-gray-700 shadow-sm' 
                              : 'bg-medicate-primary text-white'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender === 'support' 
                                ? 'text-gray-500 dark:text-gray-400' 
                                : 'text-medicate-light'
                            }`}>
                              {message.time}
                            </p>
                          </div>
                        </div>
                        {message.sender === 'user' && (
                          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <Heart className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-medicate-primary rounded-full flex items-center justify-center">
                        <Headphones className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Chat Input */}
                <div className="flex items-center space-x-3">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} className="btn-primary">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Contact Info & Emergency */}
          <div className="space-y-6">
            {/* Emergency Contacts */}
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-4">Emergency Contacts</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <PhoneCall className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-300">Emergency Hotline</p>
                      <p className="text-red-700 dark:text-red-400">+1 (555) 911-HELP</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Ambulance className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-300">Emergency Services</p>
                      <p className="text-red-700 dark:text-red-400">Call 911</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Contact Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-medicate-primary" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Support Phone</p>
                      <p className="text-gray-600 dark:text-gray-400">+1 (555) 123-CARE</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-medicate-primary" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Email Support</p>
                      <p className="text-gray-600 dark:text-gray-400">support@medicate.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-medicate-primary" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Support Hours</p>
                      <p className="text-gray-600 dark:text-gray-400">24/7 Available</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Contact Form */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Send us a Message</h3>
                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                    <Select value={supportForm.subject} onValueChange={(value) => setSupportForm({...supportForm, subject: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                    <Textarea
                      rows={4}
                      placeholder="Describe your issue or question..."
                      value={supportForm.message}
                      onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
                    />
                  </div>
                  <Button type="submit" className="w-full btn-primary">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {faqItems.map((item, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{item.question}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
