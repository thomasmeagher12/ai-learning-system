"use client";

import { useState, useEffect, useRef, useCallback } from "react";

function draftKey(sessionId: string, phase: string) {
  return `adts-draft:${sessionId}:${phase}`;
}

export default function DraftTextarea({
  sessionId,
  phase,
  serverValue,
  name = "response",
  placeholder,
  minLength,
  required,
  className,
}: {
  sessionId: string;
  phase: string;
  serverValue?: string;
  name?: string;
  placeholder?: string;
  minLength?: number;
  required?: boolean;
  className?: string;
}) {
  const key = draftKey(sessionId, phase);
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return serverValue ?? "";
    const draft = localStorage.getItem(key);
    return draft ?? serverValue ?? "";
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [key]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const form = el.closest("form");
    if (!form) return;
    formRef.current = form;

    function handleSubmit() {
      clearDraft();
    }
    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, [clearDraft]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value;
    setValue(v);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (v.trim()) {
        localStorage.setItem(key, v);
      } else {
        localStorage.removeItem(key);
      }
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <textarea
      ref={textareaRef}
      name={name}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      minLength={minLength}
      required={required}
      className={className}
    />
  );
}
