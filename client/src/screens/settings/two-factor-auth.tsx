import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  ShieldCheck,
  Smartphone,
  Mail,
  KeySquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";

export const TwoFactorAuthTab = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [authMethod, setAuthMethod] = useState("none");
  const [showAuthAppSetup, setShowAuthAppSetup] = useState(false);
  const [showEmailSetup, setShowEmailSetup] = useState(false);
  const [showSmsSetup, setShowSmsSetup] = useState(false);

  const toggle2FA = () => {
    if (isEnabled) {
      setIsEnabled(false);
      setAuthMethod("none");
    } else {
      setIsEnabled(true);
    }
  };

  const handleSetupMethod = (method: string) => {
    setAuthMethod(method);

    // Reset all setup states
    setShowAuthAppSetup(false);
    setShowEmailSetup(false);
    setShowSmsSetup(false);

    // Show setup for selected method
    if (method === "authApp") setShowAuthAppSetup(true);
    if (method === "email") setShowEmailSetup(true);
    if (method === "sms") setShowSmsSetup(true);
  };

  const completeSetup = () => {
    // Reset setup states
    setShowAuthAppSetup(false);
    setShowEmailSetup(false);
    setShowSmsSetup(false);
  };

  return (
    <TabsContent value="security" className="mt-6">
      <Card className="rounded-xl shadow-lg overflow-hidden w-full pt-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pt-4">
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-10 h-10 text-blue-600" />
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Two-Factor Authentication
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Add an extra layer of security to your account
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Status section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">Current Status</h3>
                <div className="flex items-center mt-1">
                  <Badge
                    variant={isEnabled ? "success" : "secondary"}
                    className="mr-2"
                  >
                    {isEnabled ? "Active" : "Inactive"}
                  </Badge>
                  <p className="text-sm text-gray-600">
                    {isEnabled
                      ? "Your account is protected with 2FA"
                      : "2FA is currently disabled for your account"}
                  </p>
                </div>
              </div>
              <Button
                variant={isEnabled ? "destructive" : "default"}
                onClick={toggle2FA}
                className="w-full sm:w-auto"
              >
                {isEnabled ? "Disable" : "Enable"} 2FA
              </Button>
            </div>

            {isEnabled ? (
              <div className="space-y-6">
                {/* Authentication App */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <KeySquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Authentication App
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Use an app like Google Authenticator or Authy to
                        generate codes
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {authMethod === "authApp" ? (
                      <Badge
                        variant="success"
                        className="self-start sm:self-center"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleSetupMethod("authApp")}
                        disabled={showAuthAppSetup}
                      >
                        {showAuthAppSetup ? "Setting up..." : "Set up"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Email Verification
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Receive verification codes via email
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {authMethod === "email" ? (
                      <Badge
                        variant="success"
                        className="self-start sm:self-center"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleSetupMethod("email")}
                        disabled={showEmailSetup}
                      >
                        {showEmailSetup ? "Setting up..." : "Set up"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* SMS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Smartphone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        SMS Recovery
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Receive verification codes via text message
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {authMethod === "sms" ? (
                      <Badge
                        variant="success"
                        className="self-start sm:self-center"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleSetupMethod("sms")}
                        disabled={showSmsSetup}
                      >
                        {showSmsSetup ? "Setting up..." : "Set up"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Setup panels */}
                {showAuthAppSetup && (
                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-center gap-3 mb-4">
                      <KeySquare className="w-6 h-6 text-blue-600" />
                      <h3 className="font-semibold text-gray-800">
                        Set up Authenticator App
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        Scan the QR code below with your authenticator app to
                        set up two-factor authentication.
                      </p>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 max-w-[200px] mx-auto">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">QR Code</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 text-center">
                        Or enter this code manually:{" "}
                        <span className="font-mono font-bold">
                          JBSWY3DPEHPK3PXP
                        </span>
                      </p>
                      <div className="mt-4">
                        <Button onClick={completeSetup} className="w-full">
                          I've scanned the QR code
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {showEmailSetup && (
                  <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                    <div className="flex items-center gap-3 mb-4">
                      <Mail className="w-6 h-6 text-purple-600" />
                      <h3 className="font-semibold text-gray-800">
                        Set up Email Verification
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        We'll send a verification code to your email address.
                        Enter the code below to confirm.
                      </p>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Email Address
                          </label>
                          <input
                            type="email"
                            placeholder="your.email@example.com"
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Verification Code
                          </label>
                          <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowEmailSetup(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={completeSetup}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Verify Email
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {showSmsSetup && (
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center gap-3 mb-4">
                      <Smartphone className="w-6 h-6 text-green-600" />
                      <h3 className="font-semibold text-gray-800">
                        Set up SMS Recovery
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        Enter your phone number to receive verification codes
                        via SMS.
                      </p>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-300 focus:border-transparent"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Verification Code
                          </label>
                          <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-300 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowSmsSetup(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={completeSetup}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Verify Number
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-800">
                    Two-factor authentication adds an extra layer of security to
                    your account. When enabled, you'll be required to provide a
                    second form of verification during login.
                  </p>
                </div>
              </div>
            )}

            <Separator className="my-4" />

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Two-factor authentication helps prevent unauthorized access to
                your account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};
