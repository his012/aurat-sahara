import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import { Bell, Globe, Lock } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { setLang, type Lang } from "@/lib/i18n";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Aurat Sahara" },
      { name: "description", content: "Aurat-Sahara Setup configures a new project for managing user applications and certificates." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Aurat Sahara" },
      { property: "og:description", content: "Aurat-Sahara Setup configures a new project for managing user applications and certificates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Aurat Sahara" },
      { name: "twitter:description", content: "Aurat-Sahara Setup configures a new project for managing user applications and certificates." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9de3d7b7-9254-48b3-abee-971c55684511/id-preview-d4c4a34b--cc159d97-1fbf-48a9-a14f-364bc40d61b4.lovable.app-1780871094436.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9de3d7b7-9254-48b3-abee-971c55684511/id-preview-d4c4a34b--cc159d97-1fbf-48a9-a14f-364bc40d61b4.lovable.app-1780871094436.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@500;600&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const showHeader = pathname !== "/" && pathname !== "/auth";
  const router = useRouter();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const changeLanguage = (language: Lang) => {
    setLang(language);
    window.location.reload();
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (passwordInput === "123@") {
      setIsPasswordModalOpen(false);
      router.navigate({ to: "/admin" });
    } else {
      setPasswordError("Wrong password");
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      {showHeader && (
        <header
          className="fixed inset-x-0 top-0 z-50 flex h-[50px] items-center justify-between px-4"
          style={{ backgroundColor: "#4a0e2a" }}
        >
          <Button variant="ghost" size="icon" onClick={() => { setIsPasswordModalOpen(true); setPasswordError(""); setPasswordInput(""); }} className="text-white hover:bg-white/10 hover:text-white" aria-label="Admin">
            <Lock size={20} />
          </Button>

          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
              <Link to="/notifications" aria-label="Notifications">
                <Bell size={20} />
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" aria-label="Change language">
                  <Globe size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => changeLanguage("en")}>English</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => changeLanguage("ur")} dir="rtl">اردو</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => changeLanguage("roman")}>Roman Urdu</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      )}
      <main className={showHeader ? "pt-[50px]" : undefined}>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </main>

      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Password</DialogTitle>
            <DialogDescription>Type the admin password to continue.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            <div className="flex justify-end">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </QueryClientProvider>
  );
}
