import React, { useState } from "react";
import {
  Authenticated,
  AuthLoading,
  ConvexReactClient,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import type { AuthClient } from "@convex-dev/better-auth/react";
import { api } from "@repo/backend/convex/_generated/api";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { GoogleLogin } from "@/components/auth/google-login";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { PricingGrid, useCheckout } from "@/components/payments/polar";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme";
import { authClient } from "@/lib/auth-client";
import { ConvexRealtimeDemo } from "./ConvexRealtimeDemo";

const convexClient = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

type AppPage = "dashboard" | "subscriptions" | "checkout-success";

interface AppShellProps {
  page: AppPage;
  checkoutId?: string;
  checkoutIdError?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

class AppErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Chargement" />
    </div>
  );
}

function Dashboard() {
  return (
    <div>
      <p>Bienvenue dans votre espace.</p>
      <ConvexRealtimeDemo />
    </div>
  );
}

function Subscriptions() {
  const products = useQuery(api.billing.listAllProducts, {});
  const subscription = useQuery(api.billing.getCurrentSubscription, {});
  const { redirectToCheckout, isCheckoutPending, checkoutError } = useCheckout();

  if (products === undefined || subscription === undefined) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold">Choisissez votre offre</h1>
        <p className="text-muted-foreground">Sélectionnez l’offre adaptée à vos besoins</p>
      </div>
      {checkoutError ? (
        <p className="mb-6 text-center text-sm text-destructive">{checkoutError}</p>
      ) : null}
      <PricingGrid
        products={products}
        subscription={subscription}
        onCheckout={redirectToCheckout}
        isCheckoutPending={isCheckoutPending}
      />
    </div>
  );
}

function CheckoutError({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-lg space-y-8 text-center">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Erreur de paiement</h1>
          <p className="text-lg text-muted-foreground">{message}</p>
        </div>
        <Button asChild size="lg">
          <a href="/app/polar/subscriptions">Retour aux offres</a>
        </Button>
      </div>
    </div>
  );
}

function CheckoutSuccess({ checkoutId }: { checkoutId: string }) {
  const subscription = useQuery(api.billing.getCurrentSubscription, {});
  const status = subscription === undefined || subscription === null ? "processing" : "success";

  return (
    <div className="flex h-full flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-lg space-y-8 text-center">
        <div className="flex justify-center">
          {status === "success" ? (
            <CheckCircle2 className="h-16 w-16 text-primary" />
          ) : (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          )}
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            {status === "success" ? "Paiement confirmé !" : "Traitement de votre paiement"}
          </h1>
          <p className="mx-auto max-w-md text-lg leading-relaxed text-muted-foreground">
            {status === "success"
              ? "Votre abonnement a bien été activé."
              : "Nous vérifions les détails du paiement. Cela peut prendre quelques instants…"}
          </p>
        </div>
        {status === "success" ? (
          <Button asChild size="lg" className="px-8 py-3">
            <a href="/app">Continuer vers le tableau de bord</a>
          </Button>
        ) : null}
        <p className="pt-8 text-sm text-muted-foreground">
          Identifiant de transaction :{" "}
          <span className="font-mono text-foreground">{checkoutId.slice(-8)}</span>
        </p>
      </div>
    </div>
  );
}

function PageContent({ page, checkoutId, checkoutIdError }: AppShellProps) {
  if (page === "dashboard") return <Dashboard />;
  if (page === "subscriptions") return <Subscriptions />;
  if (checkoutIdError || !checkoutId) {
    return <CheckoutError message={checkoutIdError ?? "Identifiant de checkout absent."} />;
  }
  return <CheckoutSuccess checkoutId={checkoutId} />;
}

function AuthenticatedApplication(props: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const errorFallback = props.page === "checkout-success" ? (
    <CheckoutError message="Le paiement n’a pas pu être vérifié. Réessayez dans quelques instants." />
  ) : (
    <CheckoutError message="Les données n’ont pas pu être chargées." />
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        className="flex-shrink-0"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMobileMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
          <div className="mx-auto max-w-7xl">
            <AppErrorBoundary fallback={errorFallback}>
              <PageContent {...props} />
            </AppErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <ConvexBetterAuthProvider
        client={convexClient}
        authClient={authClient as unknown as AuthClient}
      >
        <AuthLoading><LoadingScreen /></AuthLoading>
        <Authenticated><AuthenticatedApplication {...props} /></Authenticated>
        <Unauthenticated><GoogleLogin /></Unauthenticated>
      </ConvexBetterAuthProvider>
    </ThemeProvider>
  );
}
