import * as React from "react";
import {
  User,
  Stethoscope,
  ClipboardList,
  Calendar,
  ClipboardCheck,
  Pill,
  Package,
  ShoppingCart,
  Settings,
  Home,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/shared/sidebar/nav-main";
import { NavUser } from "@/components/shared/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

const user = {
  name: "Dr. Jane Smith",
  email: "jane@clinic.com",
  avatar: "/avatars/doctor-avatar.jpg",
  role: "Doctor",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navItems = [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Patients",
      url: "/admin/patients",
      icon: User,
    },
    {
      title: "Doctors",
      url: "/admin/doctors",
      icon: Stethoscope,
    },
    {
      title: "Appointments",
      url: "/admin/appointments",
      icon: Calendar,
    },
    {
      title: "Consultations",
      url: "/admin/consultations",
      icon: ClipboardList,
    },
    {
      title: "Prescriptions",
      url: "/admin/prescriptions",
      icon: ClipboardCheck,
    },
    {
      title: "Medicines",
      url: "/admin/medicine",
      icon: Pill,
    },
    {
      title: "Inventory",
      url: "/admin/inventory",
      icon: Package,
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      title: "Admin",
      url: "/admin/admins",
      icon: Users,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },
  ];

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
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
