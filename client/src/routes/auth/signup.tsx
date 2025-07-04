import { createFileRoute } from "@tanstack/react-router";
import { AuthLayout } from "@/screens/auth/auth-layout";
import { useState } from "react";
import { SignUpMode } from "@/screens/auth/signup-method-picker";
import { AnimatePresence, motion } from "framer-motion";
import { SignUpEmailForm } from "@/screens/auth/signup-email-form";
import { SignUpOTPForm } from "@/screens/auth/signup-otp-form";
import { SignUpUserDataForm } from "@/screens/auth/signup-user-details";

export const Route = createFileRoute("/auth/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  const [signUpStep, setSignUpStep] = useState<number>(1);
  const handleEmailClick = () => {
    handleNextStep();
  };

  const handleGoogleClick = () => {
    window.location.assign("http://localhost:3000/auth/google");
  };

  const handlePreviousStep = () => {
    setSignUpStep((prev) => prev - 1);
  };

  const handleNextStep = () => {
    setSignUpStep((prev) => prev + 1);
  };
  return (
    <AuthLayout
      title="Create your account"
      description="Create an account to start using NineHertz"
    >
      <AnimatePresence mode="wait">
        {signUpStep === 1 && (
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
        {signUpStep === 2 && (
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
        {signUpStep === 3 && (
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
        {signUpStep === 4 && (
          <motion.div
            key="step3"
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
