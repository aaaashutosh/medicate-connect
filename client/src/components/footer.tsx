import { Link } from "wouter";
import { Heart, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-medicate-primary" />
              <span className="text-2xl font-bold">MedicateConnect</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Connecting patients with qualified healthcare professionals in Nepal.
              Your trusted platform for telemedicine, appointment booking, and medical consultations.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="h-4 w-4" />
                <span>Kathmandu, Nepal</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4" />
                <span>+977 1 234 5678</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span>info@medicateconnect.com.np</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-medicate-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="text-gray-300 hover:text-medicate-primary transition-colors">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-medicate-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-300 hover:text-medicate-primary transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">Telemedicine</li>
              <li className="text-gray-300">Appointment Booking</li>
              <li className="text-gray-300">Prescription Management</li>
              <li className="text-gray-300">Medical Records</li>
              <li className="text-gray-300">Emergency Consultation</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 MedicateConnect. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-medicate-primary text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-medicate-primary text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-medicate-primary text-sm transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
