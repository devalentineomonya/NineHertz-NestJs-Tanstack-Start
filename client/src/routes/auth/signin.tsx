import { AuthLayout } from "@/screens/auth/auth-layout";
import { SignInForm } from "@/screens/auth/signin-form";
import { SignUpMode } from "@/screens/auth/signup-method-picker";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export const Route = createFileRoute("/auth/signin")({
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
    <AuthLayout title="Login to NIneHertz" description="Choose a method to login">
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
              label="Don't have an account"
              button="Signup"
              link="/auth/signup"
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
            <SignInForm handlePrev={handlePreviousStep} />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
