import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { useResetPasswordService } from "@/services/auth/use-reset-password";
import { useForm } from "@tanstack/react-form";
import { Link, useRouter } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { ArrowLeft, Loader } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

export const ResetPasswordForm = () => {
  // const handler = useResetPasswordService();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: ({ value }) => {
        const emailResult = z.string().email().safeParse(value.email);

        const errors: Record<string, string> = {};

        if (!emailResult.success) {
          errors.email = emailResult.error.errors[0].message;
        }

        return Object.keys(errors).length > 0 ? errors : undefined;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        // const response = await handler.mutateAsync({
        //   email: value.email,
        // });
        // if (response.success) {
        //   toast.success("Password reset instructions sent to your email");
        //   router.navigate({ to: "/auth/signin" });
        // } else {
        //   toast.error("Failed to send password reset instructions");
        // }
      } catch (error) {
        let message = "An unknown error occurred while resetting password";
        if (error instanceof AxiosError && error.response?.data?.message) {
          message = error.response.data.message;
        } else if (error instanceof Error) {
          message = error.message;
        }
        toast.error(message);
      }
    },
  });

  return (
    <div className="mt-10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div className="space-y-4">
          {/* Email Field */}
          <form.Field name="email">
            {(field) => (
              <div>
                <Input
                  placeholder="Enter your email address"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  type="email"
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={
                    field.state.meta.errors.length > 0 ? "border-red-500" : ""
                  }
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-500 font-light text-start mt-0.5">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        <div className="flex flex-col items-center gap-4 mt-6">
          <Button
            variant="primary"
            type="submit"
            // disabled={handler.isPending}
            className="w-full"
          >
            {false ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Sending instructions...
              </div>
            ) : (
              "Reset Password"
            )}
          </Button>
          <Link className="w-full" to="/auth/signin">
            <Button
              // disabled={handler.isPending}
              type="button"
              variant="outline"
              className="hover:-translate-y-0.5 transition-all duration-200 w-full border border-green-600 text-green-500 hover:bg-green-100 hover:text-green-600"
            >
              <ArrowLeft size={16} className="mr-2" />
              <span>Back to Login</span>
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
};
