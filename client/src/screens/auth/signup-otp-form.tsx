import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { useVerifyWithOTP } from "@/services/auth/use-verify-with-otp";
// import { useSignUpStore } from "@/store/signup-store";
// import useUserSessionStore from "@/store/user-session-store";
import { useForm } from "@tanstack/react-form";
import { AxiosError } from "axios";
import { ArrowLeft, Loader } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

interface SignUpOTPFormProps {
  handlePrev: () => void;
  handleNext: () => void;
}

export const SignUpOTPForm: React.FC<SignUpOTPFormProps> = ({
  handlePrev,
  handleNext,
}) => {
  //   const handler = useVerifyWithOTP();
  //   const { user } = useSignUpStore();
  //   const { setSession } = useUserSessionStore();
  const form = useForm({
    defaultValues: {
      otp: "",
    },

    validators: {
      onSubmit: async ({ value }) => {
        try {
          // const response = await handler.mutateAsync({
          //   email: user.email,
          //   code: value.otp,
          // });
          // if (response.success) {
          //   setSession({
          //     accessToken: response.accessToken,
          //     refreshToken: response.refreshToken,
          //     userId: response.data.user_id as string,
          //   });
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
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          validators={{
            onChange: z
              .string()
              .regex(/^\d{6}$/, "OTP must be a 6-digit number"),
          }}
          name="otp"
        >
          {(field) => {
            console.log(field.state.meta.errors);
            return (
              <>
                <Input
                  placeholder="Enter your OTP"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  type="text"
                  onChange={(e) => {
                    const trimmedValue = e.target.value.trim();
                    if (/^\d*$/.test(trimmedValue)) {
                      field.handleChange(trimmedValue);
                    }
                  }}
                  className={`${
                    !field.state.meta.isValid ? "border-red-500" : ""
                  }`}
                />
                {!field.state.meta.isValid && (
                  <p className="text-xs text-red-500 font-light text-start mt-0.5 ">
                    {field.state.meta.errors[0]?.message}
                  </p>
                )}
              </>
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
                Submitting...
              </div>
            ) : (
              "Next"
            )}
          </Button>
          <Button
            // disabled={handler.isPending}
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
