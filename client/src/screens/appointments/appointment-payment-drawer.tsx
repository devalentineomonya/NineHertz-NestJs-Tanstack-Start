import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { useAppointmentPaymentService } from "@/services/payments/use-pay-appointment";
import { useVerifyAppointmentPayment } from "@/services/payments/use-verify-appointment-payment";
import { useAppointmentPaymentStore } from "@/stores/use-appointment-payment-store";
import Paystack from "@paystack/inline-js";
import { format } from "date-fns";
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

export function AppointmentPaymentDrawer() {
  const { isOpen, appointment, close: onClose } = useAppointmentPaymentStore();
  const [step, setStep] = useState<CheckoutStep>(CheckoutStep.REVIEW);
  const [selectedPayment, setSelectedPayment] = useState<Gateway | null>(null);
  const appointmentPaymentHandler = useAppointmentPaymentService();
  const verifyAppointmentPaymentHandler = useVerifyAppointmentPayment();
  const [isProcessing, setIsProcessing] = useState(false);
  const paystackPopup = new Paystack();

  // Reset state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setStep(CheckoutStep.REVIEW);
      setSelectedPayment(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!appointment) return null;

  const fee =
    parseFloat(appointment.doctor.appointmentFee as unknown as string) || 0;
  const appointmentTime = new Date(appointment.datetime);

  const handlePaymentSelection = (method: Gateway) => {
    setSelectedPayment(method);
    setStep(CheckoutStep.PROCESSING);
    processPayment(method);
  };

  const processPayment = async (method: Gateway) => {
    setIsProcessing(true);

    try {
      const paymentData: InitiatePaymentDto = {
        gateway: method,
        amount: fee * 100,
        description: `Appointment with Dr. ${appointment.doctor.fullName}`,
        customerEmail: appointment.patient.user.email,
        appointmentId: appointment.id,
      };

      const response = await appointmentPaymentHandler.mutateAsync(paymentData);
      if (response.gatewayReference) {
        const res = paystackPopup.resumeTransaction(response.gatewayReference, {
          onSuccess: (trx) => {
            console.log("Transaction successful:", trx);
            setStep(CheckoutStep.PROCESSING);
            verifyAppointmentPaymentHandler.mutateAsync({
              reference: trx.reference,
              gateway: method,
            });
          },
          onCancel: () => {
            console.log("User closed the popup without completing payment.");
          },
          onError: (error) => {
            console.error("Error resuming transaction:", error.message);
          },
        });

        console.log(res.getStatus().response);
      } else if (response.checkoutUrl) {
        if (typeof window === "undefined") return;
        window.location.href = response.checkoutUrl;
      }
      toast.success(
        `Payment processed via ${
          method === Gateway.PAYSTACK ? "Paystack" : "Stripe"
        }!`,
        {
          description: "Your appointment has been confirmed",
        }
      );

      // Close after successful payment
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.log(error);
      toast.error("Payment failed", {
        description:
          "There was an issue processing your payment. Please try again.",
      });
      setStep(CheckoutStep.PAYMENT);
      setIsProcessing(false);
    }
  };

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="right-2 top-2 bottom-2 fixed flex data-[vaul-drawer-direction=right]:sm:max-w-lg bg-gradient-to-b from-white to-gray-50">
        <DrawerHeader className="border-b mt-2 pb-4">
          <DrawerTitle className="font-extrabold text-xl">
            {step === CheckoutStep.REVIEW && "Appointment Payment"}
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
                  appointment={appointment}
                  fee={fee}
                  appointmentTime={appointmentTime}
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
                  gateway={selectedPayment}
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
              <Button variant="outline" onClick={onClose}>
                Cancel
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
  appointment,
  fee,
  appointmentTime,
}: {
  appointment: AppointmentResponseDto;
  fee: number;
  appointmentTime: Date;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-4">Appointment Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Doctor:</span>
            <span className="font-medium">
              Dr. {appointment.doctor.fullName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Specialty:</span>
            <span className="font-medium">{appointment.doctor.specialty}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date & Time:</span>
            <span className="font-medium">
              {format(appointmentTime, "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mode:</span>
            <span className="font-medium capitalize">{appointment.mode}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Patient:</span>
            <span className="font-medium">{appointment.patient.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">
              {appointment.patient.user?.email}
            </span>
          </div>
        </div>
      </div>

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
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          Payment Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Consultation Fee:</span>
            <span>KES {fee.toLocaleString("en-US")}</span>
          </div>
          <div className="flex justify-between">
            <span>Platform Fee:</span>
            <span>KES 0.00</span>
          </div>
          <Separator className="my-2 bg-white/30" />
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>KES {fee.toLocaleString("en-US")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Payment Step Component (same as before)
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
        <GatewayCard
          method={Gateway.PAYSTACK}
          name="Paystack"
          description="Pay via mobile money, card or bank transfer"
          iconPath="/paystack.svg"
          isSelected={selectedPayment === Gateway.PAYSTACK}
          onSelect={onSelect}
        />

        <GatewayCard
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

// Payment Method Card Component (same as before)
function GatewayCard({
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

// Processing Step Component (same as before)
function ProcessingStep({
  gateway,
  isProcessing,
}: {
  gateway: Gateway | null;
  isProcessing: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      {isProcessing ? (
        <>
          <Loader className="h-12 w-12 animate-spin text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Processing {gateway === Gateway.PAYSTACK ? "Paystack" : "Stripe"}
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
            Your appointment has been confirmed.
          </p>
        </>
      )}
    </div>
  );
}
