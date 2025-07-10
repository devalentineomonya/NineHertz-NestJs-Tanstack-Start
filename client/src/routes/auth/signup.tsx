import { AuthLayout } from "@/screens/auth/auth-layout";
import { SignUpEmailForm } from "@/screens/auth/signup-email-form";
import { SignUpMode } from "@/screens/auth/signup-method-picker";
import { SignUpUserDataForm } from "@/screens/auth/signup-user-details";
import { SignUpOTPForm } from "@/services/signup-otp-form";
import { useSignUpStore } from "@/services/users/stores/use-signup-store";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export const Route = createFileRoute("/auth/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  const { step, setStep, setMethod, reset } = useSignUpStore();

  useEffect(() => {
    return () => reset();
  }, []);

  const handleEmailClick = () => {
    setMethod("email");
    setStep(2);
  };

  const handleGoogleClick = () => {
    setMethod("google");

    setStep(4);
    window.location.assign(`${import.meta.env.VITE_API_BASE_URL}/auth/google`);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Create an account to start using NineHertz"
    >
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <SignUpMode
              handleEmailClick={handleEmailClick}
              handleGoogleClick={handleGoogleClick}
            />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <SignUpEmailForm
              handleNext={handleNextStep}
              handlePrev={handlePreviousStep}
            />
          </motion.div>
        )}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <SignUpOTPForm
              handleNext={handleNextStep}
              handlePrev={handlePreviousStep}
            />
          </motion.div>
        )}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <SignUpUserDataForm
              handleNext={handleNextStep}
              handlePrev={handlePreviousStep}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
