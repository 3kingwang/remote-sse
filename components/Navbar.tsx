import { cookies } from "next/headers"
import { LogoutButton } from "./LogoutButton"
import { decrypt } from "@/lib/session"
import Image from "next/image"

export async function Navbar() {
  const cookie = (await cookies()).get("session")?.value
  const session = await decrypt(cookie)
  return (
    <div className="flex justify-between items-center bg-gray-100 p-4 h-16">
      <div className="flex items-center gap-2">
        <Image src="/images/icon.png" width={40} height={40} alt="icon" />
        <h1 className="text-2xl font-bold">Remote Diagnosis</h1>
      </div>
      {session && session?.username && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-medium font-medium">Welcome {session?.username}</p>
          <LogoutButton />
        </div>
      )}
    </div>
  )
}
