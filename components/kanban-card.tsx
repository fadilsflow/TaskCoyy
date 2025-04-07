"use client"

import type { Task, TimerMode, TimerSettings } from "@/components/kanban-board"
import { Draggable } from "@hello-pangea/dnd"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface KanbanCardProps {
    task: Task
    index: number
    isInProgress: boolean
    toggleTaskTimer: (taskId: string) => void
    startBreak: (taskId: string, isLongBreak?: boolean) => void
    skipBreak: (taskId: string) => void
    resetTask: (taskId: string) => void
    editTask: (taskId: string) => void
    completeTask: (taskId: string) => void
    timerSettings: TimerSettings
}

export function KanbanCard({
    task,
    index,
    isInProgress,
    toggleTaskTimer,
    startBreak,
    skipBreak,
    resetTask,
    editTask,
    completeTask,
    timerSettings,
}: KanbanCardProps) {
    const formatTime = (seconds: number) => {
        if (seconds < 60) {
            return `${seconds}s`
        }
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}m ${secs}s`
    }

    const getTimerLabel = (mode: TimerMode) => {
        switch (mode) {
            case "pomodoro":
                return "Pomodoro"
            case "break":
                return "Short Break"
            case "long-break":
                return "Long Break"
        }
    }

    const getTimerColor = (mode: TimerMode, isBreakTime: boolean) => {
        if (!isBreakTime && mode === "pomodoro") {
            return "bg-primary hover:bg-primary/90 text-primary-foreground"
        } else if (isBreakTime && mode === "break") {
            return "bg-primary hover:bg-primary/90 text-primary-foreground"
        } else if (isBreakTime && mode === "long-break") {
            return "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        } else {
            return ""
        }
    }

    const getTimerDuration = (mode: TimerMode) => {
        switch (mode) {
            case "pomodoro":
                return timerSettings.pomodoroTime
            case "break":
                return timerSettings.shortBreakTime
            case "long-break":
                return timerSettings.longBreakTime
        }
    }


    const handleToggleTimer = () => {
        toggleTaskTimer(task.id)
    }

    const handleStartBreak = (isLongBreak = false) => {
        startBreak(task.id, isLongBreak)
    }

    const handleSkipBreak = () => {
        skipBreak(task.id)
    }

    const handleResetTask = () => {
        resetTask(task.id)
    }

    const handleEditTask = () => {
        editTask(task.id)
    }

    const handleCompleteTask = () => {
        completeTask(task.id)
    }

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="mb-3">
                    <Card
                        className={cn(
                            "bg-white dark:bg-card transition-all duration-200",
                            snapshot.isDragging && "shadow-lg ring-2 ring-primary/20",
                            task.isBreakTime && task.timerMode === "break" && "border-primary/30",
                            task.isBreakTime && task.timerMode === "long-break" && "border-secondary/30",
                            task.isCompleted && "border-green-300 dark:border-green-800",
                        )}
                    >
                        <CardHeader className="pb-2 flex flex-row justify-between items-start">
                            <div className="flex-1">
                                <CardTitle className="text-base flex items-center gap-2">
                                    {task.title}
                                    {task.isCompleted && (
                                        <Badge
                                            variant="outline"
                                            className="ml-auto border-green-300 text-green-600 dark:border-green-800 dark:text-green-400"
                                        >
                                            Completed
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription>{task.description}</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleEditTask} className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pb-2 space-y-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <span>
                                    Pomodoros: {task.completedPomodoros}/{task.totalPomodoros}
                                </span>
                            </div>

                            {!task.isCompleted && (
                                <Button variant="outline" size="sm" className="w-full mt-1" onClick={handleCompleteTask}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Mark as Complete
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </Draggable>
    )
}


