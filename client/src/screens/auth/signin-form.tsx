import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignInService } from "@/services/auth/use-user-signin";
import { useUserSessionStore } from "@/stores/user-session-store";
import { useForm } from "@tanstack/react-form";
import { Link, useRouter } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { ArrowLeft, Eye, EyeOff, Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

interface SignInFormProps {
  handlePrev: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ handlePrev }) => {
  const handler = useSignInService();
  const [showPassword, setShowPassword] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const { setSession, getCurrentUser } = useUserSessionStore();
  const user = getCurrentUser();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: ({ value }) => {
        const emailResult = z.string().email().safeParse(value.email);
        const passwordResult = z.string().min(6).safeParse(value.password);

        const errors: Record<string, string> = {};

        if (!emailResult.success) {
          errors.email = emailResult.error.errors[0].message;
        }

        if (!passwordResult.success) {
          errors.password = passwordResult.error.errors[0].message;
        }

        return Object.keys(errors).length > 0 ? errors : undefined;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await handler.mutateAsync({
          email: value.email,
          password: value.password,
        });
        if (response.data.accessToken && response.data.refreshToken) {
          setSession({
            accessToken: response.data.accessToken,
            refreshToken: response.data.accessToken,
          });
          setRedirecting(true);
          await router.navigate({ to: `/${user?.role}/dashboard` });
        } else {
          toast.error("Failed to authenticate user");
        }
      } catch (error) {
        let message = "An unknown error occurred while signing in";
        if (error instanceof AxiosError && error.response?.data?.message) {
          message = error.response.data.message;
        } else if (error instanceof Error) {
          message = error.message;
        }
        toast.error(message);
      } finally {
        setRedirecting(false);
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

          {/* Password Field */}
          <form.Field name="password">
            {(field) => (
              <div>
                <div className="relative">
                  <Input
                    placeholder="Enter your password"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    type={showPassword ? "text" : "password"}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={
                      (field.state.meta.errors.length > 0
                        ? "border-red-500"
                        : "") + " pr-10"
                    }
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="text-gray-400" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
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
            disabled={handler.isPending || redirecting}
            className="w-full"
          >
            {handler.isPending ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </Button>

          <Button
            disabled={handler.isPending || redirecting}
            onClick={handlePrev}
            type="button"
            variant="outline"
            className="hover:-translate-y-0.5 transition-all duration-200 w-full border border-green-600 text-green-500 hover:bg-green-100 hover:text-green-600"
          >
            <ArrowLeft size={16} className="mr-2" />
            <span>Back</span>
          </Button>
          <div className="text-sm mt-2">
            <Link
              to="/auth/forget-password"
              className="text-green-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};
