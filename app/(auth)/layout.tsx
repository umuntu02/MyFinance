import { I18nProvider } from "@/components/providers/i18n-provider";

// Public auth screens (no app shell). I18nProvider gives the client forms their
// translations; ThemeProvider/TooltipProvider come from the root layout.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nProvider>
      <div className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
        {children}
      </div>
    </I18nProvider>
  );
}
