import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
// import { useCompleteDetailsService } from "@/services/auth/use-complete-details";
import { useForm } from "@tanstack/react-form";
import { AxiosError } from "axios";
import { ArrowLeft, Loader } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

interface SignUpUserDataFormProps {
  handlePrev: () => void;
  handleNext: () => void;
}

export const SignUpUserDataForm: React.FC<SignUpUserDataFormProps> = ({
  handlePrev,
  handleNext,
}) => {
  // const handler = useCompleteDetailsService();
  const form = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
      password: "",
    },

    validators: {
      onSubmit: async ({ value }) => {
        try {
          // const response = await handler.mutateAsync({
          //   ...value,
          // });

          // if (response.success) {
          handleNext();
          // } else {
          //   toast.error("Failed to initialize user account");
          // }
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
    },
  });

  return (
    <div className="mt-10">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          validators={{
            onChange: z.string().min(3, {
              message: "First name should be at least three characters",
            }),
          }}
          name="first_name"
        >
          {(field) => {
            console.log(field.state.meta.errors);
            return (
              <div className="w-full">
                <Input
                  placeholder="Enter your first name"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  type="text"
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={`${
                    !field.state.meta.isValid ? "border-red-500" : ""
                  }`}
                />
                {!field.state.meta.isValid && (
                  <p className="text-xs text-red-500 font-light text-start mt-0.5 ">
                    {field.state.meta.errors[0]?.message}
                  </p>
                )}
              </div>
            );
          }}
        </form.Field>
        <form.Field
          validators={{
            onChange: z.string().min(3, {
              message: "Last name should be at least three characters",
            }),
          }}
          name="last_name"
        >
          {(field) => {
            console.log(field.state.meta.errors);
            return (
              <div className="w-full">
                <Input
                  placeholder="Enter your last name"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  type="text"
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={`${
                    !field.state.meta.isValid ? "border-red-500" : ""
                  }`}
                />
                {!field.state.meta.isValid && (
                  <p className="text-xs text-red-500 font-light text-start mt-0.5 ">
                    {field.state.meta.errors[0]?.message}
                  </p>
                )}
              </div>
            );
          }}
        </form.Field>
        <form.Field
          validators={{
            onChange: z
              .string()
              .regex(/^\+\d{1,3}\d{7,14}$/, {
                message:
                  "Phone number must include a valid country code and be the correct length",
              })
              .refine(
                (value) => {
                  const digits = value.slice(value.indexOf("+") + 1);
                  return !digits.split("").every((c) => c === digits[0]);
                },
                { message: "Phone number can't have all same digits" }
              ),
          }}
          name="phone_number"
        >
          {(field) => {
            console.log(field.state.meta.errors);
            return (
              <div className="w-full">
                <PhoneInput
                  placeholder="Enter your phone number"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  type="tel"
                  onChange={(e) => field.handleChange(e)}
                  className={`${
                    !field.state.meta.isValid ? "border-red-500" : ""
                  }`}
                />
                {!field.state.meta.isValid && (
                  <p className="text-xs text-red-500 font-light text-start mt-0.5 ">
                    {field.state.meta.errors[0]?.message}
                  </p>
                )}
              </div>
            );
          }}
        </form.Field>
        <form.Field
          validators={{
            onChange: z
              .string()
              .min(8, {
                message: "Password must be at least 8 characters long",
              })
              .regex(/[A-Z]/, {
                message: "Password must contain at least one uppercase letter",
              })
              .regex(/[a-z]/, {
                message: "Password must contain at least one lowercase letter",
              })
              .regex(/[0-9]/, {
                message: "Password must contain at least one number",
              })
              .regex(/[@$!%*?&]/, {
                message: "Password must contain at least one special character",
              }),
          }}
          name="password"
        >
          {(field) => {
            console.log(field.state.meta.errors);
            return (
              <div className="w-full">
                <Input
                  placeholder="Enter your password"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  type="password"
                  autoComplete="new-password"
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={`${
                    !field.state.meta.isValid ? "border-red-500" : ""
                  }`}
                />
                {!field.state.meta.isValid && (
                  <p className="text-xs text-red-500 font-light text-start mt-0.5 ">
                    {field.state.meta.errors[0]?.message}
                  </p>
                )}
              </div>
            );
          }}
        </form.Field>

        <div className="flex flex-col items-center gap-4 mt-4">
          <Button
            variant={"primary"}
            // disabled={handler.isPending}
            type="submit"
          >
            {true ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Completing...
              </div>
            ) : (
              "Finish 🎉"
            )}
          </Button>
          <Button
            onClick={handlePrev}
            type="button"
            variant={"outline"}
            className="hover:-translate-y-0.5 transition-all duration-200 w-full border border-green-600 text-green-500 hover:bg-green-100 hover:text-green-600"
          >
            <ArrowLeft />
            <span>Back</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
