import { Progress } from "@/components/ui/progress"
import type { TimerMode } from "@/components/kanban-board"

interface PomodoroTimerProps {
    mode: TimerMode
    elapsedTime: number
    totalTime: number
}

export function PomodoroTimer({ mode, elapsedTime, totalTime }: PomodoroTimerProps) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const remainingTime = Math.max(0, totalTime - elapsedTime)
    const progress = Math.min(100, (elapsedTime / totalTime) * 100)

    const getProgressColor = () => {
        switch (mode) {
            case "pomodoro":
                return "bg-primary"
            case "break":
                return "bg-primary"
            case "long-break":
                return "bg-secondary"
        }
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span>Remaining: {formatTime(remainingTime)}</span>
                <span>Total: {formatTime(totalTime)}</span>
            </div>
            <Progress value={progress} className={`h-2 ${getProgressColor()}`} />
        </div>
    )
}

