"use client";

import React, { useMemo, useRef } from "react";
import { verifySchema } from "@/schemas/verifySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

type VerifyValues = z.infer<typeof verifySchema>;

function OtpBoxes({
  value,
  onChange,
  invalid,
  length = 6,
  id = "code",
}: {
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  length?: number;
  id?: string;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = useMemo(() => {
    const clean = (value ?? "").replace(/\D/g, "").slice(0, length);
    return Array.from({ length }, (_, i) => clean[i] ?? "");
  }, [value, length]);

  const setAt = (index: number, ch: string) => {
    const next = [...digits];
    next[index] = ch;
    onChange(next.join(""));
  };

  const focus = (i: number) => refs.current[i]?.focus();

  const onBoxChange = (index: number, raw: string) => {
    const ch = raw.replace(/\D/g, "").slice(-1); // keep last digit only
    setAt(index, ch);
    if (ch && index < length - 1) focus(index + 1);
  };

  const onKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      // if current box has value, clear it
      if (digits[index]) {
        e.preventDefault();
        setAt(index, "");
        return;
      }
      // otherwise go back and clear previous
      if (index > 0) {
        e.preventDefault();
        focus(index - 1);
        setAt(index - 1, "");
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focus(index - 1);
    }

    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focus(index + 1);
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (!pasted) return;

    const next = Array.from({ length }, (_, i) => pasted[i] ?? "");
    onChange(next.join(""));

    const lastFilled = Math.min(pasted.length, length) - 1;
    focus(Math.max(lastFilled, 0));
  };

  return (
    <div className="mt-2">
      {/* hidden input for form semantics/autofill */}
      <input
        id={id}
        name={id}
        value={digits.join("")}
        readOnly
        className="sr-only"
      />

      <div className="flex items-center justify-between gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d}
            onChange={(e) => onBoxChange(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={onPaste}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1}`}
            className={[
              "h-12 w-12 rounded-2xl border bg-white text-center text-lg font-semibold text-slate-900",
              "outline-none transition",
              invalid
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100",
            ].join(" ")}
          />
        ))}
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Tip: you can paste the full code.
      </p>
    </div>
  );
}

export default function VerifyAccount() {
  const router = useRouter();
  const params = useParams();

  const usernameRaw = (params as { username?: string | string[] })?.username;
  const username = Array.isArray(usernameRaw)
    ? usernameRaw[0]
    : (usernameRaw ?? "");

  const form = useForm<VerifyValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
    mode: "onSubmit",
  });

  const onSubmit = async (data: VerifyValues) => {
    try {
      const res = await axios.post("/api/verify-code", {
        username,
        code: data.code,
      });

      toast.success(res.data?.message ?? "Verified!");
      router.replace("/sign-in");
    } catch (err) {
      const e = err as AxiosError<any>;
      toast.error(e.response?.data?.message ?? "Verification failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Verify your account
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter the code sent to <span className="font-medium">{username}</span>
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-6 space-y-5"
          noValidate
        >
          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="code">Verification Code</FieldLabel>

                <OtpBoxes
                  id="code"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  invalid={fieldState.invalid}
                  length={6}
                />

                {fieldState.error && (
                  <div className="mt-2">
                    <FieldError
                      errors={[{ message: fieldState.error.message }]}
                    />
                  </div>
                )}
              </Field>
            )}
          />

          <Button type="submit" className="h-11 w-full rounded-2xl">
            Verify
          </Button>
        </form>
      </div>
    </div>
  );
}
