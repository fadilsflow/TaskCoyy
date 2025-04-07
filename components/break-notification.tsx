"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { TimerMode } from "@/types/kanban"
import { Coffee, SkipForward } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreakNotificationProps {
  mode: TimerMode
  remainingTime: number
  onSkip: () => void
  onContinue: () => void
}

export function BreakNotification({ mode, remainingTime, onSkip, onContinue }: BreakNotificationProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className={cn("border shadow-lg", mode === "break" ? "border-primary/20" : "border-secondary/20")}>
      <CardContent className="pt-6 px-6">
        <div className="flex items-center justify-center mb-4">
          <Coffee className={cn("h-12 w-12", mode === "break" ? "text-primary" : "text-secondary")} />
        </div>
        <h3 className="text-xl font-semibold text-center mb-2">
          {mode === "break" ? "Time for a short break!" : "Time for a long break!"}
        </h3>
        <p className="text-center text-muted-foreground mb-4">
          {mode === "break"
            ? "Take 5 minutes to rest your mind. Stretch, hydrate, or just relax."
            : "Great job completing your pomodoros! Take 15 minutes to recharge."}
        </p>
        <div className="text-center text-2xl font-bold mb-2">{formatTime(remainingTime)}</div>
      </CardContent>
      <CardFooter className="flex gap-2 px-6 pb-6">
        <Button variant="outline" className="flex-1" onClick={onSkip}>
          <SkipForward className="h-4 w-4 mr-2" />
          Skip Break
        </Button>
        <Button
          className={cn(
            "flex-1",
            mode === "break" ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90",
          )}
          onClick={onContinue}
        >
          <Coffee className="h-4 w-4 mr-2" />
          Continue Break
        </Button>
      </CardFooter>
    </Card>
  )
}

