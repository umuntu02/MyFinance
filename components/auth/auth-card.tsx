import Image from "next/image";

// Shared shell for the /login and /register screens: centered card, logo,
// brand wordmark, title + subtitle. Uses the app design tokens so it matches
// the rest of MyFinance in both light and dark themes.
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 flex items-center gap-2.5">
          <Image
            src="/img/logo.png"
            alt="MyFinance logo"
            width={40}
            height={40}
            className="rounded-lg"
            priority
          />
          <span className="text-lg font-bold tracking-tight text-foreground">
            MyFinance
          </span>
        </div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        {children}
      </div>

      <p className="mt-5 text-center text-sm text-muted-foreground">{footer}</p>
    </div>
  );
}

// Labeled input row used by both auth forms.
export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
