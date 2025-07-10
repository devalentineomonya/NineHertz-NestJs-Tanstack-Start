import { Skeleton } from "@/components/ui/skeleton";

export const AuthLayoutSkeleton = () => {
  return (
    <section className="flex justify-center items-center h-screen">
      <div className="max-w-xs mx-auto size-full flex flex-col items-center justify-center">
        <div className="flex flex-col text-center w-full">
          <div className="flex justify-center">
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>

          <div className="mt-4 space-y-2">
            <Skeleton className="h-6 w-40 mx-auto" />
            <Skeleton className="h-4 w-56 mx-auto" />
          </div>

          <div className="mt-10 w-full">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}

              <div className="flex flex-col items-center gap-4 mt-4">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
