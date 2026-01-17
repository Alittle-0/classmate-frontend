"use client";

import { LogOut } from "lucide-react";
import { useNavigate, Link } from "react-router";

import { Button } from "@/components/ui/button";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";

export function NavUser() {
  const user = useAuthStore((s) => s.user);
  const { logOut } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logOut();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem className="px-2 py-2">
        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="flex items-center gap-2 flex-1 hover:opacity-80 transition-opacity"
          >
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <span className="text-sm font-semibold">
                {user.firstname?.[0]?.toUpperCase() ||
                  user.email[0].toUpperCase()}
              </span>
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {user.firstname && user.lastname ?
                  `${user.firstname} ${user.lastname}`
                : user.email}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="shrink-0"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
