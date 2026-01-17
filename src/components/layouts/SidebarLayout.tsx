import React from "react";
import { AppSidebar } from "@/components/layouts/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Outlet, useLocation, Link } from "react-router";
import { useNavigationStore } from "@/stores/useNavigationStore";

// Map route paths to page titles
const pageTitles: Record<string, string> = {
  "/": "Main",
  "/dashboard": "Dashboard",
  "/courses": "Courses",
  "/profile": "Profile",
};

export default function SidebarLayout() {
  const location = useLocation();
  const { courseName, assignmentTitle, lectureTitle, viewedProfileName } =
    useNavigationStore();

  // Build breadcrumb items based on current path
  const buildBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const items: { label: string; href?: string }[] = [];

    if (pathSegments.length === 0) {
      items.push({ label: "Main" });
      return items;
    }

    // Handle different route patterns
    if (pathSegments[0] === "dashboard") {
      items.push({ label: "Dashboard" });
    } else if (pathSegments[0] === "profile") {
      // Check if viewing another user's profile (has userId in path)
      if (pathSegments.length > 1 && viewedProfileName) {
        items.push({ label: "Profile", href: "/profile" });
        items.push({ label: viewedProfileName });
      } else {
        items.push({ label: "Profile" });
      }
    } else if (pathSegments[0] === "courses") {
      items.push({ label: "Courses" });
    } else if (pathSegments[0] === "course") {
      // Always start with Courses link
      items.push({ label: "Courses", href: "/courses" });

      if (pathSegments.length >= 2 && courseName) {
        const courseSlug = pathSegments[1];

        if (pathSegments.length === 2) {
          // /course/:courseSlug - course detail page
          items.push({ label: courseName });
        } else if (pathSegments[2] === "lecture" && pathSegments.length >= 4) {
          // /course/:courseSlug/lecture/:lectureSlug
          items.push({ label: courseName, href: `/course/${courseSlug}` });
          items.push({ label: lectureTitle || "Lecture" });
        } else if (pathSegments.length >= 3) {
          // /course/:courseSlug/:assignmentSlug
          items.push({ label: courseName, href: `/course/${courseSlug}` });
          items.push({ label: assignmentTitle || "Assignment" });
        }
      }
    } else {
      items.push({ label: pageTitles[location.pathname] || "Page" });
    }

    return items;
  };

  const breadcrumbs = buildBreadcrumbs();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {item.href ?
                      <BreadcrumbLink asChild>
                        <Link to={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    : <BreadcrumbPage>{item.label}</BreadcrumbPage>}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
