import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, ListChecks, MoveHorizontal, Settings } from "lucide-react"

export function ExplanationSection() {
  return (
    <div className="mt-12 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Pomodoro Kanban Board</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A productivity tool that combines the Pomodoro Technique with Kanban task management to help you stay focused
          and organized.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <Clock className="h-6 w-6 text-primary mb-2" />
            <CardTitle className="text-lg">Pomodoro Timer</CardTitle>
            <CardDescription>Focus in timed intervals</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Work in focused 25-minute sessions followed by short breaks. After completing 4 pomodoros, take a longer
              break to recharge.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <MoveHorizontal className="h-6 w-6 text-primary mb-2" />
            <CardTitle className="text-lg">Kanban Board</CardTitle>
            <CardDescription>Visualize your workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Organize tasks into columns representing different stages of your workflow. Drag and drop tasks to update
              their status.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <ListChecks className="h-6 w-6 text-primary mb-2" />
            <CardTitle className="text-lg">Task Management</CardTitle>
            <CardDescription>Stay organized</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create, edit, and complete tasks. Track progress with pomodoro counters and automatically move completed
              tasks to the Done column.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <Settings className="h-6 w-6 text-primary mb-2" />
            <CardTitle className="text-lg">Customizable</CardTitle>
            <CardDescription>Adapt to your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Customize timer durations for pomodoros and breaks. Adjust settings to match your personal productivity
              rhythm.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">How to Use</h3>
        <ol className="space-y-2 list-decimal list-inside">
          <li>
            <span className="font-medium">Add tasks</span> - Create new tasks with titles, descriptions, and estimated
            pomodoros
          </li>
          <li>
            <span className="font-medium">Organize workflow</span> - Drag tasks between To Do, In Progress, and Done
            columns
          </li>
          <li>
            <span className="font-medium">Start working</span> - Begin a pomodoro timer for tasks in the In Progress
            column
          </li>
          <li>
            <span className="font-medium">Take breaks</span> - Follow the prompted short and long breaks between
            pomodoros
          </li>
          <li>
            <span className="font-medium">Track progress</span> - Monitor completed pomodoros and mark tasks as done
            when finished
          </li>
          <li>
            <span className="font-medium">Customize settings</span> - Adjust timer durations to match your preferences
          </li>
        </ol>
      </div>
    </div>
  )
}

