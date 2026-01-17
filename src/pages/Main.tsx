import React from "react";
import Logout from "@/components/auth/Logout";
import { useAuthStore } from "@/stores/useAuthStore";

const Main = () => {
  const user = useAuthStore((s) => s.user);

  return (
    // <div className="flex flex-col gap-4">
    //   <div className="grid auto-rows-min gap-4 md:grid-cols-3">
    //     <div className="bg-muted/50 aspect-video rounded-xl" />
    //     <div className="bg-muted/50 aspect-video rounded-xl" />
    //     <div className="bg-muted/50 aspect-video rounded-xl" />
    //   </div>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min p-4">
        <p>Welcome {user?.firstname} {user?.lastname}</p>
        <Logout />
      </div>
    // </div>
  );
};

export default Main;
