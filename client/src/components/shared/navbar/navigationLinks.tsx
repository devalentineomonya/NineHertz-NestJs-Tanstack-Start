import {
    Home,
    Stethoscope,
    HeartPulse,
    CalendarCheck,
    Video
  } from "lucide-react";

  export const navigationLinks = [
    {
      label: "Home",
      href: "#hero",
      icon: <Home className="w-5 h-5" />
    },
    {
      label: "Services",
      href: "#services",
      icon: <Stethoscope className="w-5 h-5" />
    },
    {
      label: "Values",
      href: "#values",
      icon: <HeartPulse className="w-5 h-5" />
    },
    {
      label: "Appointment",
      href: "#appointment",
      icon: <CalendarCheck className="w-5 h-5" />
    },
    {
      label: "Telemedicine",
      href: "#telemedicine",
      icon: <Video className="w-5 h-5" />
    },
  ];
