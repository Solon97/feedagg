import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  variant?: "default" | "icon-only";
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8 md:w-10 md:h-10",
  lg: "w-12 h-12",
};

const textSizeClasses = {
  sm: "text-lg font-medium",
  md: "text-xl md:text-2xl font-semibold",
  lg: "text-3xl font-bold",
};

export function Logo({
  size = "md",
  className,
  showText = true,
  variant = "default",
}: LogoProps) {
  const logoElement = (
    <div className="relative overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200">
      <Image
        src="/icons/icon.webp"
        alt="FeedAgg Logo"
        width={size === "sm" ? 24 : size === "md" ? 40 : 48}
        height={size === "sm" ? 24 : size === "md" ? 40 : 48}
        className={cn(
          sizeClasses[size],
          "object-contain group-hover:scale-110 transition-transform duration-200"
        )}
        priority
      />
    </div>
  );

  if (variant === "icon-only" || !showText) {
    return (
      <div className={cn("group cursor-pointer", className)}>{logoElement}</div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 md:gap-3 group cursor-pointer",
        className
      )}
    >
      {logoElement}
      <h1
        className={cn(
          textSizeClasses[size],
          "text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-200"
        )}
      >
        FeedAgg
      </h1>
    </div>
  );
}
