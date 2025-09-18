"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Coffee, AlertCircle, Phone, Shield, Loader2 } from "lucide-react"
import Link from "next/link"
import { authService } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    phoneNumber: "",
    otp: "",
  })
  const [, setOtpSent] = useState(false)

  const router = useRouter();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Basic validation
    if (!formData.phoneNumber) {
      setError("Please enter your phone number")
      setIsLoading(false)
      return
    }

    // Validate phone number format (Nepal format)
    const phoneRegex = /^(\+977)?[9][6-9]\d{8}$/
    if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ""))) {
      setError("Please enter a valid Nepali phone number")
      setIsLoading(false)
      return
    }

    try {
      const { success, error } = await authService.login(formData.phoneNumber);
      
      if (!success) {
        setError(error?.detail || "Failed to send OTP. Please try again.");
        return;
      }

      setStep("otp");
      setOtpSent(true);
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!formData.otp || formData.otp.length !== 6) {
      setError("Please enter the 6-digit OTP")
      setIsLoading(false)
      return
    }

    try {
      console.log('Verifying OTP...');
      const { success, data, error } = await authService.verifyOtp(formData.phoneNumber, formData.otp);
      
      if (!success) {
        console.error('OTP verification failed:', error);
        setError(error?.detail || "Invalid OTP. Please try again.");
        return;
      }

      console.log('OTP verification successful, user data:', data);
      
      // Store user data in localStorage if available
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Redirect to admin dashboard on successful verification
      console.log('Redirecting to /admin');
      router.push("/admin");
      router.refresh(); // Ensure the page refreshes to update auth state
    } catch (err) {
      console.error('OTP verification error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    if (error) setError("")
  }

  const resendOtp = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement resend OTP logic
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setError("")
    } catch (err) {
      console.error('Error resending OTP:', err);
      setError("Failed to resend OTP")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-coffee-600 p-3 rounded-full">
            {step === "phone" ? <Coffee className="h-8 w-8 text-white" /> : <Shield className="h-8 w-8 text-white" />}
          </div>
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-coffee-800">
            {step === "phone" ? "Welcome Back" : "Verify OTP"}
          </CardTitle>
          <CardDescription className="text-coffee-600">
            {step === "phone"
              ? "Enter your phone number to sign in"
              : `Enter the 6-digit code sent to ${formData.phoneNumber}`}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-coffee-500" />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="98XXXXXXXX"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="focus:ring-coffee-500 focus:border-coffee-500 pl-10"
                />
              </div>
              <p className="text-xs text-coffee-500">Enter your registered phone number</p>
            </div>

            <Button type="submit" className="w-full bg-coffee-600 hover:bg-coffee-700 text-black" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>

            <div className="text-center text-sm text-coffee-600">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-coffee-600 hover:text-coffee-800 font-medium hover:underline">
                Sign up here
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                placeholder="000000"
                value={formData.otp}
                onChange={handleInputChange}
                maxLength={6}
                required
                className="focus:ring-coffee-500 focus:border-coffee-500 text-center text-lg tracking-widest"
              />
              <p className="text-xs text-coffee-500">Enter the 6-digit code sent to your phone</p>
            </div>

            <Button type="submit" className="w-full bg-coffee-600 hover:bg-coffee-700 text-black" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Sign In"
              )}
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={resendOtp}
                className="text-sm text-coffee-600 hover:text-coffee-800 hover:underline"
                disabled={isLoading}
              >
                Don&apos;t receive code? Resend OTP
              </button>
              <div>
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="text-sm text-coffee-600 hover:text-coffee-800 hover:underline"
                >
                  Change phone number
                </button>
              </div>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
