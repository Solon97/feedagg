"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { locales } from "@/i18n/config";
import { useLocalizedTranslations } from "@/hooks/use-localized-translations";

const localeNames = {
  "pt-BR": "Português (BR)",
  en: "English",
} as const;

const localeFlags = {
  "pt-BR": "��",
  en: "��",
} as const;

export function LanguageSelector() {
  const { locale, setLocale, t } = useLocalizedTranslations();

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale as any);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-300 hover:text-white"
        >
          <Globe className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">
            {localeFlags[locale as keyof typeof localeFlags]}
          </span>
          <span className="hidden md:inline ml-1">
            {localeNames[locale as keyof typeof localeNames]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-slate-800 border-slate-700"
      >
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`cursor-pointer ${
              locale === loc
                ? "bg-teal-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            <span className="mr-2">{localeFlags[loc]}</span>
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
