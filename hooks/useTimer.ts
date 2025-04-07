import { useState, useEffect } from "react"
import { toast } from "sonner"
import { TimerMode, TimerSettings, Task } from "@/types/kanban"

export function useTimer(
    timerSettings: TimerSettings,
    activeTasks: Task[],
    updateTask: (taskId: string, updates: Partial<Task>) => void
) {
    const [globalTimer, setGlobalTimer] = useState(25 * 60)
    const [globalTimerMode, setGlobalTimerMode] = useState<TimerMode>("pomodoro")
    const [isGlobalTimerPaused, setIsGlobalTimerPaused] = useState(true)
    const [globalTimerStartTime, setGlobalTimerStartTime] = useState<number | null>(null)
    const [isGlobalBreakTime, setIsGlobalBreakTime] = useState(false)
    const [remainingTime, setRemainingTime] = useState<number | null>(null)

    useEffect(() => {
        const interval = setInterval(() => {
            if (isGlobalTimerPaused || !globalTimerStartTime) return

            const now = Date.now()
            const elapsed = Math.floor((now - globalTimerStartTime) / 1000)

            let totalTime = 0
            if (globalTimerMode === "pomodoro") {
                totalTime = timerSettings.pomodoroTime
            } else if (globalTimerMode === "break") {
                totalTime = timerSettings.shortBreakTime
            } else {
                totalTime = timerSettings.longBreakTime
            }

            const remaining = Math.max(0, totalTime - elapsed)
            setGlobalTimer(remaining)

            if (remaining === 0) {
                if (globalTimerMode === "pomodoro") {
                    toast.success("Pomodoro completed! Time for a break.")
                    setGlobalTimerMode("break")
                    setIsGlobalBreakTime(true)
                    setGlobalTimerStartTime(Date.now())
                    setGlobalTimer(timerSettings.shortBreakTime)
                } else if (globalTimerMode === "break") {
                    toast.success("Short break completed! Ready for next pomodoro?")
                    setGlobalTimerMode("pomodoro")
                    setIsGlobalBreakTime(false)
                    setGlobalTimerStartTime(Date.now())
                    setGlobalTimer(timerSettings.pomodoroTime)
                } else if (globalTimerMode === "long-break") {
                    toast.success("Long break completed! Ready for next pomodoro?")
                    setGlobalTimerMode("pomodoro")
                    setIsGlobalBreakTime(false)
                    setGlobalTimerStartTime(Date.now())
                    setGlobalTimer(timerSettings.pomodoroTime)
                }
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [isGlobalTimerPaused, globalTimerStartTime, globalTimerMode, timerSettings])

    const handleGlobalStartPause = () => {
        if (isGlobalTimerPaused) {
            setIsGlobalTimerPaused(false)
            const now = Date.now()
            const adjustedStartTime = now - ((timerSettings[globalTimerMode === "pomodoro" ? "pomodoroTime" :
                globalTimerMode === "break" ? "shortBreakTime" : "longBreakTime"] - globalTimer) * 1000)
            setGlobalTimerStartTime(adjustedStartTime)

            activeTasks.forEach(task => {
                if (task.isActive && task.isPaused) {
                    updateTask(task.id, {
                        isPaused: false,
                        startTime: adjustedStartTime,
                    })
                }
            })
        } else {
            setIsGlobalTimerPaused(true)
            setRemainingTime(globalTimer)

            activeTasks.forEach(task => {
                if (task.isActive && !task.isPaused && task.startTime) {
                    updateTask(task.id, {
                        isPaused: true,
                        startTime: null,
                    })
                }
            })
        }
    }

    const handleGlobalShortBreak = () => {
        setGlobalTimerMode("break")
        setIsGlobalBreakTime(true)
        setGlobalTimerStartTime(null)
        setGlobalTimer(timerSettings.shortBreakTime)
        setIsGlobalTimerPaused(true)

        activeTasks.forEach(task => {
            if (task.isActive) {
                updateTask(task.id, {
                    isPaused: true,
                    startTime: null,
                    timerMode: "break",
                    isBreakTime: true,
                })
            }
        })
    }

    const handleGlobalLongBreak = () => {
        setGlobalTimerMode("long-break")
        setIsGlobalBreakTime(true)
        setGlobalTimerStartTime(null)
        setGlobalTimer(timerSettings.longBreakTime)
        setIsGlobalTimerPaused(true)

        activeTasks.forEach(task => {
            if (task.isActive) {
                updateTask(task.id, {
                    isPaused: true,
                    startTime: null,
                    timerMode: "long-break",
                    isBreakTime: true,
                })
            }
        })
    }

    const handleGlobalPomodoro = () => {
        setGlobalTimerMode("pomodoro")
        setIsGlobalBreakTime(false)
        setGlobalTimerStartTime(null)
        setGlobalTimer(timerSettings.pomodoroTime)
        setIsGlobalTimerPaused(true)

        activeTasks.forEach(task => {
            if (task.isActive) {
                updateTask(task.id, {
                    isPaused: true,
                    startTime: null,
                    timerMode: "pomodoro",
                    isBreakTime: false,
                })
            }
        })
    }

    const handleSkipTimer = () => {
        if (isGlobalTimerPaused) return

        if (globalTimerMode === "pomodoro") {
            activeTasks.forEach(task => {
                if (task.isActive) {
                    updateTask(task.id, {
                        completedPomodoros: task.completedPomodoros + 1,
                        isPaused: true,
                        startTime: null,
                    })
                }
            })

            const completedPomodoroCount = activeTasks.reduce((sum, task) => sum + task.completedPomodoros, 0)
            if (completedPomodoroCount % timerSettings.longBreakInterval === 0) {
                handleGlobalLongBreak()
            } else {
                handleGlobalShortBreak()
            }

            toast.success("Pomodoro completed!")
        } else {
            handleGlobalPomodoro()
            toast.info("Break skipped. Starting next pomodoro.")
        }

        setIsGlobalTimerPaused(true)
        setGlobalTimerStartTime(null)
    }

    return {
        globalTimer,
        globalTimerMode,
        isGlobalTimerPaused,
        isGlobalBreakTime,
        handleGlobalStartPause,
        handleGlobalShortBreak,
        handleGlobalLongBreak,
        handleGlobalPomodoro,
        handleSkipTimer,
    }
} 