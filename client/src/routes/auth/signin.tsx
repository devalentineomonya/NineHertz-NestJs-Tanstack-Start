import { AuthLayout } from "@/screens/auth/auth-layout";
import { SignInForm } from "@/screens/auth/signin-form";
import { SignUpMode } from "@/screens/auth/signup-method-picker";
import { useSignUpStore } from "@/stores/use-signup-store";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export const Route = createFileRoute("/auth/signin")({
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
    window.location.assign(`${import.meta.env.VITE_API_BASE_URL}/auth/google`);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  return (
    <AuthLayout
      title="Login to NineHertz"
      description="Choose a method to login"
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
              label="Don't have an account"
              button="Signup"
              link="/auth/signup"
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
            <SignInForm handlePrev={handlePreviousStep} />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
