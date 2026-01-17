import React from "react";
import { useAuthStore } from "@/stores/useAuthStore";

const Dashboard = () => {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-muted-foreground">Welcome back, {user?.email}</p>
    </div>
  );
};

export default Dashboard;
