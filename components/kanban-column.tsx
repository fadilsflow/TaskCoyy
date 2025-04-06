import type { Column, Task, TimerSettings } from "@/components/kanban-board"
import { KanbanCard } from "@/components/kanban-card"
import { Droppable } from "@hello-pangea/dnd"
import { cn } from "@/lib/utils"

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  count: number
  isInProgress: boolean
  toggleTaskTimer: (taskId: string) => void
  startBreak: (taskId: string, isLongBreak?: boolean) => void
  skipBreak: (taskId: string) => void
  resetTask: (taskId: string) => void
  editTask: (taskId: string) => void
  completeTask: (taskId: string) => void
  timerSettings: TimerSettings
}

export function KanbanColumn({
  column,
  tasks,
  count,
  isInProgress,
  toggleTaskTimer,
  startBreak,
  skipBreak,
  resetTask,
  editTask,
  completeTask,
  timerSettings,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          "rounded-t-lg py-2 px-4 font-medium",
          column.id === "column-1"
            ? "bg-muted"
            : column.id === "column-2"
              ? "bg-primary/10"
              : "bg-green-100 dark:bg-green-900/20",
        )}
      >
        <h3 className="text-lg">
          {column.title} ({count})
        </h3>
      </div>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 p-2 rounded-b-lg min-h-[500px]",
              column.id === "column-1"
                ? "bg-muted/30"
                : column.id === "column-2"
                  ? "bg-primary/5"
                  : "bg-green-50/50 dark:bg-green-900/10",
              snapshot.isDraggingOver && "ring-2 ring-inset ring-primary/20",
            )}
          >
            {tasks.map((task, index) => (
              <KanbanCard
                key={task.id}
                task={task}
                index={index}
                isInProgress={isInProgress}
                toggleTaskTimer={toggleTaskTimer}
                startBreak={startBreak}
                skipBreak={skipBreak}
                resetTask={resetTask}
                editTask={editTask}
                completeTask={completeTask}
                timerSettings={timerSettings}
              />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && (
              <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">No tasks</div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}

