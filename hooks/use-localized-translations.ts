"use client";

import { useState, useEffect } from "react";
import { defaultLocale, locales, type Locale } from "@/i18n/config";

type Messages = Record<string, any>;

export function useLocalizedTranslations() {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<Messages>({});
  const [loading, setLoading] = useState(true);

  // Load locale and messages
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      try {
        // Get saved locale from localStorage
        const savedLocale = localStorage.getItem("preferred-locale") as Locale;
        const currentLocale =
          savedLocale && locales.includes(savedLocale)
            ? savedLocale
            : defaultLocale;

        // Load messages for the current locale
        const messagesModule = await import(
          `../messages/${currentLocale}.json`
        );

        setLocaleState(currentLocale);
        setMessages(messagesModule.default);
      } catch (error) {
        console.error("Error loading messages:", error);
        // Fallback to default
        const fallbackMessages = await import(
          `../messages/${defaultLocale}.json`
        );
        setMessages(fallbackMessages.default);
        setLocaleState(defaultLocale);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  const setLocale = async (newLocale: Locale) => {
    if (!locales.includes(newLocale)) return;

    setLoading(true);
    try {
      localStorage.setItem("preferred-locale", newLocale);
      const messagesModule = await import(`../messages/${newLocale}.json`);

      setLocaleState(newLocale);
      setMessages(messagesModule.default);
    } catch (error) {
      console.error("Error switching locale:", error);
    } finally {
      setLoading(false);
    }
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    const keys = key.split(".");
    let value: any = messages;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    if (typeof value !== "string") {
      return key; // Return key if translation not found
    }

    // Simple parameter replacement
    if (params) {
      return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
        return str.replace(
          new RegExp(`{${paramKey}}`, "g"),
          String(paramValue)
        );
      }, value);
    }

    return value;
  };

  return {
    locale,
    setLocale,
    t,
    loading,
    messages,
  };
}
