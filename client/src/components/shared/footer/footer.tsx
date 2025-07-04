import { Link, useLocation } from "@tanstack/react-router";
import {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  MessageSquare,
  Heart,
  Stethoscope,
  ClipboardList,
  CalendarCheck,
  Pill,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function FooterSection() {
  // Navigation links
  const navLinks = [
    { name: "Features", href: "#", icon: Heart },
    { name: "Solutions", href: "#", icon: Stethoscope },
    { name: "Customers", href: "#", icon: ClipboardList },
    { name: "Pricing", href: "#", icon: CalendarCheck },
    { name: "Help", href: "#", icon: Pill },
    { name: "About", href: "#", icon: Video },
  ];

  // Social media links
  const socialLinks = [
    { name: "Twitter", href: "#", icon: Twitter, aria: "Twitter" },
    { name: "LinkedIn", href: "#", icon: Linkedin, aria: "LinkedIn" },
    { name: "Facebook", href: "#", icon: Facebook, aria: "Facebook" },
    { name: "Threads", href: "#", icon: MessageSquare, aria: "Threads" },
    { name: "Instagram", href: "#", icon: Instagram, aria: "Instagram" },
  ];

  // Footer columns
  const footerColumns = [
    {
      title: "Solutions",
      links: [
        { name: "Telemedicine", href: "#" },
        { name: "Appointment System", href: "#" },
        { name: "EHR Management", href: "#" },
        { name: "Pharmacy Solutions", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Contact", href: "#" },
        { name: "Partners", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Blog", href: "#" },
        { name: "Documentation", href: "#" },
        { name: "Support Center", href: "#" },
        { name: "API Status", href: "#" },
      ],
    },
  ];
  const location = useLocation();
  const pathname = location.pathname;
  return (
    <footer
      className={cn(
        "bg-white dark:bg-gray-950 py-16 border-t border-gray-100 dark:border-gray-800",
        pathname !== "/" && "hidden"
      )}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand column */}
          <div className="space-y-6">
            <Link to="/" aria-label="Go to homepage" className="block size-fit">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 text-white p-2 rounded-lg">
                  <Stethoscope className="size-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  MediConnect
                </span>
              </div>
            </Link>

            <p className="text-gray-600 dark:text-gray-400 max-w-xs">
              Transforming healthcare through innovative digital solutions that
              improve patient outcomes.
            </p>

            <div className="flex gap-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.aria}
                  className="text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  <link.icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer columns */}
          {footerColumns.map((column, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.href}
                      className="text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Navigation and copyright */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap justify-center gap-6">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  className="text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  <link.icon className="size-4" />
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>

            <span className="text-sm text-gray-500 dark:text-gray-500">
              &copy; {new Date().getFullYear()} MediConnect. All rights
              reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
