import { NavigationBar } from "@/components/navigation";
import { ThemeProvider } from "@/components/theme";

export function SiteNavigation() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <NavigationBar />
    </ThemeProvider>
  );
}
