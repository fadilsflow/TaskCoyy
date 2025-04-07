import { toast } from "sonner"
import { KanbanData, Task } from "@/types/kanban"

export function useTaskManagement(
    data: KanbanData,
    setData: React.Dispatch<React.SetStateAction<KanbanData>>
) {
    const handleAddTask = async (title: string, description: string, totalPomodoros: number) => {
        if (!data.activeProjectId) {
            toast.error("Pilih proyek terlebih dahulu sebelum menambahkan task.");
            return;
        }

        try {
            // Cari kolom "To Do"
            const todoColumn = Object.values(data.columns).find(col => col.title === "To Do");
            if (!todoColumn) {
                toast.error("Kolom 'To Do' tidak ditemukan.");
                return;
            }

            // Hitung posisi untuk task baru (tambahkan di akhir)
            const position = todoColumn.taskIds.length;

            // Buat task baru melalui API
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    totalPomodoros,
                    projectId: data.activeProjectId,
                    columnId: todoColumn.id,
                    position,
                }),
            });

            if (!response.ok) {
                throw new Error('Gagal menambahkan task');
            }

            const newTask = await response.json();

            // Update state lokal
            setData((prevData) => ({
                ...prevData,
                tasks: {
                    ...prevData.tasks,
                    [newTask.id]: newTask
                },
                columns: {
                    ...prevData.columns,
                    [todoColumn.id]: {
                        ...todoColumn,
                        taskIds: [...todoColumn.taskIds, newTask.id]
                    }
                }
            }));

            toast.success(`Task "${title}" telah ditambahkan.`);
        } catch (error) {
            console.error('Error adding task:', error);
            toast.error('Gagal menambahkan task. Silakan coba lagi.');
        }
    };

    const toggleTaskTimer = (taskId: string) => {
        setData((prevData) => {
            const task = prevData.tasks[taskId];
            if (!task) return prevData;

            const updatedTask = {
                ...task,
                isPaused: !task.isPaused,
                startTime: !task.isPaused ? null : Date.now()
            };

            return {
                ...prevData,
                tasks: {
                    ...prevData.tasks,
                    [taskId]: updatedTask
                }
            };
        });
    };

    const startBreak = (taskId: string, isLongBreak: boolean = false) => {
        setData((prevData) => {
            const task = prevData.tasks[taskId];
            if (!task) return prevData;

            const updatedTask = {
                ...task,
                isBreakTime: true,
                isPaused: false,
                startTime: Date.now(),
                timerMode: isLongBreak ? "longBreak" : "shortBreak"
            };

            return {
                ...prevData,
                tasks: {
                    ...prevData.tasks,
                    [taskId]: updatedTask
                }
            };
        });
    };

    const skipBreak = (taskId: string) => {
        setData((prevData) => {
            const task = prevData.tasks[taskId];
            if (!task) return prevData;

            const updatedTask = {
                ...task,
                isBreakTime: false,
                isPaused: false,
                startTime: Date.now(),
                timerMode: "pomodoro"
            };

            return {
                ...prevData,
                tasks: {
                    ...prevData.tasks,
                    [taskId]: updatedTask
                }
            };
        });
    };

    const resetTask = (taskId: string) => {
        setData((prevData) => {
            const task = prevData.tasks[taskId];
            if (!task) return prevData;

            const updatedTask = {
                ...task,
                completedPomodoros: 0,
                isActive: false,
                isPaused: true,
                startTime: null,
                timerMode: "pomodoro",
                isBreakTime: false
            };

            return {
                ...prevData,
                tasks: {
                    ...prevData.tasks,
                    [taskId]: updatedTask
                }
            };
        });
    };

    const handleSaveEditedTask = async (taskId: string, updates: Partial<Task>) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error('Gagal memperbarui task');
            }

            const updatedTask = await response.json();

            setData((prevData) => ({
                ...prevData,
                tasks: {
                    ...prevData.tasks,
                    [taskId]: updatedTask
                }
            }));

            toast.success(`Task "${updatedTask.title}" telah diperbarui.`);
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error('Gagal memperbarui task. Silakan coba lagi.');
        }
    };

    const completeTask = async (taskId: string) => {
        try {
            const response = await fetch('/api/tasks', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: taskId,
                    isCompleted: true,
                    isActive: false,
                    isPaused: true,
                    startTime: null,
                    timerMode: "pomodoro",
                    isBreakTime: false
                }),
            });

            if (!response.ok) {
                throw new Error('Gagal menyelesaikan task');
            }

            const updatedTask = await response.json();

            setData((prevData) => ({
                ...prevData,
                tasks: {
                    ...prevData.tasks,
                    [taskId]: updatedTask
                }
            }));

            toast.success(`Task "${updatedTask.title}" telah selesai.`);
        } catch (error) {
            console.error('Error completing task:', error);
            toast.error('Gagal menyelesaikan task. Silakan coba lagi.');
        }
    };

    return {
        handleAddTask,
        toggleTaskTimer,
        startBreak,
        skipBreak,
        resetTask,
        handleSaveEditedTask,
        completeTask,
    }
} 