"use client"

import { useState, useEffect } from "react"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import { KanbanColumn } from "@/components/kanban-column"
import { ActiveTasksTracker } from "@/components/active-tasks-tracker"
import { Button } from "@/components/ui/button"
import { PlusCircle, Settings } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SettingsDialog } from "@/components/settings-dialog"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { toast } from "sonner"

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
}

export type Column = {
    id: string
    title: string
    taskIds: string[]
}

export type KanbanData = {
    tasks: Record<string, Task>
    columns: Record<string, Column>
    columnOrder: string[]
}

export type TimerSettings = {
    pomodoroTime: number
    shortBreakTime: number
    longBreakTime: number
    longBreakInterval: number
}

interface KanbanBoardProps {
    isSettingsOpen?: boolean;
    setIsSettingsOpen?: (open: boolean) => void;
}

const initialData: KanbanData = {
    tasks: {
        "task-1": {
            id: "task-1",
            title: "Research competitors",
            description: "Analyze top 5 competitors in the market",
            totalPomodoros: 4,
            completedPomodoros: 0,
            isActive: false,
            isPaused: true,
            startTime: null,
            timerMode: "pomodoro" as TimerMode,
            isBreakTime: false,
            isCompleted: false,
        },
        "task-2": {
            id: "task-2",
            title: "Design homepage mockup",
            description: "Create wireframes for the new homepage",
            totalPomodoros: 3,
            completedPomodoros: 0,
            isActive: false,
            isPaused: true,
            startTime: null,
            timerMode: "pomodoro" as TimerMode,
            isBreakTime: false,
            isCompleted: false,
        },
        "task-3": {
            id: "task-3",
            title: "Fix navigation bug",
            description: "Mobile menu doesn't close properly",
            totalPomodoros: 2,
            completedPomodoros: 0,
            isActive: true,
            isPaused: false,
            startTime: Date.now() - 14000, // 14 seconds ago
            timerMode: "pomodoro" as TimerMode,
            isBreakTime: false,
            isCompleted: false,
        },
        "task-4": {
            id: "task-4",
            title: "Write API documentation",
            description: "Document all endpoints for the new API",
            totalPomodoros: 2,
            completedPomodoros: 0,
            isActive: false,
            isPaused: true,
            startTime: null,
            timerMode: "pomodoro" as TimerMode,
            isBreakTime: false,
            isCompleted: false,
        },
        "task-5": {
            id: "task-5",
            title: "Update dependencies",
            description: "Update all npm packages to latest versions",
            totalPomodoros: 2,
            completedPomodoros: 2,
            isActive: false,
            isPaused: true,
            startTime: null,
            timerMode: "pomodoro" as TimerMode,
            isBreakTime: false,
            isCompleted: true,
        },
    },
    columns: {
        "column-1": {
            id: "column-1",
            title: "To Do",
            taskIds: ["task-1", "task-2"],
        },
        "column-2": {
            id: "column-2",
            title: "In Progress",
            taskIds: ["task-3", "task-4"],
        },
        "column-3": {
            id: "column-3",
            title: "Done",
            taskIds: ["task-5"],
        },
    },
    columnOrder: ["column-1", "column-2", "column-3"],
}

