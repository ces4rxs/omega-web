"use client";

import { InputHTMLAttributes } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function AuthInput({ label, error, ...props }: AuthInputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#f9fafb]">
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-lg border border-[#9ca3af]/30 bg-[#141824] px-4 py-2.5 text-[#f9fafb] placeholder-[#9ca3af]/50 outline-none transition-all focus:border-[#00d4ff] focus:ring-2 focus:ring-[#00d4ff]/20"
      />
      {error && <p className="mt-1 text-xs text-[#ef4444]">{error}</p>}
    </div>
  );
}
