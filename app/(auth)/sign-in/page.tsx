"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { signInSchema } from "@/schemas/signInSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (data: SignInValues) => {
    setIsSubmitting(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
      });

      if (res?.ok) {
        toast.success("Signed in successfully!");
        setTimeout(() => router.replace("/dashboard"), 1000);
        return;
      }

      toast.error(res?.error || "Invalid credentials");
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900 text-center">
          Sign in to Mystery Message
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Welcome back. Enter your credentials.
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-6 space-y-4"
          noValidate
        >
          {/* Identifier */}
          <Controller
            name="identifier"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="identifier">Email or Username</FieldLabel>
                <Input
                  {...field}
                  id="identifier"
                  type="text"
                  placeholder="you@example.com"
                  autoComplete="username"
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription className="mt-2">
                  Use the email/username you registered with.
                </FieldDescription>
                {fieldState.error && (
                  <div className="mt-2">
                    <FieldError errors={[fieldState.error]} />
                  </div>
                )}
              </Field>
            )}
          />

          {/* Password */}
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>

                <div className="relative mt-2">
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {fieldState.error && (
                  <div className="mt-2">
                    <FieldError errors={[fieldState.error]} />
                  </div>
                )}
              </Field>
            )}
          />

          <Button
            type="submit"
            className="h-11 w-full rounded-2xl"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>

          <p className="text-center text-sm text-slate-600">
            Don’t have an account?{" "}
            <a
              href="/sign-up"
              className="font-medium text-[#2E3192] hover:underline"
            >
              Create one
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
