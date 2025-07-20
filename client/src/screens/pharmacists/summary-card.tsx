import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  percentage: string;
  trend: "up" | "down";
}

export const SummaryCard = ({
  title,
  value,
  icon,
  percentage,
  trend,
}: SummaryCardProps) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {title}
          </p>
          <h4 className="text-2xl font-bold">{value}</h4>
        </div>
        <Avatar className="bg-muted text-primary">
          <AvatarFallback>{icon}</AvatarFallback>
        </Avatar>
      </div>
      <div className="mt-2 flex items-center gap-1">
        {trend === "up" ? (
          <ArrowUpIcon className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        )}
        <p className={`text-sm ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
          {percentage}
        </p>
        <span className="text-xs text-muted-foreground">Since last month</span>
      </div>
    </CardContent>
  </Card>
);
