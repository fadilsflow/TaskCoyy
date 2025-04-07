import { useEffect } from "react"
import { KanbanData, TimerSettings } from "@/types/kanban"

export function useLocalStorage(
    isClient: boolean,
    data: KanbanData,
    setData: React.Dispatch<React.SetStateAction<KanbanData>>,
    timerSettings: TimerSettings,
    setTimerSettings: (settings: TimerSettings) => void,
    globalTimer: number,
    setGlobalTimer: (timer: number) => void,
    globalTimerMode: string,
    setGlobalTimerMode: (mode: string) => void,
    isGlobalTimerPaused: boolean,
    setIsGlobalTimerPaused: (paused: boolean) => void,
    isGlobalBreakTime: boolean,
    setIsGlobalBreakTime: (breakTime: boolean) => void,
    globalTimerStartTime: number | null,
    setGlobalTimerStartTime: (time: number | null) => void
) {
    // Load data from localStorage after component mounts
    useEffect(() => {
        if (!isClient) return

        // Load kanban data
        const savedData = localStorage.getItem('kanbanData')
        if (savedData) {
            setData(JSON.parse(savedData))
        }

        // Load timer settings
        const savedSettings = localStorage.getItem('timerSettings')
        if (savedSettings) {
            setTimerSettings(JSON.parse(savedSettings))
        }

        // Load timer state
        const savedTimer = localStorage.getItem('globalTimer')
        if (savedTimer) {
            setGlobalTimer(parseInt(savedTimer, 10))
        }

        const savedMode = localStorage.getItem('globalTimerMode')
        if (savedMode) {
            setGlobalTimerMode(savedMode)
        }

        const savedPaused = localStorage.getItem('isGlobalTimerPaused')
        if (savedPaused) {
            setIsGlobalTimerPaused(savedPaused === 'true')
        }

        const savedBreakTime = localStorage.getItem('isGlobalBreakTime')
        if (savedBreakTime) {
            setIsGlobalBreakTime(savedBreakTime === 'true')
        }

        const savedStartTime = localStorage.getItem('globalTimerStartTime')
        if (savedStartTime) {
            setGlobalTimerStartTime(parseInt(savedStartTime, 10))
        }
    }, [isClient])

    // Save data to localStorage whenever it changes
    useEffect(() => {
        if (!isClient) return

        localStorage.setItem('kanbanData', JSON.stringify(data))
        localStorage.setItem('timerSettings', JSON.stringify(timerSettings))
        localStorage.setItem('globalTimer', globalTimer.toString())
        localStorage.setItem('globalTimerMode', globalTimerMode)
        localStorage.setItem('isGlobalTimerPaused', isGlobalTimerPaused.toString())
        localStorage.setItem('isGlobalBreakTime', isGlobalBreakTime.toString())
        if (globalTimerStartTime) {
            localStorage.setItem('globalTimerStartTime', globalTimerStartTime.toString())
        }
    }, [isClient, data, timerSettings, globalTimer, globalTimerMode, isGlobalTimerPaused, isGlobalBreakTime, globalTimerStartTime])
} 