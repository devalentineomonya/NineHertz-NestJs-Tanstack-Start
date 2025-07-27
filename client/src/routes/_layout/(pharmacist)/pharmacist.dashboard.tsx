import { createFileRoute } from "@tanstack/react-router";
import { motion,Variant } from "framer-motion";
import {
  Pill,
  ShoppingCart,
  Clock,
  FileText,
  Bell,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Package,
  User,
  MessageSquare,
  Activity,
  Plus,
  BarChart2,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useCarousel } from "@/hooks/use-carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

export const Route = createFileRoute(
  "/_layout/(pharmacist)/pharmacist/dashboard"
)({
  component: PharmacistDashboard,
});

function PharmacistDashboard() {
  const { currentIndex, next, prev, setIndex } = useCarousel(4);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    } as Variant
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    } as Variant
  };

  // Mock data for pharmacist dashboard
  const pharmacistStats = [
    { title: "Prescriptions to Fill", value: 12, icon: Pill, gradient: "from-blue-500 to-indigo-600" },
    { title: "Pending Orders", value: 4, icon: ShoppingCart, gradient: "from-amber-500 to-orange-500" },
    { title: "Inventory Alerts", value: 3, icon: AlertCircle, gradient: "from-rose-500 to-pink-600" },
    { title: "Ready for Pickup", value: 8, icon: Package, gradient: "from-emerald-500 to-teal-600" },
  ];

  const prescriptions = [
    {
      id: 1,
      patient: "John Smith",
      medication: "Lisinopril 10mg",
      status: "Pending",
      date: "2023-10-15",
      refills: 2,
      avatar: "JS"
    },
    {
      id: 2,
      patient: "Emily Johnson",
      medication: "Atorvastatin 20mg",
      status: "Processing",
      date: "2023-10-16",
      refills: 1,
      avatar: "EJ"
    },
    {
      id: 3,
      patient: "Michael Brown",
      medication: "Metformin 500mg",
      status: "Ready",
      date: "2023-10-14",
      refills: 3,
      avatar: "MB"
    },
  ];

  const inventory = [
    { id: 1, name: "Lisinopril 10mg", stock: 12, threshold: 10, status: "Low Stock" },
    { id: 2, name: "Atorvastatin 20mg", stock: 25, threshold: 15, status: "In Stock" },
    { id: 3, name: "Metformin 500mg", stock: 8, threshold: 10, status: "Critical" },
    { id: 4, name: "Amoxicillin 500mg", stock: 42, threshold: 20, status: "In Stock" },
  ];

  const orders = [
    { id: 1, patient: "Sarah Davis", items: 3, total: 42.75, status: "Pending" },
    { id: 2, patient: "Robert Wilson", items: 5, total: 68.50, status: "Processing" },
    { id: 3, patient: "Lisa Miller", items: 2, total: 24.99, status: "Ready" },
  ];

  const notifications = [
    { id: 1, title: "New Prescription", description: "Dr. Holland prescribed Metformin for John Smith", time: "15 min ago", read: false },
    { id: 2, title: "Order Ready", description: "Order #PH-2023-0987 is ready for pickup", time: "1 hour ago", read: true },
    { id: 3, title: "Low Stock", description: "Metformin 500mg is running low (8 remaining)", time: "3 hours ago", read: false },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-4 md:p-6 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pharmacist Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your pharmacy overview</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center">
                3
              </span>
            </Button>
            <Button>
              <ClipboardList className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards Carousel */}
        <motion.div variants={itemVariants} className="relative">
          <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar md:hidden">
            {pharmacistStats.map((stat, idx) => (
              <StatCard key={idx} {...stat} className="min-w-[300px]" />
            ))}
          </div>

          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pharmacistStats.map((stat, idx) => (
              <StatCard key={idx} {...stat} />
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prescriptions */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Prescriptions to Process</span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prescriptions.map(pres => (
                      <motion.div
                        key={pres.id}
                        whileHover={{ y: -5 }}
                        className="border rounded-lg p-4 grid grid-cols-5 items-center hover:shadow-md transition-shadow"
                      >
                        <div className="col-span-2 flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarFallback className="bg-blue-100 text-blue-800">
                              {pres.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{pres.patient}</div>
                            <div className="text-sm text-gray-600">{pres.medication}</div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm">{pres.date}</div>
                          <div className="text-xs text-gray-500">Refills: {pres.refills}</div>
                        </div>
                        <div className="text-center">
                          <div className={`inline-flex px-3 py-1 rounded-full text-xs ${
                            pres.status === "Pending"
                              ? "bg-amber-100 text-amber-800"
                              : pres.status === "Processing"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                            {pres.status}
                          </div>
                        </div>
                        <div className="text-right">
                          <Button size="sm">Process</Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Inventory Alerts */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Inventory Status</span>
                    <Button variant="ghost" size="sm">
                      Manage Inventory
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inventory.map(item => (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        className="border rounded-lg p-4 grid grid-cols-4 items-center hover:shadow-md transition-shadow"
                      >
                        <div className="font-medium">{item.name}</div>
                        <div className="text-center">
                          <div className="text-sm">Stock: {item.stock}</div>
                          <div className="text-xs text-gray-500">Threshold: {item.threshold}</div>
                        </div>
                        <div className="text-center">
                          <div className={`inline-flex px-3 py-1 rounded-full text-xs ${
                            item.status === "In Stock"
                              ? "bg-green-100 text-green-800"
                              : item.status === "Low Stock"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {item.status}
                          </div>
                        </div>
                        <div className="text-right">
                          <Button variant="outline" size="sm">Reorder</Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Notifications */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    Notifications
                    <Button variant="ghost" size="sm">
                      Mark all as read
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.map(notif => (
                      <motion.div
                        key={notif.id}
                        whileHover={{ x: 5 }}
                        className={`p-3 rounded-lg border-l-4 ${
                          notif.read
                            ? "border-gray-300 bg-gray-50"
                            : "border-blue-500 bg-blue-50"
                        }`}
                      >
                        <div className="font-medium">{notif.title}</div>
                        <p className="text-sm text-gray-600">{notif.description}</p>
                        <div className="text-xs text-gray-500 mt-1">{notif.time}</div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Orders */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.map(order => (
                      <motion.div
                        key={order.id}
                        whileHover={{ scale: 1.03 }}
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{order.patient}</div>
                            <div className="text-sm text-gray-600">{order.items} items</div>
                          </div>
                          <div>
                            <div className="text-right font-medium">${order.total.toFixed(2)}</div>
                            <div className={`text-right text-xs ${
                              order.status === "Pending"
                                ? "text-amber-600"
                                : order.status === "Processing"
                                ? "text-blue-600"
                                : "text-green-600"
                            }`}>
                              {order.status}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="flex-col h-24">
                      <Pill className="h-6 w-6 mb-2" />
                      <span>New Prescription</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-24">
                      <ShoppingCart className="h-6 w-6 mb-2" />
                      <span>Create Order</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-24">
                      <User className="h-6 w-6 mb-2" />
                      <span>Patient Lookup</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-24">
                      <BarChart2 className="h-6 w-6 mb-2" />
                      <span>Sales Report</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, gradient, className = "" }: {
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  gradient: string;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -5,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      className={`bg-gradient-to-br ${gradient} rounded-xl p-5 text-white ${className}`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-white/90">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}

// Carousel Hook
function useCarousel(totalItems: number) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex(prev => (prev + 1) % totalItems);
  };

  const prev = () => {
    setCurrentIndex(prev => (prev - 1 + totalItems) % totalItems);
  };

  const setIndex = (index: number) => {
    if (index >= 0 && index < totalItems) {
      setCurrentIndex(index);
    }
  };

  return { currentIndex, next, prev, setIndex };
}
