import Image from "next/image";

interface FeedAggLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  animated?: boolean;
}

export function FeedAggLogo({
  size = "md",
  showTagline = true,
  animated = false,
}: FeedAggLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const taglineSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div
      className={`flex flex-col items-center space-y-3 ${
        animated ? "animate-fade-in" : ""
      }`}
    >
      <div className="flex items-center space-x-4">
        {/* Logo Icon */}
        <div
          className={`bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl p-3 flex items-center justify-center shadow-lg ${
            animated ? "animate-bounce-subtle" : ""
          }`}
        >
          <Image
            src="/logo.png"
            alt="FeedAgg Icon"
            width={size === "lg" ? 32 : size === "md" ? 24 : 16}
            height={size === "lg" ? 32 : size === "md" ? 24 : 16}
            className="filter"
          />
        </div>

        {/* Brand Name */}
        <h1
          className={`font-bold text-teal-400 tracking-tight ${textSizes[size]}`}
        >
          FeedAgg
        </h1>
      </div>

      {showTagline && (
        <p
          className={`text-gray-400 text-center font-medium ${taglineSizes[size]} max-w-xs leading-relaxed`}
        >
          Pure content. Zero noise.
        </p>
      )}
    </div>
  );
}