export function KanbanBoard({ isSettingsOpen: externalIsSettingsOpen, setIsSettingsOpen: externalSetIsSettingsOpen }: KanbanBoardProps = {}) {
    const [data, setData] = useState<KanbanData>(initialData);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [newTaskPomodoros, setNewTaskPomodoros] = useState(2);
    const [activeTasks, setActiveTasks] = useState<Task[]>([]);
    const [globalTimer, setGlobalTimer] = useState(25 * 60); // Default to 25 minutes
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [timerSettings, setTimerSettings] = useState<TimerSettings>({
        pomodoroTime: 25 * 60,
        shortBreakTime: 5 * 60,
        longBreakTime: 15 * 60,
        longBreakInterval: 4,
    });
    const [globalTimerMode, setGlobalTimerMode] = useState<TimerMode>("pomodoro");
    const [isGlobalTimerPaused, setIsGlobalTimerPaused] = useState(true); // Default to paused
    const [globalTimerStartTime, setGlobalTimerStartTime] = useState<number | null>(null);
    const [isGlobalBreakTime, setIsGlobalBreakTime] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Use external state if provided
    const effectiveIsSettingsOpen = externalIsSettingsOpen !== undefined ? externalIsSettingsOpen : isSettingsOpen;
    const effectiveSetIsSettingsOpen = externalSetIsSettingsOpen || setIsSettingsOpen;

    // Set isClient to true after component mounts
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Load data from localStorage after component mounts
    useEffect(() => {
        if (!isClient) return;

        // Load kanban data
        const savedData = localStorage.getItem('kanbanData');
        if (savedData) {
            setData(JSON.parse(savedData));
        }

        // Load timer settings
        const savedSettings = localStorage.getItem('timerSettings');
        if (savedSettings) {
            setTimerSettings(JSON.parse(savedSettings));
        }

        // Load timer state
        const savedTimer = localStorage.getItem('globalTimer');
        if (savedTimer) {
            setGlobalTimer(parseInt(savedTimer, 10));
        }

        const savedMode = localStorage.getItem('globalTimerMode');
        if (savedMode) {
            setGlobalTimerMode(savedMode as TimerMode);
        }

        const savedPaused = localStorage.getItem('isGlobalTimerPaused');
        if (savedPaused) {
            setIsGlobalTimerPaused(savedPaused === 'true');
        }

        const savedBreakTime = localStorage.getItem('isGlobalBreakTime');
        if (savedBreakTime) {
            setIsGlobalBreakTime(savedBreakTime === 'true');
        }

        const savedStartTime = localStorage.getItem('globalTimerStartTime');
        if (savedStartTime) {
            setGlobalTimerStartTime(parseInt(savedStartTime, 10));
        }
    }, [isClient]);

    // Simpan data ke localStorage setiap kali berubah
    useEffect(() => {
        if (!isClient) return;
        localStorage.setItem('kanbanData', JSON.stringify(data));
    }, [data, isClient]);

    // Simpan timer ke localStorage setiap kali berubah
    useEffect(() => {
        if (!isClient) return;
        localStorage.setItem('globalTimer', globalTimer.toString());
        localStorage.setItem('globalTimerMode', globalTimerMode);
        localStorage.setItem('isGlobalTimerPaused', isGlobalTimerPaused.toString());
        localStorage.setItem('isGlobalBreakTime', isGlobalBreakTime.toString());

        if (globalTimerStartTime) {
            localStorage.setItem('globalTimerStartTime', globalTimerStartTime.toString());
        } else {
            localStorage.removeItem('globalTimerStartTime');
        }
    }, [globalTimer, globalTimerMode, isGlobalTimerPaused, isGlobalBreakTime, globalTimerStartTime, isClient]);

    // Simpan pengaturan timer ke localStorage setiap kali berubah
    useEffect(() => {
        if (!isClient) return;
        localStorage.setItem('timerSettings', JSON.stringify(timerSettings));
    }, [timerSettings, isClient]);

    // Update active tasks whenever data changes
    useEffect(() => {
        const inProgressColumn = data.columns["column-2"]
        const activeTasksList = inProgressColumn.taskIds.map((taskId) => data.tasks[taskId]).filter((task) => task.isActive)

        setActiveTasks(activeTasksList)
    }, [data])

    // Update global timer every second
    useEffect(() => {
        if (!isClient) return;

        const interval = setInterval(() => {
            if (isGlobalTimerPaused || !globalTimerStartTime) return;

            const now = Date.now();
            const elapsed = Math.floor((now - globalTimerStartTime) / 1000);

            let totalTime = 0;
            if (globalTimerMode === "pomodoro") {
                totalTime = timerSettings.pomodoroTime;
            } else if (globalTimerMode === "break") {
                totalTime = timerSettings.shortBreakTime;
            } else {
                totalTime = timerSettings.longBreakTime;
            }

            // Calculate remaining time based on current session only
            const remaining = Math.max(0, totalTime - elapsed);
            setGlobalTimer(remaining);

            // Check if timer is completed
            if (remaining === 0) {
                if (globalTimerMode === "pomodoro") {
                    // Show notification for completed pomodoro
                    toast.success("Pomodoro completed! Time for a break.");

                    // Automatically switch to short break
                    setGlobalTimerMode("break");
                    setIsGlobalBreakTime(true);
                    setGlobalTimerStartTime(Date.now());
                    setGlobalTimer(timerSettings.shortBreakTime);
                } else if (globalTimerMode === "break") {
                    // Show notification for completed short break
                    toast.success("Short break completed! Ready for next pomodoro?");

                    // Automatically switch back to pomodoro
                    setGlobalTimerMode("pomodoro");
                    setIsGlobalBreakTime(false);
                    setGlobalTimerStartTime(Date.now());
                    setGlobalTimer(timerSettings.pomodoroTime);
                } else if (globalTimerMode === "long-break") {
                    // Show notification for completed long break
                    toast.success("Long break completed! Ready for next pomodoro?");

                    // Automatically switch back to pomodoro
                    setGlobalTimerMode("pomodoro");
                    setIsGlobalBreakTime(false);
                    setGlobalTimerStartTime(Date.now());
                    setGlobalTimer(timerSettings.pomodoroTime);
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isGlobalTimerPaused, globalTimerStartTime, globalTimerMode, timerSettings, isClient]);

    const handleGlobalStartPause = () => {
        if (isGlobalTimerPaused) {
            // Start timer
            setIsGlobalTimerPaused(false);
            setGlobalTimerStartTime(Date.now());

            // Update all active tasks to start their timers
            setData((prevData) => {
                const updatedTasks = { ...prevData.tasks };
                let hasChanges = false;

                Object.keys(updatedTasks).forEach((taskId) => {
                    const task = updatedTasks[taskId];
                    if (task.isActive && task.isPaused) {
                        updatedTasks[taskId] = {
                            ...task,
                            isPaused: false,
                            startTime: Date.now(),
                        };
                        hasChanges = true;
                    }
                });

                if (!hasChanges) return prevData;

                return {
                    ...prevData,
                    tasks: updatedTasks,
                };
            });
        } else {
            // Pause timer
            setIsGlobalTimerPaused(true);

            // Update all active tasks to pause their timers
            setData((prevData) => {
                const updatedTasks = { ...prevData.tasks };
                let hasChanges = false;

                Object.keys(updatedTasks).forEach((taskId) => {
                    const task = updatedTasks[taskId];
                    if (task.isActive && !task.isPaused && task.startTime) {
                        updatedTasks[taskId] = {
                            ...task,
                            isPaused: true,
                            startTime: null,
                        };
                        hasChanges = true;
                    }
                });

                if (!hasChanges) return prevData;

                return {
                    ...prevData,
                    tasks: updatedTasks,
                };
            });
        }
    }

    const handleGlobalShortBreak = () => {
        setGlobalTimerMode("break");
        setIsGlobalBreakTime(true);
        setGlobalTimerStartTime(null);
        setGlobalTimer(timerSettings.shortBreakTime);
        setIsGlobalTimerPaused(true);

        // Update all active tasks to start short break
        setData((prevData) => {
            const updatedTasks = { ...prevData.tasks };
            let hasChanges = false;

            Object.keys(updatedTasks).forEach((taskId) => {
                const task = updatedTasks[taskId];
                if (task.isActive) {
                    updatedTasks[taskId] = {
                        ...task,
                        isPaused: true,
                        startTime: null,
                        timerMode: "break" as TimerMode,
                        isBreakTime: true,
                    };
                    hasChanges = true;
                }
            });

            if (!hasChanges) return prevData;

            return {
                ...prevData,
                tasks: updatedTasks,
            };
        });
    }

    const handleGlobalLongBreak = () => {
        setGlobalTimerMode("long-break");
        setIsGlobalBreakTime(true);
        setGlobalTimerStartTime(null);
        setGlobalTimer(timerSettings.longBreakTime);
        setIsGlobalTimerPaused(true);

        // Update all active tasks to start long break
        setData((prevData) => {
            const updatedTasks = { ...prevData.tasks };
            let hasChanges = false;

            Object.keys(updatedTasks).forEach((taskId) => {
                const task = updatedTasks[taskId];
                if (task.isActive) {
                    updatedTasks[taskId] = {
                        ...task,
                        isPaused: true,
                        startTime: null,
                        timerMode: "long-break" as TimerMode,
                        isBreakTime: true,
                    };
                    hasChanges = true;
                }
            });

            if (!hasChanges) return prevData;

            return {
                ...prevData,
                tasks: updatedTasks,
            };
        });
    }

    const handleGlobalPomodoro = () => {
        setGlobalTimerMode("pomodoro");
        setIsGlobalBreakTime(false);
        setGlobalTimerStartTime(null);
        setGlobalTimer(timerSettings.pomodoroTime);
        setIsGlobalTimerPaused(true);

        // Update all active tasks to start pomodoro
        setData((prevData) => {
            const updatedTasks = { ...prevData.tasks };
            let hasChanges = false;

            Object.keys(updatedTasks).forEach((taskId) => {
                const task = updatedTasks[taskId];
                if (task.isActive) {
                    updatedTasks[taskId] = {
                        ...task,
                        isPaused: true,
                        startTime: null,
                        timerMode: "pomodoro" as TimerMode,
                        isBreakTime: false,
                    };
                    hasChanges = true;
                }
            });

            if (!hasChanges) return prevData;

            return {
                ...prevData,
                tasks: updatedTasks,
            };
        });
    }

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result

        // If there's no destination, do nothing
        if (!destination) return

        // If dropped in the same position, do nothing
        if (destination.droppableId === source.droppableId && destination.index === source.index) return

        // Get source and destination columns
        const sourceColumn = data.columns[source.droppableId]
        const destinationColumn = data.columns[destination.droppableId]

        // If moving within the same column
        if (sourceColumn.id === destinationColumn.id) {
            const newTaskIds = Array.from(sourceColumn.taskIds)
            newTaskIds.splice(source.index, 1)
            newTaskIds.splice(destination.index, 0, draggableId)

            const newColumn = {
                ...sourceColumn,
                taskIds: newTaskIds,
            }

            setData({
                ...data,
                columns: {
                    ...data.columns,
                    [newColumn.id]: newColumn,
                },
            })
            return
        }

        // Moving from one column to another
        const sourceTaskIds = Array.from(sourceColumn.taskIds)
        sourceTaskIds.splice(source.index, 1)

        const destinationTaskIds = Array.from(destinationColumn.taskIds)
        destinationTaskIds.splice(destination.index, 0, draggableId)

        // Check if moving to "In Progress" and there are already 5 active tasks
        const activeTasksCount = Object.values(data.tasks).filter((task) => task.isActive).length

        if (destinationColumn.id === "column-2" && sourceColumn.id !== "column-2" && activeTasksCount >= 5) {
            // Don't allow more than 5 active tasks
            toast.error("Maximum active tasks reached. You can only have 5 active tasks at once.")
            return
        }

        // Update task status based on column
        const updatedTasks = { ...data.tasks }
        const task = updatedTasks[draggableId]

        // If moving to "In Progress", activate the task
        if (destinationColumn.id === "column-2") {
            updatedTasks[draggableId] = {
                ...task,
                isActive: true,
                isCompleted: false,
                timerMode: globalTimerMode,
                isBreakTime: isGlobalBreakTime,
                startTime: Date.now(),
                isPaused: false,
            }

            toast.success(`"${task.title}" is now active.`)
        }
        // If moving to "To Do", deactivate the task
        else if (destinationColumn.id === "column-1") {
            updatedTasks[draggableId] = {
                ...task,
                isActive: false,
                isCompleted: false,
                startTime: null,
                isPaused: true,
            }

            toast.info(`"${task.title}" is no longer active.`)
        }
        // If moving out of "In Progress" to "Done", mark as completed
        else if (destinationColumn.id === "column-3") {
            updatedTasks[draggableId] = {
                ...task,
                isActive: false,
                isCompleted: true,
                startTime: null,
                isPaused: true,
            }

            toast.success(`"${task.title}" has been marked as done.`)
        }

        setData({
            ...data,
            tasks: updatedTasks,
            columns: {
                ...data.columns,
                [sourceColumn.id]: {
                    ...sourceColumn,
                    taskIds: sourceTaskIds,
                },
                [destinationColumn.id]: {
                    ...destinationColumn,
                    taskIds: destinationTaskIds,
                },
            },
        })
    }

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return

        const newTaskId = `task-${Date.now()}`
        const newTask: Task = {
            id: newTaskId,
            title: newTaskTitle,
            description: newTaskDescription,
            totalPomodoros: newTaskPomodoros,
            completedPomodoros: 0,
            isActive: false,
            isPaused: true,
            startTime: null,
            timerMode: "pomodoro" as TimerMode,
            isBreakTime: false,
            isCompleted: false,
        }

        const column = data.columns["column-1"]
        const newTaskIds = Array.from(column.taskIds)
        newTaskIds.push(newTaskId)

        setData({
            ...data,
            tasks: {
                ...data.tasks,
                [newTaskId]: newTask,
            },
            columns: {
                ...data.columns,
                "column-1": {
                    ...column,
                    taskIds: newTaskIds,
                },
            },
        })

        setNewTaskTitle("")
        setNewTaskDescription("")
        setNewTaskPomodoros(2)
        setIsDialogOpen(false)

        toast.success(`"${newTaskTitle}" has been added to your tasks.`)
    }

    const toggleTaskTimer = (taskId: string) => {
        setData((prevData) => {
            const task = prevData.tasks[taskId]

            if (!task.isActive) return prevData

            const updatedTask = {
                ...task,
                isPaused: !task.isPaused,
                startTime: task.isPaused ? Date.now() : null,
            }

            // Show toast notification
            if (task.isPaused) {
                toast.success(task.isBreakTime ? "Take some time to relax." : "Focus on your task.")
            } else {
                toast.info("Timer has been paused.")
            }

            return {
                ...prevData,
                tasks: {
                    ...prevData.tasks,
                    [taskId]: updatedTask,
                },
            }
        })
    }

    const startBreak = (taskId: string, isLongBreak = false) => {
        setData((prevData) => {
            const task = prevData.tasks[taskId]

            if (!task.isActive) return prevData

            const updatedTask = {
                ...task,
                isPaused: false,
                startTime: Date.now(),
                timerMode: isLongBreak ? "long-break" as TimerMode : "break" as TimerMode,
                isBreakTime: true,
            }

            toast.success(isLongBreak ? "Take 15 minutes to recharge." : "Take 5 minutes to relax.")

            return {
                ...prevData,
                tasks: {
                    ...prevData.tasks,
                    [taskId]: updatedTask,
                },
            }
        })
    }

    const skipBreak = (taskId: string) => {
        setData((prevData) => {
            const task = prevData.tasks[taskId]

            if (!task.isActive) return prevData

            const updatedTask = {
                ...task,
                isPaused: true,
                startTime: null,
                timerMode: "pomodoro" as TimerMode,
                isBreakTime: false,
            }

            toast.info("Ready for the next pomodoro.")

            return {
                ...prevData,
                tasks: {
                    ...prevData.tasks,
                    [taskId]: updatedTask,
                },
            }
        })
    }

    const resetTask = (taskId: string) => {
        setData((prevData) => {
            const task = prevData.tasks[taskId]

            const updatedTask = {
                ...task,
                isPaused: true,
                startTime: null,
                completedPomodoros: 0,
                timerMode: "pomodoro" as TimerMode,
                isBreakTime: false,
            }

            toast.info("Timer and progress have been reset.")

            return {
                ...prevData,
                tasks: {
                    ...prevData.tasks,
                    [taskId]: updatedTask,
                },
            }
        })
    }

    const editTask = (taskId: string) => {
        const task = data.tasks[taskId]
        if (task) {
            setEditingTask(task)
            setIsEditDialogOpen(true)
        }
    }

    const handleSaveEditedTask = (updatedFields: Partial<Task>) => {
        if (!editingTask) return

        setData((prevData) => {
            const updatedTask = {
                ...prevData.tasks[editingTask.id],
                ...updatedFields,
            }

            toast.success(`"${updatedTask.title}" has been updated.`)

            return {
                ...prevData,
                tasks: {
                    ...prevData.tasks,
                    [editingTask.id]: updatedTask,
                },
            }
        })

        setEditingTask(null)
    }

    const completeTask = (taskId: string) => {
        setData((prevData) => {
            const task = prevData.tasks[taskId]

            // Find which column the task is in
            let sourceColumnId = ""
            for (const columnId of prevData.columnOrder) {
                if (prevData.columns[columnId].taskIds.includes(taskId)) {
                    sourceColumnId = columnId
                    break
                }
            }

            if (!sourceColumnId) return prevData

            // If already in Done column, do nothing
            if (sourceColumnId === "column-3") {
                return prevData
            }

            // Remove from current column
            const sourceColumn = prevData.columns[sourceColumnId]
            const sourceTaskIds = Array.from(sourceColumn.taskIds)
            const taskIndex = sourceTaskIds.indexOf(taskId)
            sourceTaskIds.splice(taskIndex, 1)

            // Add to Done column
            const doneColumn = prevData.columns["column-3"]
            const doneTaskIds = Array.from(doneColumn.taskIds)
            doneTaskIds.push(taskId)

            // Update task
            const updatedTask = {
                ...task,
                isActive: false,
                isPaused: true,
                startTime: null,
                isCompleted: true,
                timerMode: "pomodoro" as TimerMode,
            }

            toast.success(`"${task.title}" has been marked as done.`)

            return {
                ...prevData,
                tasks: {
                    ...prevData.tasks,
                    [taskId]: updatedTask,
                },
                columns: {
                    ...prevData.columns,
                    [sourceColumnId]: {
                        ...sourceColumn,
                        taskIds: sourceTaskIds,
                    },
                    "column-3": {
                        ...doneColumn,
                        taskIds: doneTaskIds,
                    },
                },
            }
        })
    }

    const updateTimerSettings = (settings: TimerSettings) => {
        setTimerSettings(settings)
        setIsSettingsOpen(false)

        toast.success("Timer settings have been updated.")
    }

    return (
        <div className="space-y-6">


            {isClient && (
                <ActiveTasksTracker
                    activeTasks={activeTasks}
                    globalTimer={globalTimer}
                    timerSettings={timerSettings}
                    onStartPause={handleGlobalStartPause}
                    onShortBreak={handleGlobalShortBreak}
                    onLongBreak={handleGlobalLongBreak}
                    onPomodoro={handleGlobalPomodoro}
                    isPaused={isGlobalTimerPaused}
                    timerMode={globalTimerMode}
                    isBreakTime={isGlobalBreakTime}
                />
            )}
            <div className="flex justify-end items-center">

                <div className="flex gap-2">
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Task
                    </Button>
                </div>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.columnOrder.map((columnId) => {
                        const column = data.columns[columnId]
                        const tasks = column.taskIds.map((taskId) => data.tasks[taskId])
                        const count = tasks.length

                        return (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                tasks={tasks}
                                count={count}
                                isInProgress={column.id === "column-2"}
                                toggleTaskTimer={toggleTaskTimer}
                                startBreak={startBreak}
                                skipBreak={skipBreak}
                                resetTask={resetTask}
                                editTask={editTask}
                                completeTask={completeTask}
                                timerSettings={timerSettings}
                            />
                        )
                    })}
                </div>
            </DragDropContext>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                placeholder="Task title"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={newTaskDescription}
                                onChange={(e) => setNewTaskDescription(e.target.value)}
                                placeholder="Task description"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="pomodoros">Number of Pomodoros</Label>
                            <Input
                                id="pomodoros"
                                type="number"
                                min={1}
                                value={newTaskPomodoros}
                                onChange={(e) => setNewTaskPomodoros(Number.parseInt(e.target.value) || 2)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddTask}>Add Task</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={effectiveIsSettingsOpen} onOpenChange={effectiveSetIsSettingsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Timer Settings</DialogTitle>
                        <DialogDescription>
                            Customize your timer settings below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="pomodoroTime">Pomodoro Time (minutes)</Label>
                            <Input
                                id="pomodoroTime"
                                type="number"
                                min={1}
                                value={Math.floor(timerSettings.pomodoroTime / 60)}
                                onChange={(e) => setTimerSettings({ ...timerSettings, pomodoroTime: (Number.parseInt(e.target.value) || 1) * 60 })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="shortBreakTime">Short Break Time (minutes)</Label>
                            <Input
                                id="shortBreakTime"
                                type="number"
                                min={1}
                                value={Math.floor(timerSettings.shortBreakTime / 60)}
                                onChange={(e) => setTimerSettings({ ...timerSettings, shortBreakTime: (Number.parseInt(e.target.value) || 1) * 60 })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="longBreakTime">Long Break Time (minutes)</Label>
                            <Input
                                id="longBreakTime"
                                type="number"
                                min={1}
                                value={Math.floor(timerSettings.longBreakTime / 60)}
                                onChange={(e) => setTimerSettings({ ...timerSettings, longBreakTime: (Number.parseInt(e.target.value) || 1) * 60 })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="longBreakInterval">Long Break Interval (pomodoros)</Label>
                            <Input
                                id="longBreakInterval"
                                type="number"
                                min={1}
                                value={timerSettings.longBreakInterval}
                                onChange={(e) => setTimerSettings({ ...timerSettings, longBreakInterval: Number.parseInt(e.target.value) || 1 })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => effectiveSetIsSettingsOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            updateTimerSettings(timerSettings)
                            effectiveSetIsSettingsOpen(false)
                        }}>Save Settings</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <EditTaskDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                task={editingTask}
                onSave={handleSaveEditedTask}
            />
        </div>
    )
}

