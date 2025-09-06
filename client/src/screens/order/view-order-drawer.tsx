import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer";
import { useViewOrderStore } from "@/stores/use-view-order-store";
import { OrderStatus } from "./order-schema";
import {
  Package,
  FileText,
  Calendar,
  Pill,
  ShoppingCart,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

enum TransactionStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  REFUNDED = "refunded",
  ABANDONED = "abandoned",
}

const statusIcons = {
  pending: <ShoppingCart className="h-5 w-5 text-yellow-500" />,
  processing: <Package className="h-5 w-5 text-blue-500" />,
  shipped: <Truck className="h-5 w-5 text-orange-500" />,
  delivered: <CheckCircle className="h-5 w-5 text-green-500" />,
  cancelled: <XCircle className="h-5 w-5 text-red-500" />,
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const StatusTimeline = ({ status }: { status: OrderStatus }) => {
  const normalFlow = [
    OrderStatus.PENDING,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
  ];

  if (status === OrderStatus.CANCELLED) {
    return (
      <div className="flex items-center justify-center w-full">
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full ${statusColors[status]} font-bold`}
          >
            ✕
          </div>
          <span className="mt-2 text-sm font-bold text-red-600">Cancelled</span>
        </div>
      </div>
    );
  }

  const activeIndex = normalFlow.indexOf(status);

  return (
    <div className="flex justify-between items-center w-full max-w-2xl mx-auto">
      {normalFlow.map((step, index) => {
        const isActive = index === activeIndex;
        const isCompleted = index < activeIndex;

        return (
          <div
            key={step}
            className="flex flex-col items-center w-full relative"
          >
            {/* Circle */}
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300
                  ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                      ? statusColors[step]
                      : "bg-gray-300 text-gray-700"
                  }
                  hover:scale-110`}
            >
              {isCompleted ? "✓" : index + 1}
            </div>
            <span
              className={`mt-2 text-sm text-center ${
                isActive ? "font-bold text-green-600" : "text-gray-600"
              }`}
            >
              {step.charAt(0) + step.slice(1).toLowerCase()}
            </span>
            {index < normalFlow.length - 1 && (
              <div
                className={`absolute top-5 left-1/2 w-full h-1 -z-10 ${
                  isCompleted ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
};
export const ViewOrderDrawer = () => {
  const { isOpen, onClose, order } = useViewOrderStore();

  if (!order) return null;

  const firstTransaction =
    order.transactions?.length > 0 ? order.transactions[0] : null;
  const transactionStatus =
    firstTransaction?.status || TransactionStatus.PENDING;

  const shouldShowPayButton =
    !firstTransaction ||
    [
      TransactionStatus.PENDING,
      TransactionStatus.FAILED,
      TransactionStatus.ABANDONED,
    ].includes(transactionStatus);

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="flex-row justify-between items-center border-b mt-2 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>

            <p className="text-sm text-muted-foreground">ID: {order.id}</p>
          </div>
          <Badge className={`${statusColors[order.status]} px-3 py-1`}>
            <div className="flex items-center gap-1">
              {statusIcons[order.status]}
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </Badge>
        </DrawerHeader>

        <div className="px-6 py-4 overflow-y-auto space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <FileText className="h-5 w-5" />
                Order Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">{order.patient.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium">Kes {order.totalAmount}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Items Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <ShoppingCart className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded">
                        <Pill className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{item.medicine.name}</p>
                        <Badge
                          variant={
                            item.medicine.type === "otc" ? "default" : "success"
                          }
                          className="text-xs"
                        >
                          {item.medicine.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {item.quantity} × Kes {item.pricePerUnit}
                      </p>
                      <p className="text-sm font-semibold">
                        Kes {item.quantity * item.pricePerUnit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Truck className="h-5 w-5" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-2">
                <StatusTimeline status={order.status} />
              </div>
            </CardContent>
          </Card>

          {/* System Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Updated At</p>
                <p className="font-medium">
                  {new Date(order.updatedAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
