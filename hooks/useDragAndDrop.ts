import { toast } from "sonner"
import { DropResult } from "@hello-pangea/dnd"
import { KanbanData, Task } from "@/types/kanban"

export function useDragAndDrop(
    data: KanbanData,
    setData: React.Dispatch<React.SetStateAction<KanbanData>>,
    globalTimerMode: string,
    isGlobalBreakTime: boolean
) {
    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result

        if (!destination) return
        if (destination.droppableId === source.droppableId && destination.index === source.index) return

        const sourceColumn = data.columns[source.droppableId]
        const destinationColumn = data.columns[destination.droppableId]

        const task = data.tasks[draggableId]

        if (task.projectId !== data.activeProjectId) {
            toast.error("Tidak dapat memindahkan task dari proyek lain.")
            return
        }

        if (sourceColumn.id === destinationColumn.id) {
            const newTaskIds = Array.from(sourceColumn.taskIds)
            newTaskIds.splice(source.index, 1)
            newTaskIds.splice(destination.index, 0, draggableId)

            const newColumn = {
                ...sourceColumn,
                taskIds: newTaskIds,
            }

            setData((prevData) => ({
                ...prevData,
                columns: {
                    ...prevData.columns,
                    [newColumn.id]: newColumn,
                },
            }))
            return
        }

        const sourceTaskIds = Array.from(sourceColumn.taskIds)
        sourceTaskIds.splice(source.index, 1)

        const destinationTaskIds = Array.from(destinationColumn.taskIds)
        destinationTaskIds.splice(destination.index, 0, draggableId)

        const activeTasksCount = Object.values(data.tasks).filter(
            (task) => task.isActive && task.projectId === data.activeProjectId
        ).length

        if (destinationColumn.id === "column-2" && sourceColumn.id !== "column-2" && activeTasksCount >= 5) {
            toast.error("Maksimum task aktif tercapai. Anda hanya dapat memiliki 5 task aktif sekaligus.")
            return
        }

        const updatedTasks = { ...data.tasks }
        const taskToUpdate = updatedTasks[draggableId]

        if (destinationColumn.id === "column-2") {
            updatedTasks[draggableId] = {
                ...taskToUpdate,
                isActive: true,
                isCompleted: false,
                timerMode: globalTimerMode as any,
                isBreakTime: isGlobalBreakTime,
                startTime: Date.now(),
                isPaused: false,
            }

            toast.success(`"${taskToUpdate.title}" sekarang aktif.`)
        } else if (destinationColumn.id === "column-1") {
            updatedTasks[draggableId] = {
                ...taskToUpdate,
                isActive: false,
                isCompleted: false,
                startTime: null,
                isPaused: true,
            }

            toast.info(`"${taskToUpdate.title}" tidak lagi aktif.`)
        } else if (destinationColumn.id === "column-3") {
            updatedTasks[draggableId] = {
                ...taskToUpdate,
                isActive: false,
                isCompleted: true,
                startTime: null,
                isPaused: true,
                timerMode: "pomodoro",
            }

            toast.success(`"${taskToUpdate.title}" telah ditandai sebagai selesai.`)
        }

        setData((prevData) => ({
            ...prevData,
            tasks: updatedTasks,
            columns: {
                ...prevData.columns,
                [sourceColumn.id]: {
                    ...sourceColumn,
                    taskIds: sourceTaskIds,
                },
                [destinationColumn.id]: {
                    ...destinationColumn,
                    taskIds: destinationTaskIds,
                },
            },
        }))
    }

    return { onDragEnd }
} 