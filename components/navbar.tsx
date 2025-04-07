import React from "react"
import { CircleCheck, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs'
import { ModeToggle } from "@/components/mode-toggle"

interface NavbarProps {
    onSettingsClick: () => void;
}

export function Navbar({ onSettingsClick }: NavbarProps) {
    return (
        <div className="justify-center flex px-4 sm:px-6 md:px-8 lg:px-12 top-0 z-50 ">
            <div className=" max-w-xl container flex h-14  items-center justify-between">
                <div className="flex items-center">
                    <Link className="flex items-center space-x-2" href="/">
                        <CircleCheck className="w-5 h-5 flex-shrink-0" />
                        <h1 className="text-xl font-bold flex items-center">
                            TaskCoyy
                        </h1>
                    </Link>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={onSettingsClick}>
                        <Settings className="h-5 w-5" />
                    </Button>
                    <SignedOut>
                        <SignInButton />
                        <SignUpButton />
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>

                </div>
            </div>
        </div>
    )
}