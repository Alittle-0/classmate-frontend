import * as React from "react";
import { Home, LayoutDashboard, BookOpen, User } from "lucide-react";

import { NavSimple } from "@/components/layouts/nav-simple";
import { NavUser } from "@/components/layouts/nav-user";
import {
  Sidebar,
  SidebarFooter,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// Menu data - static items
const staticNavItems = [
  {
    title: "Main",
    url: "/",
    icon: Home,
  },
  {
    title: "Courses",
    url: "/courses",
    icon: BookOpen,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Build nav items with static profile URL
  const navItems = [
    ...staticNavItems,
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
  ];

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">ClassMate</span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSimple items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
