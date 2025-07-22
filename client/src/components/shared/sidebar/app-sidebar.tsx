import { NavMain } from "@/components/shared/sidebar/nav-main";
import { NavUser } from "@/components/shared/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useUserSessionStore } from "@/stores/user-session-store";
import { useLocation } from "@tanstack/react-router";
import {
  BriefcaseMedical,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  Home,
  Hospital,
  MessageCircle,
  Package,
  Pill,
  Settings,
  ShoppingCart,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import * as React from "react";

const ALL_NAV_ITEMS = [
  {
    title: "Dashboard",
    url: "dashboard",
    icon: Home,
    roles: ["admin", "doctor", "patient", "pharmacist"],
  },
  {
    title: "Patients",
    url: "patients",
    icon: User,
    roles: ["admin", "doctor"],
  },
  { title: "Doctors", url: "doctors", icon: Stethoscope, roles: ["admin"] },
  {
    title: "Pharmacist",
    url: "pharmacist",
    icon: BriefcaseMedical,
    roles: ["admin"],
  },
  {
    title: "Appointments",
    url: "appointments",
    icon: Calendar,
    roles: ["admin", "doctor", "patient"],
  },
  {
    title: "Prescriptions",
    url: "prescriptions",
    icon: ClipboardCheck,
    roles: ["admin", "doctor", "patient", "pharmacist"],
  },

  {
    title: "Medicines",
    url: "medicine",
    icon: Pill,
    roles: ["admin", "pharmacist", "patient", "doctor"],
  },
  {
    title: "Inventory",
    url: "inventory",
    icon: Package,
    roles: ["admin", "pharmacist"],
  },
  {
    title: "Orders",
    url: "orders",
    icon: ShoppingCart,
    roles: ["admin", "pharmacist", "patient"],
  },
  { title: "Admin", url: "admins", icon: Users, roles: ["admin"] },
  { title: "Users", url: "users", icon: Users, roles: ["admin"] },
  {
    title: "Calendar",
    url: "calendar",
    icon: Calendar,
    roles: ["admin", "patient", "doctor"],
  },
  {
    title: "Chat",
    url: "chat",
    icon: MessageCircle,
    roles: ["admin", "doctor", "patient", "pharmacist"],
  },
  {
    title: "Settings",
    url: "settings",
    icon: Settings,
    roles: ["admin", "doctor", "patient", "pharmacist"],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { getCurrentUser } = useUserSessionStore();
  const user = getCurrentUser();
  const location = useLocation();
  const userRole = user?.role.toLowerCase() || "guest";
  const navItems = React.useMemo(() => {
    return ALL_NAV_ITEMS.filter((item) => item.roles.includes(userRole)).map(
      (item) => {
        const fullUrl = `/${userRole}/${item.url}`;
        return {
          ...item,
          url: fullUrl,

          isActive: location.pathname.startsWith(fullUrl),
        };
      }
    );
  }, [userRole, location.pathname]);

  return (
    <Sidebar
      collapsible="offcanvas"
      className="bg-gradient-to-b from-green-50 to-white"
      {...props}
    >
      <SidebarHeader>
        <div className="p-4 text-center">
          <h1 className="text-xl font-bold text-green-900">
            NineHertz<span className="text-green-600">Medic</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Medical Management System
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
