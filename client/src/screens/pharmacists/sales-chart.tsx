import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const SalesChart = () => (
  <Card className="col-span-8">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Sales</CardTitle>
      <Button variant="ghost" size="sm">
        <RefreshCwIcon className="mr-2 h-4 w-4" />
        Sync
      </Button>
    </CardHeader>
    <CardContent>
      <div className="h-[350px]">
        {/* Chart implementation would go here */}
        <div className="flex h-full items-center justify-center bg-muted">
          Sales Chart Placeholder
        </div>
      </div>
    </CardContent>
  </Card>
);
