"use client";

/**
 * A reusable content-area loader component.
 * Renders a centered spinner with an optional message.
 * Designed to be placed between Header and Footer.
 *
 * @param {string} [message="Loading..."] - Text to display below the spinner
 */
const PageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
      {/* Animated spinner ring */}
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-[3px] border-purple-100" />
        <div className="absolute inset-0 w-14 h-14 rounded-full border-[3px] border-transparent border-t-purple-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 animate-pulse" />
        </div>
      </div>
      {message && (
        <p className="text-sm font-semibold text-gray-500 tracking-wide">
          {message}
        </p>
      )}
    </div>
  );
};

export default PageLoader;
