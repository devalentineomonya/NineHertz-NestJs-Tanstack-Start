import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useViewTransactionStore } from "@/stores/use-view-transaction-store";

import {
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  ArrowRightLeft,
  FileText,
  Wallet,
  Link as LinkIcon,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

enum TransactionStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  REFUNDED = "refunded",
  ABANDONED = "abandoned",
}

enum Gateway {
  PAYSTACK = "paystack",
  STRIPE = "stripe",
}

const statusIcons = {
  [TransactionStatus.PENDING]: <Clock className="h-5 w-5 text-yellow-500" />,
  [TransactionStatus.SUCCESS]: (
    <CheckCircle className="h-5 w-5 text-green-500" />
  ),
  [TransactionStatus.FAILED]: <XCircle className="h-5 w-5 text-red-500" />,
  [TransactionStatus.REFUNDED]: <RefreshCw className="h-5 w-5 text-blue-500" />,
  [TransactionStatus.ABANDONED]: <XCircle className="h-5 w-5 text-red-500" />,
};

const statusColors = {
  [TransactionStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [TransactionStatus.SUCCESS]: "bg-green-100 text-green-800",
  [TransactionStatus.FAILED]: "bg-red-100 text-red-800",
  [TransactionStatus.REFUNDED]: "bg-blue-100 text-blue-800",
  [TransactionStatus.ABANDONED]: "bg-red-100 text-red-800",
};

const gatewayIcons = {
  [Gateway.STRIPE]: <CreditCard className="h-5 w-5 text-purple-600" />,
  [Gateway.PAYSTACK]: <LinkIcon className="h-5 w-5 text-blue-600" />,
};

const StatusTimeline = ({ status }: { status: TransactionStatus }) => {
  const statusFlow = [
    TransactionStatus.PENDING,
    TransactionStatus.SUCCESS,
    TransactionStatus.REFUNDED,
  ];

  const currentIndex = statusFlow.indexOf(status);

  return (
    <div className="flex justify-between items-center w-full max-w-2xl mx-auto">
      {statusFlow.map((step, index) => {
        const isActive = step === status;
        const isCompleted = currentIndex > index;
        const isFuture = currentIndex < index;

        let statusText = "";
        switch (step) {
          case TransactionStatus.PENDING:
            statusText = "Initiated";
            break;
          case TransactionStatus.SUCCESS:
            statusText = "Paid";
            break;
          case TransactionStatus.REFUNDED:
            statusText = "Refunded";
            break;
        }

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
                      : "bg-gray-200 text-gray-500"
                  }
                  ${isFuture ? "opacity-50" : ""}`}
            >
              {isCompleted ? "✓" : index + 1}
            </div>

            {/* Status text */}
            <span
              className={`mt-2 text-sm text-center ${
                isActive ? "font-bold" : "text-gray-500"
              }`}
            >
              {statusText}
            </span>

            {/* Connecting line */}
            {index < statusFlow.length - 1 && (
              <div
                className={`absolute top-5 left-1/2 w-full h-1 -z-10 ${
                  isCompleted ? "bg-green-500" : "bg-gray-200"
                } ${isFuture ? "opacity-50" : ""}`}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const ViewTransactionDrawer = () => {
  const { isOpen, onClose, transaction } = useViewTransactionStore();

  if (!transaction) return null;

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="flex-row justify-between items-center border-b mt-2 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                TXN-{transaction.id.substring(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <Badge className={`${statusColors[transaction.status]} px-3 py-1`}>
            <div className="flex items-center gap-1">
              {statusIcons[transaction.status]}
              {transaction.status.charAt(0).toUpperCase() +
                transaction.status.slice(1)}
            </div>
          </Badge>
        </DrawerHeader>

        <div className="px-6 py-4 overflow-y-auto space-y-4">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <FileText className="h-5 w-5" />
                Transaction Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Reference</p>
                <p className="font-medium break-all">{transaction.reference}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium">
                  Kes {transaction.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gateway</p>
                <div className="flex items-center gap-2">
                  {gatewayIcons[transaction.gateway]}
                  <span className="font-medium">{transaction.gateway}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gateway Fees</p>
                <p className="font-medium">
                  {transaction.gatewayFees
                    ? `Kes ${transaction.gatewayFees.toFixed(2)}`
                    : "N/A"}
                </p>
              </div>
              {transaction.description && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{transaction.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Timeline */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <ArrowRightLeft className="h-5 w-5" />
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline status={transaction.status} />
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Gateway Reference:
                </span>
                <span className="font-medium break-all">
                  {transaction.gatewayReference}
                </span>
              </div>

              {transaction.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid At:</span>
                  <span className="font-medium">
                    {format(new Date(transaction.paidAt), "dd MMM yyyy, HH:mm")}
                  </span>
                </div>
              )}

              {transaction.refundReason && (
                <div className="pt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Refund Reason:
                    </span>
                    <span className="font-medium">
                      {transaction.refundReason}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Information */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Info className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium">
                  {format(
                    new Date(transaction.createdAt),
                    "dd MMM yyyy, HH:mm"
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Updated At</p>
                <p className="font-medium">
                  {format(
                    new Date(transaction.updatedAt),
                    "dd MMM yyyy, HH:mm"
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          {transaction.metadata &&
            Object.keys(transaction.metadata).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-700">
                    <FileText className="h-5 w-5" />
                    Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(transaction.metadata).map(
                      ([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/_/g, " ")}:
                          </span>
                          <span className="font-medium text-right max-w-[200px] break-words">
                            {String(value)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        <DrawerFooter className="pb-6">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            {transaction.orderId && (
              <Button variant="secondary" className="flex-1" asChild>
                <a href={`/orders/${transaction.orderId}`}>
                  View Related Order
                </a>
              </Button>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
