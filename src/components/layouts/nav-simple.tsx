"use client";

import { type LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavSimple({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const location = useLocation();

  const isItemActive = (itemUrl: string, itemTitle: string) => {
    // For Profile, check if path starts with /profile
    if (itemTitle === "Profile") {
      return location.pathname.startsWith("/profile");
    }
    return location.pathname === itemUrl;
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = isItemActive(item.url, item.title);
          const Icon = item.icon;

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive}>
                <Link
                  to={item.url}
                  className="!text-foreground hover:!text-foreground"
                >
                  {Icon && <Icon className="!text-foreground" />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
