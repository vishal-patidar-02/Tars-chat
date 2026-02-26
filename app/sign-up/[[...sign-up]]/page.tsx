import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-navy/6 blur-3xl dark:bg-cream/5" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-steel/10 blur-3xl dark:bg-navy/20" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream/20 blur-3xl dark:bg-cream/5" />
      </div>

      {/* Brand mark */}
      <div className="relative mb-8 flex flex-col items-center gap-3 animate-fade-in">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy shadow-lg dark:bg-cream">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F0F0DB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 dark:stroke-navy"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Join Tars Chat
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your account to get started
          </p>
        </div>
      </div>

      {/* Clerk sign-up widget */}
      <div className="relative animate-scale-in">
        <SignUp
          appearance={{
            elements: {
              rootBox: "shadow-none",
              card: "shadow-xl border border-border bg-elevated rounded-2xl",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              formButtonPrimary:
                "bg-navy hover:bg-navy/90 text-parchment rounded-xl dark:bg-cream dark:text-navy dark:hover:bg-cream/90",
              formFieldInput:
                "bg-background border-border text-foreground rounded-xl",
              footerActionLink: "text-navy dark:text-cream",
            },
          }}
        />
      </div>
    </div>
  )
}