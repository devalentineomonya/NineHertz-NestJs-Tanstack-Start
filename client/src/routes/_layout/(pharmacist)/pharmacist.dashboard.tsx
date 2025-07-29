import { createFileRoute } from "@tanstack/react-router";
import { motion, Variant } from "framer-motion";
import {
  Pill,
  ShoppingCart,
  Bell,
  Filter,
  AlertCircle,
  Package,
  User,
  Plus,
  BarChart2,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetPharmacistDashboard } from "@/services/dashboard/use-get-pharmacist-dashboard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { PharmacistDashboardSkeleton } from "@/screens/pharmacists/pharmacist-dashboard-skeleton";

export const Route = createFileRoute(
  "/_layout/(pharmacist)/pharmacist/dashboard"
)({
  component: PharmacistDashboard,
});

const ITEMS_PER_PAGE = {
  prescriptions: 3,
  orders: 3,
  inventory: 4,
  notifications: 3,
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getPrescriptionStatusColor = (isFulfilled: boolean) => {
  return isFulfilled
    ? "bg-green-100 text-green-800"
    : "bg-amber-100 text-amber-800";
};

const getOrderStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getInventoryStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "in stock":
      return "bg-green-100 text-green-800";
    case "low stock":
      return "bg-amber-100 text-amber-800";
    case "critical":
    case "out of stock":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

function PharmacistDashboard() {
  const { data, isLoading, error } = useGetPharmacistDashboard();
  const [prescriptionPage, setPrescriptionPage] = useState(0);
  const [orderPage, setOrderPage] = useState(0);
  const [inventoryPage, setInventoryPage] = useState(0);
  const [notificationPage, setNotificationPage] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    } as Variant,
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    } as Variant,
  };

  if (isLoading) {
    return <PharmacistDashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen p-4 md:p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading dashboard data</p>
          <p className="text-gray-600 mt-2">
            {error?.message || "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  // Create stats array from API data
  const pharmacistStats = [
    {
      title: "Prescriptions to Fill",
      value: data.stats.prescriptionsToFill,
      icon: Pill,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "Pending Orders",
      value: data.stats.pendingOrders,
      icon: ShoppingCart,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      title: "Inventory Alerts",
      value: data.stats.inventoryAlerts,
      icon: AlertCircle,
      gradient: "from-rose-500 to-pink-600",
    },
    {
      title: "Ready for Pickup",
      value: data.stats.readyForPickup,
      icon: Package,
      gradient: "from-emerald-500 to-teal-600",
    },
  ];

  // Pagination calculations
  const prescriptionsPerPage = ITEMS_PER_PAGE.prescriptions;
  const totalPrescriptionPages = Math.ceil(
    data.prescriptions.length / prescriptionsPerPage
  );

  const ordersPerPage = ITEMS_PER_PAGE.orders;
  const totalOrderPages = Math.ceil(data.orders.length / ordersPerPage);

  const inventoryPerPage = ITEMS_PER_PAGE.inventory;
  const totalInventoryPages = Math.ceil(
    data.inventory.length / inventoryPerPage
  );

  const notificationsPerPage = ITEMS_PER_PAGE.notifications;
  const totalNotificationPages = Math.ceil(
    data.notifications.length / notificationsPerPage
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-4 md:p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Pharmacist Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome {data.pharmacist.name}! Here's your pharmacy overview
            </p>
            <p className="text-sm text-gray-500">
              License: {data.pharmacist.licenseNumber}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {data.notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center">
                  {data.notifications.filter((n) => !n.read).length}
                </span>
              )}
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
                    {data.prescriptions.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No prescriptions to process
                      </p>
                    ) : (
                      <>
                        {/* Paginated Prescriptions */}
                        {data.prescriptions
                          .slice(
                            prescriptionPage * prescriptionsPerPage,
                            (prescriptionPage + 1) * prescriptionsPerPage
                          )
                          .map((prescription) => (
                            <motion.div
                              key={prescription.id}
                              whileHover={{ y: -5 }}
                              className="border rounded-lg p-4 grid grid-cols-5 items-center hover:shadow-md transition-shadow"
                            >
                              <div className="col-span-2 flex items-center">
                                <Avatar className="h-8 w-8 mr-3">
                                  <AvatarFallback className="bg-blue-100 text-blue-800">
                                    {prescription.avatar ||
                                      getInitials(prescription.patient)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {prescription.patient}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {prescription.medication}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    By: {prescription.prescribedBy}
                                  </div>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm">
                                  {new Date(
                                    prescription.date
                                  ).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Items: {prescription.itemCount}
                                </div>
                              </div>
                              <div className="text-center">
                                <div
                                  className={`inline-flex px-3 py-1 rounded-full text-xs ${getPrescriptionStatusColor(
                                    prescription.isFulFilled
                                  )}`}
                                >
                                  {prescription.isFulFilled
                                    ? "Fulfilled"
                                    : "Pending"}
                                </div>
                              </div>
                              <div className="text-right">
                                <Button
                                  size="sm"
                                  disabled={prescription.isFulFilled}
                                >
                                  {prescription.isFulFilled
                                    ? "Completed"
                                    : "Process"}
                                </Button>
                              </div>
                            </motion.div>
                          ))}

                        {/* Pagination Controls */}
                        {totalPrescriptionPages > 1 && (
                          <div className="flex justify-center items-center mt-6 space-x-4">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                setPrescriptionPage((prev) =>
                                  Math.max(prev - 1, 0)
                                )
                              }
                              disabled={prescriptionPage === 0}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex space-x-1">
                              {Array.from({
                                length: totalPrescriptionPages,
                              }).map((_, index) => (
                                <Button
                                  key={index}
                                  variant={
                                    prescriptionPage === index
                                      ? "default"
                                      : "outline"
                                  }
                                  size="icon"
                                  onClick={() => setPrescriptionPage(index)}
                                >
                                  {index + 1}
                                </Button>
                              ))}
                            </div>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                setPrescriptionPage((prev) =>
                                  Math.min(prev + 1, totalPrescriptionPages - 1)
                                )
                              }
                              disabled={
                                prescriptionPage === totalPrescriptionPages - 1
                              }
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
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
                    {data.inventory.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No inventory items found
                      </p>
                    ) : (
                      <>
                        {/* Paginated Inventory */}
                        {data.inventory
                          .slice(
                            inventoryPage * inventoryPerPage,
                            (inventoryPage + 1) * inventoryPerPage
                          )
                          .map((item) => (
                            <motion.div
                              key={item.id}
                              whileHover={{ scale: 1.02 }}
                              className="border rounded-lg p-4 grid grid-cols-4 items-center hover:shadow-md transition-shadow"
                            >
                              <div className="font-medium">{item.name}</div>
                              <div className="text-center">
                                <div className="text-sm">
                                  Stock: {item.stock}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Threshold: {item.threshold}
                                </div>
                              </div>
                              <div className="text-center">
                                <div
                                  className={`inline-flex px-3 py-1 rounded-full text-xs ${getInventoryStatusColor(
                                    item.status
                                  )}`}
                                >
                                  {item.status}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Last:{" "}
                                  {new Date(
                                    item.lastRestocked
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <Button variant="outline" size="sm">
                                  Reorder
                                </Button>
                              </div>
                            </motion.div>
                          ))}

                        {/* Pagination Controls */}
                        {totalInventoryPages > 1 && (
                          <div className="flex justify-center items-center mt-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setInventoryPage((prev) =>
                                  Math.max(prev - 1, 0)
                                )
                              }
                              disabled={inventoryPage === 0}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="text-sm text-gray-600 mx-2">
                              Page {inventoryPage + 1} of {totalInventoryPages}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setInventoryPage((prev) =>
                                  Math.min(prev + 1, totalInventoryPages - 1)
                                )
                              }
                              disabled={
                                inventoryPage === totalInventoryPages - 1
                              }
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
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
                    {data.notifications.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No notifications
                      </p>
                    ) : (
                      <>
                        {/* Paginated Notifications */}
                        {data.notifications
                          .slice(
                            notificationPage * notificationsPerPage,
                            (notificationPage + 1) * notificationsPerPage
                          )
                          .map((notification) => (
                            <motion.div
                              key={notification.id}
                              whileHover={{ x: 5 }}
                              className={`p-3 rounded-lg border-l-4 ${
                                notification.read
                                  ? "border-gray-300 bg-gray-50"
                                  : "border-blue-500 bg-blue-50"
                              }`}
                            >
                              <div className="font-medium">
                                {notification.title}
                              </div>
                              <p className="text-sm text-gray-600">
                                {notification.description}
                              </p>
                              <div className="text-xs text-gray-500 mt-1">
                                {notification.time}
                              </div>
                            </motion.div>
                          ))}

                        {/* Pagination Controls */}
                        {totalNotificationPages > 1 && (
                          <div className="flex justify-center items-center mt-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setNotificationPage((prev) =>
                                  Math.max(prev - 1, 0)
                                )
                              }
                              disabled={notificationPage === 0}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="text-sm text-gray-600 mx-2">
                              Page {notificationPage + 1} of{" "}
                              {totalNotificationPages}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setNotificationPage((prev) =>
                                  Math.min(prev + 1, totalNotificationPages - 1)
                                )
                              }
                              disabled={
                                notificationPage === totalNotificationPages - 1
                              }
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
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
                    {data.orders.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No recent orders
                      </p>
                    ) : (
                      <>
                        {/* Paginated Orders */}
                        {data.orders
                          .slice(
                            orderPage * ordersPerPage,
                            (orderPage + 1) * ordersPerPage
                          )
                          .map((order) => (
                            <motion.div
                              key={order.id}
                              whileHover={{ scale: 1.03 }}
                              className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">
                                    {order.patient}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {order.items} items
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(
                                      order.orderDate
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-right font-medium">
                                    ${order.total.toFixed(2)}
                                  </div>
                                  <div
                                    className={`inline-flex px-2 py-1 rounded-full text-xs ${getOrderStatusColor(
                                      order.status
                                    )}`}
                                  >
                                    {order.status}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}

                        {/* Pagination Controls */}
                        {totalOrderPages > 1 && (
                          <div className="flex justify-center items-center mt-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setOrderPage((prev) => Math.max(prev - 1, 0))
                              }
                              disabled={orderPage === 0}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="text-sm text-gray-600 mx-2">
                              Page {orderPage + 1} of {totalOrderPages}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setOrderPage((prev) =>
                                  Math.min(prev + 1, totalOrderPages - 1)
                                )
                              }
                              disabled={orderPage === totalOrderPages - 1}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
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
function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  className = "",
}: {
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
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
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
