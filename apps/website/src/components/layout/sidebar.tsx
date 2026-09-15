import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreditCard, Home, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavigationItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string | number;
}

const navigationItems: NavigationItem[] = [
  {
    name: "Tableau de bord",
    icon: Home,
    href: "/app",
  },
  {
    name: "Abonnement",
    icon: CreditCard,
    href: "/app/polar/subscriptions",
  },
];

interface SidebarProps {
  className?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ className, mobileOpen = false, onMobileClose }: SidebarProps) {
  const currentPath = typeof window === "undefined" ? "/app" : window.location.pathname;
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:flex lg:flex-col lg:border-r lg:border-border lg:bg-background",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          "transition-all duration-300 ease-in-out",
          className
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          {!isCollapsed && (
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Tableau de bord
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = currentPath === item.href ||
                (item.href !== "/app" && currentPath.startsWith(item.href));
              
              return (
                <Button
                  asChild
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    isCollapsed && "px-2 justify-center",
                    isActive && "bg-primary text-primary-foreground shadow-sm",
                    !isActive && "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <a href={item.href}>
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </a>
                </Button>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="border-t border-border p-4">
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 bg-muted/50",
              isCollapsed && "justify-center"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              U
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium text-foreground">Utilisateur</span>
                <span className="text-xs text-muted-foreground truncate">
                  user@example.com
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/50" aria-label="Fermer le menu" onClick={onMobileClose} />
          <div className="relative h-full w-72 border-r border-border bg-background p-4 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-semibold">Astro Kit Convex</span>
              <Button variant="ghost" size="icon" onClick={onMobileClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Button key={item.href} asChild variant={currentPath === item.href ? "default" : "ghost"} className="w-full justify-start">
                  <a href={item.href} onClick={onMobileClose}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </a>
                </Button>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
