import { Mail } from "lucide-react";
import { Google } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import type React from "react";

interface SignUpModeProps {
  handleEmailClick: () => void;
  handleGoogleClick: () => void;
  label?: string;
  button?: string;
  link?: string;
}

export const SignUpMode: React.FC<SignUpModeProps> = ({
  handleEmailClick,
  handleGoogleClick,
  label = "Already have an account",
  button = "Signin",
  link = "/auth/signin",
}) => {
  return (
    <div
      className="flex flex-col gap-4 py-8"
      style={{ opacity: 1, willChange: "auto", transform: "none" }}
    >
      <div className="w-full">
        <Button
          variant={"secondary"}
          className="w-full"
          onClick={handleGoogleClick}
        >
          <Google />
          Continue with Google
        </Button>
      </div>

      <div className="w-full">
        <Button
          variant={"secondary"}
          className="w-full"
          onClick={handleEmailClick}
        >
          <Mail />
          Continue with email
        </Button>
      </div>

      <div className="pt-12 text-muted-foreground text-sm flex items-center gap-4 justify-center">
        <span>{label}</span>
        <Link className="text-foreground hover:underline" to={link}>
          {button}
        </Link>
      </div>
    </div>
  );
};
