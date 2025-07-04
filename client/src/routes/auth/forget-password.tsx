import { ResetPasswordForm } from "@/screens/auth/auth-forget-password";
import { AuthLayout } from "@/screens/auth/auth-layout";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";

export const Route = createFileRoute("/auth/forget-password")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthLayout
      title="Reset Your Password"
      description="Enter your email to receive reset instructions"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key="step1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          <ResetPasswordForm />;
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  );
}
