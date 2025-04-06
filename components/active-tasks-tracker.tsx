import type { Task, TimerSettings, TimerMode } from "@/components/kanban-board"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"


interface ActiveTasksTrackerProps {
    activeTasks: Task[]
    globalTimer: number
    timerSettings: TimerSettings
    onStartPause: () => void
    onShortBreak: () => void
    onLongBreak: () => void
    onPomodoro: () => void
    isPaused: boolean
    timerMode: TimerMode
    isBreakTime: boolean
}

export function ActiveTasksTracker({
    activeTasks,
    globalTimer,
    timerSettings,
    onStartPause,
    onShortBreak,
    onLongBreak,
    onPomodoro,
    isPaused,
    timerMode,
    isBreakTime
}: ActiveTasksTrackerProps) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const activeTasksCount = activeTasks.length

    const getTimerProgress = () => {
        let totalTime = 0
        if (timerMode === "pomodoro") {
            totalTime = timerSettings.pomodoroTime
        } else if (timerMode === "break") {
            totalTime = timerSettings.shortBreakTime
        } else {
            totalTime = timerSettings.longBreakTime
        }

        const elapsed = totalTime - globalTimer
        return Math.min(100, (elapsed / totalTime) * 100)
    }

    return (
        
        <Card
            className="border-none shadow-none bg-transparent"
        >
            <CardContent className="p-6">
                
                <div className="flex justify-center gap-2 mb-4">
                    <Button
                        onClick={onPomodoro}
                        disabled={isBreakTime && timerMode === "pomodoro"}
                        variant={!isBreakTime ? "default" : "ghost"}
                        size="sm"
                        className="w-24"
                    >
                        Pomodoro
                    </Button>
                    <Button
                        onClick={onShortBreak}
                        disabled={isBreakTime && timerMode === "break"}
                        variant={isBreakTime && timerMode === "break" ? "default" : "ghost"}
                        size="sm"
                        className="w-24"
                    >
                        Short Break
                    </Button>
                    <Button
                        onClick={onLongBreak}
                        disabled={isBreakTime && timerMode === "long-break"}
                        variant={isBreakTime && timerMode === "long-break" ? "default" : "ghost"}
                        size="sm"
                        className="w-24"
                    >
                        Long Break
                    </Button>
                </div>

                <div className="text-center mb-6">
                    <div className="text-9xl font-bold mb-2">
                        {formatTime(globalTimer)}
                    </div>
                    <div className="text-lg font-medium mb-4">
                        {isBreakTime
                            ? (timerMode === "break" ? "Short Break Time" : "Long Break Time")
                            : "Pomodoro Time"}
                    </div>
                </div>

                <div className="flex justify-center mb-6">
                    <Button
                        onClick={onStartPause}
                        className="w-32"
                    >
                        {isPaused ? "Start" : "Pause"}
                    </Button>
                </div>

               

                {activeTasksCount > 0 && (
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                            Active Tasks ({activeTasksCount})
                        </div>
                        {activeTasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between py-2 border-t">
                                <div className="flex items-center gap-2">
                                    <Check
                                        className={cn(
                                            "h-5 w-5",
                                            task.isBreakTime && task.timerMode === "break"
                                                ? "text-primary"
                                                : task.isBreakTime && task.timerMode === "long-break"
                                                    ? "text-secondary"
                                                    : "text-muted-foreground",
                                        )}
                                    />
                                    <div>
                                        <div className="font-medium">{task.title}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Pomodoros: {task.completedPomodoros}/{task.totalPomodoros}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTasksCount === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                        No active tasks. Drag a task to "In Progress" to start working.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

