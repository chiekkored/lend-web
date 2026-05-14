"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getFirebaseAuth,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";

const registerSchema = z
  .object({
    email: z.string().email("Enter a valid admin email."),
    displayName: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm the password."),
    setupSecret: z.string().min(1, "Setup secret is required."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

const bootstrapUrl = process.env.NEXT_PUBLIC_ADMIN_BOOTSTRAP_FUNCTION_URL;

export function AdminRegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      displayName: "",
      password: "",
      confirmPassword: "",
      setupSecret: "",
    },
  });

  async function onSubmit(values: RegisterValues) {
    setError(null);

    if (!bootstrapUrl) {
      setError("Missing admin bootstrap function URL.");
      return;
    }

    if (!hasFirebaseConfig) {
      setError(
        `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
      );
      return;
    }

    try {
      const response = await fetch(bootstrapUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          displayName: values.displayName,
          setupSecret: values.setupSecret,
        }),
      });

      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(body?.error ?? "Unable to register admin account.");
        return;
      }

      const auth = getFirebaseAuth();
      const credential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );
      const token = await credential.user.getIdTokenResult(true);

      if (token.claims.admin !== true) {
        setError("Admin claim was created, but the token did not refresh yet.");
        return;
      }

      router.replace("/admin");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to register admin account.",
      );
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <UserPlus className="size-5" />
        </div>
        <CardTitle>Register admin</CardTitle>
        <CardDescription>Create the temporary bootstrap admin account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              autoComplete="name"
              placeholder="Admin"
              {...register("displayName")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword ? (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="setupSecret">Setup secret</Label>
            <Input
              id="setupSecret"
              type="password"
              autoComplete="one-time-code"
              {...register("setupSecret")}
            />
            {errors.setupSecret ? (
              <p className="text-sm text-destructive">
                {errors.setupSecret.message}
              </p>
            ) : null}
          </div>
          {error ? (
            <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? <Loader2 className="animate-spin" /> : null}
            Register admin
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
