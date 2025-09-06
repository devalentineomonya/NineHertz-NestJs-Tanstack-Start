import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { navigationLinks } from "./navigationLinks";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUserSessionStore } from "@/stores/user-session-store";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { getCurrentUser } = useUserSessionStore();
  const currentUser = getCurrentUser();
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close sheet when route changes
  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 bg-transparent py-4",
        pathname !== "/" && "hidden"
      )}
    >
      {/* Green gradient background effect */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-64 w-full opacity-30 transition-opacity duration-500 pointer-events-none",
            !scrolled ? "opacity-30" : "opacity-0"
          )}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div
          className={cn(
            "w-full mx-auto rounded-xl h-16 flex items-center justify-between border p-4 backdrop-blur-sm",
            scrolled
              ? "border-green-100 bg-white/90 shadow-sm"
              : "border-green-200/50 bg-green-50/30"
          )}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">NH</span>
              </div>
              <h1 className="text-xl font-bold text-green-900 max-lg:hidden">
                NineHertz<span className="text-green-600">Medic</span>
              </h1>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-x-8">
              {navigationLinks.map((navigationLink, index) => (
                <motion.li
                  key={navigationLink.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Link
                    to={navigationLink.href}
                    className={cn(
                      "text-muted-foreground hover:text-green-600 font-medium transition-colors relative py-1 flex items-center gap-2",
                      pathname === navigationLink.href && "text-green-600"
                    )}
                  >
                    {navigationLink.label}
                    {pathname === navigationLink.href && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"
                        layoutId="nav-underline"
                      />
                    )}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-x-3">
            {/* Mobile Menu Button - Using Shadcn Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden rounded-md bg-green-50 border-green-200 hover:bg-green-100 p-4"
                >
                  <Menu className="h-5 w-5 text-green-700" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                <div className="relative h-full bg-gradient-to-b from-green-50 to-white">
                  {/* Sheet header */}
                  <div className="p-6 flex items-center justify-between border-b border-green-200">
                    <Link to="/" className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">NH</span>
                      </div>
                      <h1 className="text-xl font-bold text-green-900">
                        NineHertz<span className="text-green-600">Medic</span>
                      </h1>
                    </Link>
                  </div>

                  {/* Navigation links */}
                  <nav className="py-6 px-4">
                    <ul className="space-y-3">
                      {navigationLinks.map((item) => (
                        <motion.li
                          key={item.href}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <SheetClose asChild>
                            <Link
                              to={item.href}
                              className={cn(
                                "flex items-center gap-3 py-3 px-4 rounded-lg text-lg font-medium transition-all",
                                pathname === item.href
                                  ? "bg-green-100 text-green-700"
                                  : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                              )}
                            >
                              <span className="text-green-500">
                                {item.icon}
                              </span>
                              {item.label}
                            </Link>
                          </SheetClose>
                        </motion.li>
                      ))}
                    </ul>
                  </nav>

                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent">
                    <Button
                      asChild
                      className="w-full rounded-full text-white bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 shadow-lg hover:shadow-green-200 h-12 text-base"
                    >
                      {currentUser ? (
                        <Link
                          to={`/${
                            currentUser.role as
                              | "patient"
                              | "admin"
                              | "doctor"
                              | "pharmacist"
                          }/dashboard`}
                        >
                          <span>Dashboard</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      ) : (
                        <Link to="/auth/signin">
                          <span>Get Started</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      )}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Get Started Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="max-lg:hidden"
            >
              <Button
                asChild
                className="rounded-full text-white bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 shadow-lg hover:shadow-green-200"
              >
                {currentUser ? (
                  <Link
                    to={`/${
                      currentUser.role as
                        | "patient"
                        | "admin"
                        | "doctor"
                        | "pharmacist"
                    }/dashboard`}
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                ) : (
                  <Link to="/auth/signin">
                    <span>Get Started</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
