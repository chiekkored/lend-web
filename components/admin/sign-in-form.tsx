"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, LockKeyhole } from "lucide-react";

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

const signInSchema = z.object({
  email: z.string().email("Enter a valid admin email."),
  password: z.string().min(1, "Password is required."),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignInValues) {
    setError(null);

    if (!hasFirebaseConfig) {
      setError(
        `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
      );
      return;
    }

    try {
      const auth = getFirebaseAuth();
      const credential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );
      const token = await credential.user.getIdTokenResult(true);

      if (token.claims.admin !== true) {
        await signOut(auth);
        setError("This account is not authorized for the admin console.");
        return;
      }

      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <LockKeyhole className="size-5" />
        </div>
        <CardTitle>Admin sign in</CardTitle>
        <CardDescription>
          Use a Firebase Auth account with the admin custom claim.
        </CardDescription>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-destructive">
                {errors.password.message}
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
            Sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
