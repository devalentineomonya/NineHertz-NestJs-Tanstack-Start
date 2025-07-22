import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { Button } from "@/components/ui/button"
  import { Badge } from "@/components/ui/badge"
  import { ScrollArea } from "@/components/ui/scroll-area"
  import { Bell } from "lucide-react"

  export default function NotificationDropdown() {
    const notifications = [
      {
        id: 1,
        title: "Launch Admin",
        description: "Just see my new admin!",
        time: "9:30 AM",
        type: "error",
      },
      {
        id: 2,
        title: "Event Today",
        description: "Just a reminder that you have an event",
        time: "9:15 AM",
        type: "primary",
      },
      {
        id: 3,
        title: "Settings",
        description: "You can customize this template as you want",
        time: "4:36 PM",
        type: "secondary",
      },
    ]

    const typeColors: Record<string, string> = {
      error: "bg-red-100 text-red-600 dark:bg-red-900/40",
      primary: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40",
      secondary: "bg-teal-100 text-teal-600 dark:bg-teal-900/40",
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <Badge
              className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-primary text-white rounded-full"
            >
              5
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[360px] p-0 rounded-md shadow-lg bg-background text-foreground"
        >
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <Badge className="bg-primary text-white px-2.5 py-1 rounded-sm">
              5 new
            </Badge>
          </div>

          <ScrollArea className="max-h-80">
            <ul className="divide-y">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className="px-4 py-3 flex justify-between items-center hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 flex items-center justify-center rounded-full ${typeColors[n.type]}`}>
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <h5 className="text-sm font-semibold">{n.title}</h5>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {n.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{n.time}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>

          <div className="px-4 py-2 border-t">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white text-sm">
              See All Notifications
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
