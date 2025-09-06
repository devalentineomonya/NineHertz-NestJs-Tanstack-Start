import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

export function StatsCards() {
  const stats = [
    {
      title: "Weekly sales",
      value: "714k",
      change: "+2.6%",
      trend: "up",
      icon: "/assets/icons/glass/ic-glass-bag.svg",
      color: "text-blue-600"
    },
    {
      title: "New users",
      value: "1.35m",
      change: "-0.1%",
      trend: "down",
      icon: "/assets/icons/glass/ic-glass-users.svg",
      color: "text-purple-600"
    },
    {
      title: "Purchase orders",
      value: "1.72m",
      change: "+2.8%",
      trend: "up",
      icon: "/assets/icons/glass/ic-glass-buy.svg",
      color: "text-amber-600"
    },
    {
      title: "Messages",
      value: "234",
      change: "+3.6%",
      trend: "up",
      icon: "/assets/icons/glass/ic-glass-message.svg",
      color: "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="shadow-none">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <div className="p-2 rounded-lg bg-muted">
              <img
                src={stat.icon}
                alt={stat.title}
                className="w-6 h-6"
              />
            </div>
            <div className={`flex items-center ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
              {stat.trend === "up" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              <span className="text-sm font-medium ml-1">{stat.change}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className="w-20 h-12 relative">
                {/* Chart placeholder - replace with actual chart component */}
                <div className="absolute bottom-0 w-full">
                  <div className="h-0.5 w-full bg-gray-200 rounded-full"></div>
                  <div className={`h-0.5 ${stat.color} rounded-full`} style={{ width: "70%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
