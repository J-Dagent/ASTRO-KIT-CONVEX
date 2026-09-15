import { ArrowRight, CheckCircle2 } from "lucide-react";
import { DocsNavigation, documentationPages } from "./docs-navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DocumentationHome() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <header className="mb-12 border-b border-border pb-10">
        <Badge variant="secondary" className="mb-5">
          Astro + Convex
        </Badge>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Une documentation qui suit le vrai chemin du projet
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Commencez en local, branchez Better Auth et Polar, puis déployez
              Convex Cloud avant le Worker Cloudflare.
            </p>
          </div>
          <div className="flex items-center gap-3 lg:justify-end">
            <img src="/convex-logo.webp" alt="Convex" className="h-12 w-12" />
            <div>
              <p className="font-semibold">Backend principal</p>
              <p className="text-sm text-muted-foreground">Convex Cloud</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
        <DocsNavigation />
        <main>
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Parcours recommandé
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Du clone au premier déploiement
            </h2>
          </div>

          <ol className="divide-y divide-border border-y border-border">
            {documentationPages.map((page, index) => {
              const Icon = page.icon;
              return (
                <li key={page.name}>
                  <a
                    href={`/docs/${page.name}`}
                    className="group grid gap-4 py-6 sm:grid-cols-[42px_1fr_auto] sm:items-center"
                  >
                    <span className="font-mono text-sm text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex items-start gap-4">
                      <span className="mt-0.5 rounded-md bg-muted p-2">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block font-semibold group-hover:text-primary">
                          {page.label}
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {page.description}
                        </span>
                      </span>
                    </span>
                    <ArrowRight className="hidden h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 sm:block" />
                  </a>
                </li>
              );
            })}
          </ol>

          <section className="mt-12 grid gap-8 border-t border-border pt-10 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold">Deux processus en local</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Astro sert le site et les islands React. Convex local sert les
                données, l’authentification et les fonctions backend. Les URL
                locales ne sont jamais reprises par un build de production.
              </p>
            </div>
            <div className="space-y-3">
              {[
                "Landing et documentation indépendantes de Convex",
                "Authentification et données privées limitées à /app",
                "Déploiement cloud contrôlé avant tout upload",
              ].map((item) => (
                <div key={item} className="flex gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-10">
            <Button asChild size="lg">
              <a href="/docs/getting-started">
                Commencer l’installation
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
