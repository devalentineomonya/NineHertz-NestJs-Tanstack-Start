import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignupService } from "@/services/auth/use-user-signup";
import { useSignUpStore } from "@/stores/use-signup-store";
import { useForm } from "@tanstack/react-form";
import { AxiosError } from "axios";
import { ArrowLeft, Loader } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

interface SignUpEmailFormProps {
  handlePrev: () => void;
  handleNext: () => void;
}

export const SignUpEmailForm: React.FC<SignUpEmailFormProps> = ({
  handlePrev,
  handleNext,
}) => {
  const handler = useSignupService();
  const { setUser } = useSignUpStore();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: ({ value }) => {
        const result = z.string().email().safeParse(value.email);
        return result.success ? undefined : result.error.errors[0].message;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await handler.mutateAsync({
          email: value.email,
        });
        if (response.data.id) {
          setUser({ email: value.email, id: response.data.id });
          handleNext();
        } else {
          toast.error("Failed to initialize user account");
        }
      } catch (error) {
        let message = "An unknown error occurred while initializing user";
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
        <div className="flex flex-col items-center gap-4 mt-4">
          <Button variant="primary" type="submit" disabled={handler.isPending}>
            {handler.isPending ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Processing...
              </div>
            ) : (
              "Submit"
            )}
          </Button>

          <Button
            disabled={handler.isPending}
            onClick={handlePrev}
            type="button"
            variant="outline"
            className="hover:-translate-y-0.5 transition-all duration-200 w-full border border-green-600 text-green-500 hover:bg-green-100 hover:text-green-600"
          >
            <ArrowLeft size={16} className="mr-2" />
            <span>Back</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
