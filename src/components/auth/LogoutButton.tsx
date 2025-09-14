"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/api/auth"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    // Clear the auth token and user data
    authService.logout()
    
    // Redirect to login page
    router.push("/login")
    router.refresh()
  }

  return (
    <Button 
      variant="ghost" 
      onClick={handleLogout}
      className="text-red-600 hover:bg-red-50 hover:text-red-700"
    >
      Logout
    </Button>
  )
}
