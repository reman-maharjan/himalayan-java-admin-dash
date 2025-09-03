import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to admin dashboard since this is an admin-only app
  redirect("/admin")
}
