import { Skeleton } from "@/components/ui/skeleton";

export function DoctorDashboardSkeleton() {
  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 rounded-md" />
            <Skeleton className="h-4 w-48 rounded-md" />
          </div>
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-36 rounded-md" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Schedule Skeleton */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-48 rounded-md" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 grid grid-cols-5 gap-4">
                  <Skeleton className="h-4 col-span-1 rounded-md" />
                  <div className="col-span-3 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <Skeleton className="h-3 w-1/2 rounded-md" />
                  </div>
                  <Skeleton className="h-6 col-span-1 rounded-full" />
                </div>
              ))}
            </div>

            {/* Recent Patients Skeleton */}
            <div>
              <div className="mb-4">
                <Skeleton className="h-6 w-48 rounded-md" />
              </div>
              <div className="mb-4">
                <Skeleton className="h-9 w-60 rounded-md" />
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 grid grid-cols-4 gap-4 mb-4">
                  <Skeleton className="h-4 rounded-md" />
                  <Skeleton className="h-4 rounded-md" />
                  <Skeleton className="h-4 rounded-md" />
                  <Skeleton className="h-6 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Notifications Skeleton */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-6 w-32 rounded-md" />
                <Skeleton className="h-8 w-32 rounded-md" />
              </div>
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="p-3 rounded-lg border-l-4 border-gray-300 bg-gray-50">
                    <Skeleton className="h-4 w-3/4 rounded-md mb-2" />
                    <Skeleton className="h-3 w-full rounded-md mb-1" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                ))}
              </div>
            </div>

            {/* Medical Resources Skeleton */}
            <div>
              <div className="mb-4">
                <Skeleton className="h-6 w-48 rounded-md" />
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 border rounded-lg flex items-start">
                    <Skeleton className="h-10 w-10 rounded-lg mr-3" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 rounded-md" />
                      <Skeleton className="h-3 w-1/2 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Skeleton */}
            <div>
              <div className="mb-4">
                <Skeleton className="h-6 w-32 rounded-md" />
              </div>
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
  );
}
