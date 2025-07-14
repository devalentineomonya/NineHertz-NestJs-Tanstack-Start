import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";


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
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                className="h-9"
                tooltip={item.title}
                isActive={item.isActive}
              >
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
