"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Coffee, AlertCircle, Phone, User, Mail, Camera, Upload, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { authService } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    profilePicture: null as File | null,
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("Profile picture must be less than 5MB")
        return
      }

      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file")
        return
      }

      setFormData((prev) => ({ ...prev, profilePicture: file }))

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (!formData.fullName || !formData.phoneNumber || !formData.email) {
      setError("Please fill in all required fields")
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

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      const { success, error } = await authService.register({
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        email: formData.email,
        profile_picture: formData.profilePicture || undefined,
      });

      if (!success) {
        setError(error?.detail || "Registration failed. Please try again.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    if (error) setError("")
  }


  if (success) {
    return (
      <div className="w-full max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-coffee-800">Account Created Successfully!</h3>
                <p className="text-coffee-600 mt-2">Your admin account has been created. Redirecting to login...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-coffee-600 p-3 rounded-full">
            <Coffee className="h-8 w-8 text-white" />
          </div>
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-coffee-800">Create Account</CardTitle>
          <CardDescription className="text-coffee-600">Join the Himalayan Java team</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-coffee-100 border-2 border-coffee-200 flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <img
                      src={profileImage || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-coffee-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 bg-coffee-600 text-white rounded-full p-1 hover:bg-coffee-700"
                >
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <div className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-coffee-200 text-coffee-600 hover:bg-coffee-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
                <p className="text-xs text-coffee-500 mt-1">Max 5MB, JPG/PNG only</p>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-coffee-500" />
              <Input
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="focus:ring-coffee-500 focus:border-coffee-500 pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
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
            <p className="text-xs text-coffee-500">This will be used for login authentication</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-coffee-500" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@himalayanjava.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="focus:ring-coffee-500 focus:border-coffee-500 pl-10"
              />
            </div>
          </div>

<Button type="submit" className="w-full bg-coffee-600 hover:bg-coffee-700 text-black" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <div className="text-center text-sm text-coffee-600">
            Already have an account?{" "}
            <Link href="/login" className="text-coffee-600 hover:text-coffee-800 font-medium hover:underline">
              Sign in here
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
