import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";

export function useCheckout() {
  const generateCheckoutLink = useAction(api.billing.generateCheckoutLink);
  const [isCheckoutPending, setIsCheckoutPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string>();

  const redirectToCheckout = async (productId: string) => {
    setIsCheckoutPending(true);
    setCheckoutError(undefined);
    try {
      const result = await generateCheckoutLink({
        productId,
        locale: "fr",
      });
      window.location.assign(result.url);
    } catch (caught) {
      setCheckoutError(
        caught instanceof Error ? caught.message : "Le checkout n’a pas pu être ouvert.",
      );
      setIsCheckoutPending(false);
    }
  };

  return {
    redirectToCheckout,
    isCheckoutPending,
    checkoutError,
  };
}
