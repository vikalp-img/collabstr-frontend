export const theme = {
  colors: {
    primaryGradient: "bg-gradient-to-r from-purple-600 to-pink-600",
    textGradient: "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent",
    pageBackground: "bg-gradient-to-b from-white via-purple-50/30 to-white",
    pageBackgroundSecondary: "bg-gradient-to-b from-white to-purple-50",
  },
  typography: {
    h1: "text-5xl font-bold leading-tight text-gray-900 md:text-6xl lg:text-7xl",
    h2: "text-4xl font-bold text-gray-900 md:text-5xl",
    h3: "text-2xl font-bold text-gray-900",
    subtitle: "text-xl text-gray-600",
    body: "text-gray-600",
    brandText: "text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent",
  },
  buttons: {
    primary: "group inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed",
    secondary: "group inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-purple-200 bg-white px-5 py-2.5 text-sm font-semibold text-purple-600 transition-all hover:border-purple-300 hover:bg-purple-50 hover:scale-105 active:scale-95 disabled:cursor-not-allowed",
    white: "group inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-purple-600 shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed",
    outlineWhite: "group inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105 active:scale-95 disabled:cursor-not-allowed",
    navPrimary: "inline-flex cursor-pointer items-center space-x-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed",
    navSecondary: "flex cursor-pointer items-center space-x-2 rounded-full px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-600",
  },
  layout: {
    section: "px-4 py-32",
    container: "container mx-auto max-w-7xl",
  },
  header: {
    scrolled: "bg-white/80 backdrop-blur-lg shadow-lg py-3",
    transparent: "bg-transparent py-5",
  },
  cards: {
    base: "group relative rounded-2xl bg-white p-4 sm:p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1",
    interactive: "group cursor-pointer rounded-2xl bg-white p-4 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1",
    category: "group flex cursor-pointer flex-col items-center rounded-2xl bg-white p-4 sm:p-6 shadow-md transition-all hover:shadow-xl hover:-translate-y-1 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500",
  },
  effects: {
    blurOrbPurple: "rounded-full bg-purple-200/30 blur-3xl",
    blurOrbPink: "rounded-full bg-pink-200/30 blur-3xl",
    logoGradient: "bg-gradient-to-br from-purple-600 to-pink-600",
  }
};
