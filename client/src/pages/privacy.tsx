import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, FileText } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-medicate-primary mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your privacy and data security are our top priorities at MedicateConnect
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Last updated: December 2024
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <Eye className="h-8 w-8 text-medicate-primary mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Data Transparency</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                We clearly explain what data we collect and how we use it
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Lock className="h-8 w-8 text-medicate-primary mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Secure Storage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your medical data is encrypted and securely stored
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <FileText className="h-8 w-8 text-medicate-primary mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Your Rights</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                You have full control over your personal information
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-medicate-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Personal Information</h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                  <li>Name, email address, phone number, and date of birth</li>
                  <li>Medical history, allergies, and current medications</li>
                  <li>Insurance information and emergency contact details</li>
                  <li>Profile picture and identification documents</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Usage Data</h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                  <li>Appointment history and consultation records</li>
                  <li>Device information and IP address</li>
                  <li>Website usage patterns and preferences</li>
                  <li>Communication logs with healthcare providers</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Healthcare Services</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                    <li>Facilitate doctor-patient consultations</li>
                    <li>Manage appointment scheduling</li>
                    <li>Process prescription requests</li>
                    <li>Maintain medical records</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Platform Improvement</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                    <li>Enhance user experience</li>
                    <li>Develop new features</li>
                    <li>Provide customer support</li>
                    <li>Ensure platform security</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Security Measures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Technical Security</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                    <li>End-to-end encryption for all communications</li>
                    <li>Secure SSL/TLS connections</li>
                    <li>Regular security audits and updates</li>
                    <li>Multi-factor authentication options</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Administrative Security</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                    <li>Access controls and role-based permissions</li>
                    <li>Regular staff training on data privacy</li>
                    <li>Incident response procedures</li>
                    <li>Compliance with healthcare regulations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Access & Control</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                    <li>View and download your personal data</li>
                    <li>Update your information anytime</li>
                    <li>Delete your account and data</li>
                    <li>Opt-out of marketing communications</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Sharing</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                    <li>Control sharing with healthcare providers</li>
                    <li>Manage research data participation</li>
                    <li>Review third-party data sharing</li>
                    <li>Request data portability</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-medicate-light dark:bg-medicate-dark p-4 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Protection Officer</h4>
                    <p className="text-gray-600 dark:text-gray-300">privacy@medicateconnect.com.np</p>
                    <p className="text-gray-600 dark:text-gray-300">+977 1 234 5678</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Address</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      MedicateConnect Pvt. Ltd.<br />
                      Kathmandu, Nepal
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
