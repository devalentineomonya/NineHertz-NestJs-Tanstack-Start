import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export function PharmacistDashboardSkeleton() {
  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-80" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prescriptions Skeleton */}
            <div className="border rounded-lg">
              <div className="p-6 flex justify-between items-center">
                <Skeleton className="h-6 w-48" />
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 grid grid-cols-5 gap-4">
                    <div className="col-span-2 flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                    <div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div>
                      <Skeleton className="h-9 w-24 ml-auto" />
                    </div>
                  </div>
                ))}
                <div className="flex justify-center space-x-4 pt-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-10 rounded-full" />
                    ))}
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            </div>

            {/* Inventory Skeleton */}
            <div className="border rounded-lg">
              <div className="p-6 flex justify-between items-center">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-9 w-36" />
              </div>
              <div className="p-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 grid grid-cols-4 gap-4">
                    <Skeleton className="h-5 w-3/4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                    <Skeleton className="h-9 w-20 ml-auto" />
                  </div>
                ))}
                <div className="flex justify-center items-center pt-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-4 w-24 mx-4" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Notifications Skeleton */}
            <div className="border rounded-lg">
              <div className="p-6 flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-9 w-32" />
              </div>
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 rounded-lg border-l-4 border-gray-300 bg-gray-50 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                ))}
                <div className="flex justify-center items-center pt-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-4 w-32 mx-4" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>

            {/* Orders Skeleton */}
            <div className="border rounded-lg">
              <div className="p-6">
                <Skeleton className="h-6 w-40" />
              </div>
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <div className="text-right space-y-2">
                        <Skeleton className="h-4 w-16 ml-auto" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-center items-center pt-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-4 w-24 mx-4" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>

            {/* Quick Actions Skeleton */}
            <div className="border rounded-lg">
              <div className="p-6">
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-md" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
