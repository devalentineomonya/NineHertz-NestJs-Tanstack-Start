import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Loader } from "lucide-react";
import { toast } from "sonner";
import { useProceedToCheckoutStore } from "@/stores/use-proceed-to-checkout-store";

import { useGetMedicines } from "@/services/medicines/use-get-medicines";

enum PaymentMethod {
  PAYSTACK = "Paystack",
  STRIPE = "stripe",
}

enum CheckoutStep {
  REVIEW = "review",
  PAYMENT = "payment",
  PROCESSING = "processing",
}

export function CheckoutDrawer() {
  const { isOpen, orderData, onClose } = useProceedToCheckoutStore();
  const [step, setStep] = useState<CheckoutStep>(CheckoutStep.REVIEW);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: medicinesData } = useGetMedicines();
  const medicines = medicinesData?.data;

  // Reset state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setStep(CheckoutStep.REVIEW);
      setSelectedPayment(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  const patient = orderData?.patient || ({} as PatientResponseDto);
  const totalAmount = orderData?.totalAmount || 0;

  const getOrderItems = () => {
    if (!orderData || !medicines) return [];

    return orderData.items.map((item) => {
      const medicine = medicines.find((m) => m.id === item.medicineId);
      return {
        ...item,
        medicineName: medicine?.name || "Unknown Medicine",
        medicineType: medicine?.type || "otc",
      };
    });
  };

  const handlePaymentSelection = (method: PaymentMethod) => {
    setSelectedPayment(method);
    setStep(CheckoutStep.PROCESSING);
    processPayment(method);
  };

  const processPayment = async (method: PaymentMethod) => {
    setIsProcessing(true);

    try {
      // Simulate API call to backend
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(
        `Payment processed via ${
          method === PaymentMethod.PAYSTACK ? "Paystack" : "Stripe"
        }!`,
        {
          description: "Your order has been successfully placed",
        }
      );

      // Close after successful payment
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      toast.error("Payment failed", {
        description:
          "There was an issue processing your payment. Please try again.",
      });
      setStep(CheckoutStep.PAYMENT);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditOrder = () => {
    onClose();
    // You would typically open the edit order drawer here
    // useEditOrderStore.getState().open(orderData);
    toast.info("Redirecting to edit order...");
  };

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="border-b mt-2 pb-4">
          <DrawerTitle className="font-extrabold text-xl">
            {step === CheckoutStep.REVIEW && "Order Review"}
            {step === CheckoutStep.PAYMENT && "Select Payment Method"}
            {step === CheckoutStep.PROCESSING && "Processing Payment"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="overflow-hidden p-4 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {step === CheckoutStep.REVIEW && (
                <ReviewStep
                  patient={patient}
                  items={getOrderItems()}
                  total={totalAmount}
                />
              )}

              {step === CheckoutStep.PAYMENT && (
                <PaymentStep
                  selectedPayment={selectedPayment}
                  onSelect={setSelectedPayment}
                />
              )}

              {step === CheckoutStep.PROCESSING && (
                <ProcessingStep
                  paymentMethod={selectedPayment}
                  isProcessing={isProcessing}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <DrawerFooter className="flex  justify-between gap-3 border-t pt-4 flex-col">
          {step === CheckoutStep.REVIEW ? (
            <>
              <Button
                variant={"primary"}
                onClick={() => setStep(CheckoutStep.PAYMENT)}
              >
                Proceed to Payment
              </Button>
              <Button variant="outline" onClick={handleEditOrder}>
                Edit Order
              </Button>
            </>
          ) : step === CheckoutStep.PAYMENT ? (
            <>
              <Button
                variant={"primary"}
                disabled={!selectedPayment}
                onClick={() =>
                  selectedPayment && handlePaymentSelection(selectedPayment)
                }
              >
                Pay Now
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep(CheckoutStep.REVIEW)}
              >
                Back
              </Button>
            </>
          ) : (
            <Button disabled variant="outline">
              Processing...
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ReviewStep({
  patient,
  items,
  total,
}: {
  patient: PatientResponseDto;
  items: OrderItemResponseDto[];
  total: number;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Patient Information</h3>
        {patient ? (
          <div className="space-y-1">
            <p>
              <span className="text-muted-foreground">Name:</span>{" "}
              {patient.fullName}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              {patient.user?.email || "N/A"}
            </p>
            <p>
              <span className="text-muted-foreground">Phone:</span>{" "}
              {patient.phone || "N/A"}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">No patient selected</p>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-2">Order Items</h3>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className={`flex justify-between items-center  pb-2 ${
                items.length - 1 === index && " border-b"
              }`}
            >
              <div>
                <p className="font-medium">{item.medicine.name}</p>
                <Badge
                  variant={
                    item.medicine.type === "prescribed" ? "success" : "default"
                  }
                >
                  {item.medicine.type === "prescribed" ? "Prescription" : "OTC"}
                </Badge>
              </div>
              <div className="text-right">
                <p>
                  {item.quantity} × KES {item.pricePerUnit}
                </p>
                <p className="font-medium">
                  KES {item.quantity * item.pricePerUnit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex justify-between items-center font-bold text-lg">
        <span>Total:</span>
        <span>KES {total}</span>
      </div>
    </div>
  );
}

// Payment Step Component
function PaymentStep({
  selectedPayment,
  onSelect,
}: {
  selectedPayment: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}) {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold">Select Payment Method</h3>

      <div className="grid grid-cols-1 gap-4">
        <PaymentMethodCard
          method={PaymentMethod.PAYSTACK}
          name="Paystack"
          description="Pay via mobile money, card or bank transfer"
          iconPath="/paystack.svg"
          isSelected={selectedPayment === PaymentMethod.PAYSTACK}
          onSelect={onSelect}
        />

        <PaymentMethodCard
          method={PaymentMethod.STRIPE}
          name="Stripe"
          description="Pay with credit/debit card"
          iconPath="/stripe.svg"
          isSelected={selectedPayment === PaymentMethod.STRIPE}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}

// Payment Method Card Component
function PaymentMethodCard({
  method,
  name,
  description,
  iconPath,
  isSelected,
  onSelect,
}: {
  method: PaymentMethod;
  name: string;
  description: string;
  iconPath: string;
  isSelected: boolean;
  onSelect: (method: PaymentMethod) => void;
}) {
  return (
    <div
      className={`border border-green-100 rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? "border-green-600 ring-2 ring-green-500/20 bg-green-50"
          : "hover:border-green-400"
      }`}
      onClick={() => onSelect(method)}
    >
      <div className="flex items-center gap-4">
        <div className="bg-gray-100 border rounded-md p-2">
          <img src={iconPath} alt={name} />
        </div>
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Processing Step Component
function ProcessingStep({
  paymentMethod,
  isProcessing,
}: {
  paymentMethod: PaymentMethod | null;
  isProcessing: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      {isProcessing ? (
        <>
          <Loader className="h-12 w-12 animate-spin text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Processing{" "}
            {paymentMethod === PaymentMethod.PAYSTACK ? "Paystack" : "Stripe"}{" "}
            Payment
          </h3>
          <p className="text-muted-foreground text-center">
            Please wait while we process your payment. Do not close this window.
          </p>
        </>
      ) : (
        <>
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
          <p className="text-muted-foreground text-center">
            Your order has been placed successfully.
          </p>
        </>
      )}
    </div>
  );
}
