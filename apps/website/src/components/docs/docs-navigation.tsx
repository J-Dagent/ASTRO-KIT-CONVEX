import {
  BookOpen,
  Boxes,
  Cloud,
  CreditCard,
  KeyRound,
  Rocket,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const documentationPages = [
  { name: "getting-started", label: "Getting started", description: "Install the workspace and run both local processes.", icon: BookOpen },
  { name: "convex", label: "Convex", description: "Schema, functions, indexes, realtime, and scheduling.", icon: Boxes },
  { name: "authentication", label: "Authentication", description: "Better Auth, Google OAuth, sessions, and authorization.", icon: KeyRound },
  { name: "polar", label: "Polar", description: "Products, checkout, webhooks, and subscriptions.", icon: CreditCard },
  { name: "environments", label: "Environments", description: "Local values, cloud variables, and secrets.", icon: Settings2 },
  { name: "cloudflare", label: "Cloudflare", description: "Worker configuration and production builds.", icon: Cloud },
  { name: "deployment", label: "Deployment", description: "Provider-neutral Convex and Cloudflare releases.", icon: Rocket },
] as const;

export function DocsNavigation({ current }: { current?: string }) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
        <img src="/logo192.png" alt="Astro Kit Convex" className="h-9 w-9 rounded-md" />
        <div>
          <p className="text-sm font-semibold">Astro Kit Convex</p>
          <p className="text-xs text-muted-foreground">Convex reference</p>
        </div>
      </div>
      <nav aria-label="Documentation" className="space-y-1">
        {documentationPages.map((page) => {
          const Icon = page.icon;
          const active = current === page.name;
          return (
            <a
              key={page.name}
              href={`/docs/${page.name}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{page.label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
