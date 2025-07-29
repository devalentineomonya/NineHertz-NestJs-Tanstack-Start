import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { useGetMedicines } from "@/services/medicines/use-get-medicines";
import { useOrderPaymentService } from "@/services/payments/use-order-payment";
import { useVerifyOrderPayment } from "@/services/payments/use-verify-order-payment";
import { useProceedToCheckoutStore } from "@/stores/use-proceed-to-checkout-store";
import Paystack from "@paystack/inline-js";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

enum CheckoutStep {
  REVIEW = "review",
  PAYMENT = "payment",
  PROCESSING = "processing",
}

enum Gateway {
  PAYSTACK = "paystack",
  STRIPE = "stripe",
}

interface InitiateOrderPaymentDto {
  gateway: Gateway;
  amount: number;
  description: string;
  customerEmail: string;
  orderId: string;
}

export function CheckoutDrawer() {
  const { isOpen, orderData, onClose } = useProceedToCheckoutStore();
  const [step, setStep] = useState<CheckoutStep>(CheckoutStep.REVIEW);
  const [selectedPayment, setSelectedPayment] = useState<Gateway | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: medicinesData } = useGetMedicines();
  const orderPaymentHandler = useOrderPaymentService();
  const verifyOrderPaymentHandler = useVerifyOrderPayment();
  const paystackPopup = new Paystack();
  const medicines = medicinesData?.data;

  // Reset state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setStep(CheckoutStep.REVIEW);
      setSelectedPayment(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!orderData) return null;

  const patient = orderData.patient || ({} as PatientResponseDto);
  const totalAmount = orderData.totalAmount || 0;

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

  const handlePaymentSelection = (method: Gateway) => {
    setSelectedPayment(method);
    setStep(CheckoutStep.PROCESSING);
    processPayment(method);
  };

  const processPayment = async (method: Gateway) => {
    setIsProcessing(true);

    try {
      const paymentData: InitiateOrderPaymentDto = {
        gateway: method,
        amount: totalAmount * 100,
        description: `Order payment for ${getOrderItems().length} items`,
        customerEmail: patient.user?.email || "",
        orderId: orderData.id,
      };

      const response = await orderPaymentHandler.mutateAsync(paymentData);

      if (response.gatewayReference) {
        // Handle Paystack popup
        paystackPopup.resumeTransaction(response.gatewayReference, {
          onSuccess: (trx) => {
            console.log("Transaction successful:", trx);
            // Verify payment with backend
            verifyOrderPaymentHandler
              .mutateAsync({
                reference: trx.reference,
                gateway: method,
              })
              .then(() => {
                toast.success("Payment processed via Paystack!", {
                  description: "Your order has been successfully placed",
                });
                setTimeout(() => onClose(), 1500);
              })
              .catch((error) => {
                console.error("Payment verification failed:", error);
                toast.error("Payment verification failed", {
                  description: "Please contact support if money was deducted.",
                });
                setStep(CheckoutStep.PAYMENT);
              })
              .finally(() => {
                setIsProcessing(false);
              });
          },
          onCancel: () => {
            console.log("User closed the popup without completing payment.");
            toast.info("Payment cancelled", {
              description: "You can try again when ready.",
            });
            setStep(CheckoutStep.PAYMENT);
            setIsProcessing(false);
          },
          onError: (error) => {
            console.error("Error resuming transaction:", error.message);
            toast.error("Payment failed", {
              description: error.message || "An error occurred during payment.",
            });
            setStep(CheckoutStep.PAYMENT);
            setIsProcessing(false);
          },
        });
      } else if (response.checkoutUrl) {
        // Handle Stripe redirect
        if (typeof window !== "undefined") {
          window.location.href = response.checkoutUrl;
        }
      } else {
        // Fallback success (for testing or other gateways)
        toast.success(
          `Payment processed via ${
            method === Gateway.PAYSTACK ? "Paystack" : "Stripe"
          }!`,
          {
            description: "Your order has been successfully placed",
          }
        );
        setTimeout(() => onClose(), 1500);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment processing failed:", error);
      toast.error("Payment failed", {
        description:
          "There was an issue processing your payment. Please try again.",
      });
      setStep(CheckoutStep.PAYMENT);
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

        <DrawerFooter className="flex justify-between gap-3 border-t pt-4 flex-col">
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
              className={`flex justify-between items-center pb-2 ${
                items.length - 1 !== index ? "border-b" : ""
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

      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg shadow-green-600/25">
        <h3 className="font-semibold mb-3 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          Payment Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>KES {total.toLocaleString("en-US")}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee:</span>
            <span>KES 0.00</span>
          </div>
          <Separator className="my-2 bg-white/30" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>KES {total.toLocaleString("en-US")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Payment Step Component
function PaymentStep({
  selectedPayment,
  onSelect,
}: {
  selectedPayment: Gateway | null;
  onSelect: (method: Gateway) => void;
}) {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold">Select Payment Method</h3>

      <div className="grid grid-cols-1 gap-4">
        <PaymentMethodCard
          method={Gateway.PAYSTACK}
          name="Paystack"
          description="Pay via mobile money, card or bank transfer"
          iconPath="/paystack.svg"
          isSelected={selectedPayment === Gateway.PAYSTACK}
          onSelect={onSelect}
        />

        <PaymentMethodCard
          method={Gateway.STRIPE}
          name="Stripe"
          description="Pay with credit/debit card"
          iconPath="/stripe.svg"
          isSelected={selectedPayment === Gateway.STRIPE}
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
  method: Gateway;
  name: string;
  description: string;
  iconPath: string;
  isSelected: boolean;
  onSelect: (method: Gateway) => void;
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
          <img src={iconPath} alt={name} className="h-8 w-auto" />
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
  paymentMethod: Gateway | null;
  isProcessing: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      {isProcessing ? (
        <>
          <Loader className="h-12 w-12 animate-spin text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Processing{" "}
            {paymentMethod === Gateway.PAYSTACK ? "Paystack" : "Stripe"} Payment
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
