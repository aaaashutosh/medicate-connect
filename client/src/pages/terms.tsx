import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Shield, AlertTriangle } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-medicate-primary mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Please read these terms carefully before using MedicateConnect services
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Effective Date: December 2024
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-medicate-primary mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">User Agreement</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Clear terms for using our healthcare platform
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Shield className="h-8 w-8 text-medicate-primary mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Legal Compliance</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Adherence to healthcare regulations and laws
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <AlertTriangle className="h-8 w-8 text-medicate-primary mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Important Notices</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Key disclaimers and liability information
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                By accessing and using MedicateConnect, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Important:</strong> These terms apply to all users including patients, healthcare providers, and administrators using our platform.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                MedicateConnect provides a comprehensive healthcare platform that includes:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">For Patients</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                    <li>Online appointment booking</li>
                    <li>Telemedicine consultations</li>
                    <li>Prescription management</li>
                    <li>Medical record access</li>
                    <li>Health tracking tools</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">For Healthcare Providers</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                    <li>Patient management system</li>
                    <li>Electronic prescription tools</li>
                    <li>Appointment scheduling</li>
                    <li>Medical record management</li>
                    <li>Communication tools</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Account Security</h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Use strong, unique passwords</li>
                  <li>Enable two-factor authentication when available</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Acceptable Use</h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                  <li>Provide accurate and truthful information</li>
                  <li>Use the platform for legitimate healthcare purposes only</li>
                  <li>Respect the privacy and rights of other users</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Important Medical Disclaimer</h4>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      MedicateConnect is not a substitute for emergency medical care. In case of medical emergency, please call emergency services immediately.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Telemedicine Limitations</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                    <li>Telemedicine consultations are not appropriate for all medical conditions</li>
                    <li>Physical examination may be required for accurate diagnosis</li>
                    <li>Some treatments cannot be provided remotely</li>
                    <li>Follow-up care may require in-person visits</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">User Responsibility</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    You are responsible for providing complete and accurate medical information. The platform facilitates communication between you and healthcare providers, but does not guarantee specific medical outcomes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Consultation Fees</h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                  <li>Fees are charged per consultation or service</li>
                  <li>Payment is required before service delivery</li>
                  <li>Refunds are processed according to our refund policy</li>
                  <li>All fees are displayed in Nepali Rupees (NPR)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Payment Methods</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  We accept various payment methods including credit/debit cards, digital wallets, and bank transfers. All payments are processed securely through certified payment gateways.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  <strong>Please read carefully:</strong> MedicateConnect's liability is limited to the maximum extent permitted by law.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  MedicateConnect shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses resulting from:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                  <li>Use or inability to use our services</li>
                  <li>Unauthorized access to your data</li>
                  <li>Statements or conduct of any third party</li>
                  <li>Medical advice or treatment outcomes</li>
                  <li>Technical failures or service interruptions</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We reserve the right to terminate or suspend your account and access to our services immediately, without prior notice or liability, for any reason, including but not limited to breach of these Terms.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Upon termination, your right to use the service will cease immediately. All provisions of these Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-medicate-light dark:bg-medicate-dark p-4 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Legal Department</h4>
                    <p className="text-gray-600 dark:text-gray-300">legal@medicateconnect.com.np</p>
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
