import {
  DollarSignIcon,
  UsersIcon,
  ListChecksIcon,
  CreditCardIcon,
} from "lucide-react";
import { SummaryCard } from "./summary-card";
import { SalesChart } from "./sales-chart";
import { LatestOrders } from "./latest-orders";

export const Dashboard = () => (
  <div className="grid grid-cols-12 gap-6">
    {/* Summary Cards */}
    <div className="col-span-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Budget"
        value="$24k"
        icon={<DollarSignIcon className="h-6 w-6" />}
        percentage="12%"
        trend="up"
      />
      <SummaryCard
        title="Total Customers"
        value="1.6k"
        icon={<UsersIcon className="h-6 w-6" />}
        percentage="16%"
        trend="down"
      />
      <SummaryCard
        title="Task Progress"
        value="75.5%"
        icon={<ListChecksIcon className="h-6 w-6" />}
        percentage=""
        trend="up"
      />
      <SummaryCard
        title="Total Profit"
        value="$15k"
        icon={<CreditCardIcon className="h-6 w-6" />}
        percentage=""
        trend="up"
      />
    </div>
    <div className="col-span-12 grid grid-cols-1 gap-6 lg:grid-cols-8">
      <SalesChart />
    </div>
    <div className="col-span-12">
      <LatestOrders />
    </div>
  </div>
);
