'use client'
import { Button } from "./ui/button"
import { logout } from "@/lib/actions"
import {LogOut} from 'lucide-react'

export function LogoutButton() {
    return(
        <Button variant='ghost' onClick={logout}>
            <LogOut size={4} />
        </Button>
    )
}