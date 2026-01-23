import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const ProtectedRoute = () => {
  const { accessToken, user, loading, refresh, fetchMe, pageLoading } =
    useAuthStore();
  const [starting, setStarting] = useState(true);

  const init = async () => {
    if (!accessToken) {
      await refresh();
    }
    if (accessToken && !user) {
      await fetchMe();
    }
    setStarting(false);
  };

  useEffect(() => {
    init();
  }, []);

  // Client-side validation for inactive users
  // If user is logged in but inactive, restrict them to Profile page (which uses identity-service)
  if (accessToken && user && user.isActive === false) {
    const currentPath = window.location.pathname;
    if (!currentPath.startsWith("/profile")) {
      toast.error("Reactive to use this feature")
      return <Navigate to="/profile" replace />;
    }
  }

  // if (starting || loading) {
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       Loading...
  //     </div>
  //   );
  // }

  // if (!accessToken) {
  //   return <Navigate to="/login" replace />;
  // }

  // return <Outlet></Outlet>;

  return (
    <>
      {starting || loading ?
        <div className="fixed inset-0 flex items-center justify-center bg-background/60 z-50">
          Loading...
        </div>
      : !accessToken ?
        <Navigate to="/login" replace />
      : <>
          {pageLoading && (
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-[250px] rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          )}
          <Outlet />
        </>
      }
    </>
  );
};

export default ProtectedRoute;
