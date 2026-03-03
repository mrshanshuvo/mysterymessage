"use client";

import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { signUpSchema } from "@/schemas/signUpSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import type { ApiResponse } from "@/types/ApiResponse";
import { z } from "zod";

// shadcn/ui (update paths if your project differs)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Eye, EyeOff } from "lucide-react";

type SignUpValues = z.infer<typeof signUpSchema>;

export default function Page() {
  const [usernameMsg, setUsernameMsg] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  // ✅ watch username from RHF (no separate username state needed)
  const username = form.watch("username");

  // ✅ useDebounceValue returns a tuple: [value, setValue]
  const [debouncedUsername] = useDebounceValue(username, 500);

  useEffect(() => {
    const usernameCheck = async () => {
      if (!debouncedUsername) {
        setUsernameMsg("");
        return;
      }

      setIsCheckingUsername(true);
      setUsernameMsg("");

      try {
        const res = await axios.get<ApiResponse>(
          `/api/check-username-unique?username=${encodeURIComponent(
            debouncedUsername,
          )}`,
        );
        setUsernameMsg(res.data.message);
      } catch (err) {
        const axiosError = err as AxiosError<ApiResponse>;
        setUsernameMsg(
          axiosError.response?.data?.message ?? "Error checking username",
        );
      } finally {
        setIsCheckingUsername(false);
      }
    };

    usernameCheck();
  }, [debouncedUsername]);

  const onSubmit = async (data: SignUpValues) => {
    setIsSubmitting(true);

    try {
      const res = await axios.post<ApiResponse>("/api/sign-up", data);
      toast.success(res.data.message);

      setTimeout(() => {
        router.push(`/verify/${data.username}`);
      }, 1100); // 600–1200ms feels fine
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>;
      const msg = axiosError.response?.data?.message ?? "Sign up failed";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900 text-center">
          Join Mystery Message
        </h1>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-6 space-y-4"
          noValidate
        >
          {/* Username */}
          <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="shuvo_dev (must be unique)"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                />

                {/* Username status */}
                <div className="text-sm">
                  {isCheckingUsername && (
                    <span className="text-slate-500">
                      Checking availability...
                    </span>
                  )}

                  {!isCheckingUsername && usernameMsg && (
                    <span
                      className={
                        usernameMsg.toLowerCase().includes("available") ||
                        usernameMsg.toLowerCase().includes("unique")
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }
                    >
                      {usernameMsg}
                    </span>
                  )}
                </div>

                {fieldState.error && (
                  <div className="mt-2">
                    <FieldError errors={[fieldState.error]} />
                  </div>
                )}
              </Field>
            )}
          />

          {/* Email */}
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription className="mt-2">
                  We’ll send a verification code to this email.
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
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>

                <div className="relative mt-2">
                  <Input
                    {...field}
                    id={field.name}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    className="pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <FieldDescription className="mt-2">
                  Use at least 8 characters.
                </FieldDescription>

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
            disabled={isSubmitting || isCheckingUsername}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <a
              href="/sign-in"
              className="font-medium text-[#2E3192] hover:underline"
            >
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
