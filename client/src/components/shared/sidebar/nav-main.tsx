import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { PlusSquare, Mail } from "lucide-react";

export function NavMain({
  items,
}: {
  items: Array<{
    title: string;
    url: string;
    icon?: React.ComponentType;
    isActive?: boolean;
  }>;
}) {
  
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-8 duration-200 ease-linear"
            >
              <PlusSquare />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button size="icon" className="size-8" variant="outline">
              <Mail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton className="h-9" tooltip={item.title} isActive={item.isActive}>
                <Link
                  to={item.url}
                  className="flex items-center gap-2 size-full hover:text-green-600 text-muted-foreground"
                >
                  {item.icon && <item.icon className="size-4" />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
