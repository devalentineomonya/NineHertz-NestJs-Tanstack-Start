import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUserSessionStore } from "@/stores/user-session-store";

interface PermissionCardProps {
  title: string;
  iconUrl?: string;
}

const Alert = ({ title, iconUrl }: PermissionCardProps) => {
  const { getCurrentUser } = useUserSessionStore();
  const currentUser = getCurrentUser();
  return (
    <section className="flex justify-center items-center h-screen w-full">
      <Card className="w-full max-w-[520px] border-none p-6 py-9 Get">
        <CardContent>
          <div className="flex flex-col gap-9">
            <div className="flex flex-col gap-3.5">
              {iconUrl && (
                <div className="flex-center">
                  <img src={iconUrl} width={72} height={72} alt="icon" />
                </div>
              )}
              <p className="text-center text-xl font-semibold">{title}</p>
            </div>

            <Button asChild variant={"primary"}>
              <Link
                to={`/${
                  currentUser?.role as
                    | "patient"
                    | "admin"
                    | "doctor"
                    | "pharmacist"
                }/dashboard`}
              >
                Continue to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default Alert;
