"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AuthForm } from "@/components/auth-form"

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}

function AuthPageContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") || "signin"

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                {mode === "signin" ? "Sign In" : "Create Account"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Sign in to your account"
                  : "Create a new account"}
              </p>
            </div>
            <AuthForm mode={mode} />
          </div>
        </div>
      </main>
    </div>
  )
}
