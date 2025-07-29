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
  Bell,
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
  Video,
  Wallet,
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
  {
    title: "Doctors",
    url: "doctors",
    icon: Stethoscope,
    roles: ["admin", "patient"],
  },
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
    title: "Rooms",
    url: "rooms",
    icon: Video,
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
    roles: ["admin", "pharmacist", "patient"],
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
  {
    title: "Transactions",
    url: "transactions",
    icon: Wallet,
    roles: ["admin", "pharmacist", "patient"],
  },
  { title: "Admin", url: "admins", icon: Users, roles: ["admin"] },
  { title: "Users", url: "users", icon: Users, roles: ["admin"] },
  {
    title: "Calendar",
    url: "calendar",
    icon: Calendar,
    roles: ["patient", "doctor"],
  },
  {
    title: "Notification",
    url: "notification",
    icon: Bell,
    roles: ["admin", "doctor", "patient", "pharmacist"],
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
    // If user doesn't have a profile, only show settings
    if (user && !user.hasProfile) {
      const settingsItem = ALL_NAV_ITEMS.find(item => item.url === "settings");
      if (settingsItem) {
        const fullUrl = `/${userRole}/${settingsItem.url}`;
        return [{
          ...settingsItem,
          url: fullUrl,
          isActive: location.pathname.startsWith(fullUrl),
        }];
      }
      return [];
    }

    // If user has profile, show all allowed navigation items
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
  }, [userRole, location.pathname, user?.hasProfile]);

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
          {/* Show profile completion message if no profile */}
          {user && !user.hasProfile && (
            <div className="mt-2 p-2 bg-yellow-100 rounded-md">
              <p className="text-xs text-yellow-800">
                Complete your profile to access all features
              </p>
            </div>
          )}
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
