export type TimerMode = "pomodoro" | "break" | "long-break"

export type Task = {
    id: string
    title: string
    description: string
    totalPomodoros: number
    completedPomodoros: number
    isActive: boolean
    isPaused: boolean
    startTime: number | null
    timerMode: TimerMode
    isBreakTime: boolean
    isCompleted: boolean
    projectId: string
}

export type Column = {
    id: string
    title: string
    taskIds: string[]
}

export type Project = {
    id: string
    title: string
    createdAt: number
    updatedAt: number
    isActive: boolean
}

export type KanbanData = {
    tasks: Record<string, Task>
    columns: Record<string, Column>
    columnOrder: string[]
    projects: Record<string, Project>
    activeProjectId: string | null
}

export type TimerSettings = {
    pomodoroTime: number
    shortBreakTime: number
    longBreakTime: number
    longBreakInterval: number
} 