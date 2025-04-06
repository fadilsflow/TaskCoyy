import React from "react"
import { CircleCheck, Github, Layers, Settings } from "lucide-react"
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
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 top-0 z-50 bg-card border-b">
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
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
                    <Link href="https://github.com/taskcoyy">
                        <Button variant="ghost" size="icon">
                            <Github className="w-4 h-4" />
                        </Button>
                    </Link>
                    <SignedOut>
                        <SignInButton />
                        <SignUpButton />
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                    <ModeToggle />
                </div>
            </div>
        </div>
    )
}