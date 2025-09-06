import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ServiceCardProps {
  color: string;
  mockup: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  color,
  mockup,
  icon,
  title,
  description,
}) => {
  return (
    <Card
      className="group relative overflow-hidden min-h-fit rounded-none border-none shadow-none
      bg-transparent backdrop-blur-md transition-all duration-300 hover:shadow-none"
    >
      {/* Gradient Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.03] to-transparent" />
      </div>

      <div className="relative flex flex-col h-full">
        {/* Mockup Section */}
        <div className="relative">
          <div
            className="relative w-full aspect-[16/9] rounded-t-3xl overflow-hidden backdrop-blur-sm"
            style={{
              background: `linear-gradient(to bottom right, ${color}15, var(--card-bg))`,
            }}
          >
            {mockup}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>
          <div className="absolute -bottom-6 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Text Content Section */}
        <div className="relative -mt-2 p-6 flex flex-col flex-1">
          <CardHeader className="flex flex-row items-center gap-4 p-0 mb-4">
            <div
              className="p-2.5 rounded-md bg-foreground/[0.03] backdrop-blur-sm shadow-[0_0_0_1px_rgba(0,0,0,0.05)]
              transition-all duration-500 group-hover:bg-foreground/[0.05]
              group-hover:shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_2px_8px_-2px_rgba(0,0,0,0.2)]"
            >
              {icon}
            </div>
            <CardTitle className="text-[1.25rem] font-semibold text-foreground/90 transition-colors duration-500 group-hover:text-foreground tracking-tight">
              {title}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col justify-between flex-1 p-0">
            <p className="text-[0.9375rem] text-muted-foreground leading-relaxed transition-colors duration-500 group-hover:text-foreground/80 font-light">
              {description}
            </p>

            <div className="mt-auto pt-6">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};
