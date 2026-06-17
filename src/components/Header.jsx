// components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  Instagram,
  Youtube,
  Music2,
  Globe,
  Users,
  Briefcase,
  HelpCircle,
  LogIn,
  LogOut,
  User,
  ClipboardList,
  Image as ImageIcon,
  Wallet,
  Heart,
  ShoppingBag,
  History,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { theme } from "@/theme";
import ConfirmationModal from "./ConfirmationModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toast } from "sonner";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Check authentication token
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("userRole");
      setIsLoggedIn(!!token);
      setUserRole(role);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      if (typeof window !== "undefined") {
        await apiWithAuth.post(API_ENDPOINTS.USER.LOGOUT);
        localStorage.removeItem("authToken");
        setIsLoggedIn(false);
        router.push("/login");
        toast.success("Logged out successfully");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: clear local storage and redirect anyway if API fails
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        setIsLoggedIn(false);
        router.push("/login");
      }
    }
  };

  const navItems =
    isLoggedIn && userRole === "brand"
      ? [
        { title: "Home", href: "/brand/home" },
        { title: "Search", href: "/creators" },
        { title: "Wallet", href: "/brand/wallet" },
        { title: "Favorites", href: "/brand/favorites" },
        { title: "Pricing", href: "/brand/subscription" },
      ]
      : isLoggedIn && userRole === "creator"
        ? [
          { title: "Dashboard", href: "/creator/dashboard" },
          { title: "Services", href: "/creator/services" },
          { title: "Portfolio", href: "/creator/portfolio" },
          { title: "Orders", href: "/creator/orders" },
        ]
        : [
          { title: "Search", href: "/creators" },
          { title: "How it works", href: "/#how-it-works" },
          { title: "Pricing", href: "/pricing" },
          { title: "Blog", href: "/blog" },
        ];

  const handleNavClick = (event, href) => {
    const isAnchor = href.startsWith("/#");
    const onHome = pathname === "/";

    if (isAnchor && onHome) {
      event.preventDefault();
      const targetId = href.split("#")[1];
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${targetId}`);
      }
    }

    // Always close the mobile menu after a click
    setIsOpen(false);
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? theme.header.scrolled : theme.header.transparent
        }`}
    >
      <nav className="container mx-auto max-w-7xl px-4 lg:px-0">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href={!isMounted ? "/" : isLoggedIn && userRole === "brand" ? "/brand/home" : isLoggedIn && userRole === "creator" ? "/creator/dashboard" : "/"} 
            className="flex items-center "
          >
            <div className="relative h-13 w-13 overflow-hidden rounded-xl shrink-0">
              <img src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''}/Logo.png`} alt="HireSphere Logo" className="w-full h-full object-cover" />
            </div>
            <span className={theme.typography.brandText}>HireSphere</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`text-sm font-medium transition-colors hover:text-purple-600 ${scrolled ? "text-gray-700" : "text-gray-700"
                  }`}
              >
                {item.title}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="hidden lg:flex lg:items-center lg:space-x-3 lg:flex-shrink-0 min-h-[40px] min-w-[200px] justify-end">
            {!isMounted ? null : isLoggedIn ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger className=" mr-0 flex items-center outline-none justify-center h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-md transition-all hover:shadow-lg hover:scale-105 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2">
                  <User className="h-5 w-5 shrink-0  " />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-60 rounded-2xl p-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-gray-100 z-50"
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-3 py-2">
                      <p className="text-sm font-semibold text-gray-900 leading-none">
                        My Account
                      </p>
                      <p className="text-xs text-gray-500 mt-1.5 leading-none">
                        Manage your profile
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-100 mb-1" />

                    {userRole === "brand" ? (
                      <>
                        <DropdownMenuItem
                          onClick={() => router.push("/brand/profile")}
                          className="group flex cursor-pointer items-center rounded-xl px-2 py-2 text-sm font-medium text-gray-700 transition-all focus:bg-purple-50 focus:text-purple-700 outline-none"
                        >
                          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-colors group-hover:bg-purple-100 group-hover:text-purple-600 group-focus:bg-purple-100 group-focus:text-purple-600">
                            <User className="h-4 w-4 shrink-0" />
                          </div>
                          Profile
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => router.push("/brand/orders")}
                          className="group flex cursor-pointer items-center rounded-xl px-2 py-2 text-sm font-medium text-gray-700 transition-all focus:bg-purple-50 focus:text-purple-700 outline-none"
                        >
                          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-colors group-hover:bg-purple-100 group-hover:text-purple-600 group-focus:bg-purple-100 group-focus:text-purple-600">
                            <ShoppingBag className="h-4 w-4 shrink-0" />
                          </div>
                          Orders
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => router.push("/brand/cart")}
                          className="group flex cursor-pointer items-center rounded-xl px-2 py-2 text-sm font-medium text-gray-700 transition-all focus:bg-purple-50 focus:text-purple-700 outline-none"
                        >
                          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-colors group-hover:bg-purple-100 group-hover:text-purple-600 group-focus:bg-purple-100 group-focus:text-purple-600">
                            <ClipboardList className="h-4 w-4 shrink-0" />
                          </div>
                          Cart
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => router.push("/brand/transactions")}
                          className="group flex cursor-pointer items-center rounded-xl px-2 py-2 text-sm font-medium text-gray-700 transition-all focus:bg-purple-50 focus:text-purple-700 outline-none"
                        >
                          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-colors group-hover:bg-purple-100 group-hover:text-purple-600 group-focus:bg-purple-100 group-focus:text-purple-600">
                            <History className="h-4 w-4 shrink-0" />
                          </div>
                          Transactions
                        </DropdownMenuItem>


                      </>
                    ) : (
                      <>
                        <DropdownMenuItem
                          onClick={() => router.push("/creator/profile")}
                          className="group flex cursor-pointer items-center rounded-xl px-2 py-2 text-sm font-medium text-gray-700 transition-all focus:bg-purple-50 focus:text-purple-700 outline-none"
                        >
                          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-colors group-hover:bg-purple-100 group-hover:text-purple-600 group-focus:bg-purple-100 group-focus:text-purple-600">
                            <User className="h-4 w-4 shrink-0" />
                          </div>
                          Profile
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => router.push("/creator/wallet")}
                          className="group flex cursor-pointer items-center rounded-xl px-2 py-2 text-sm font-medium text-gray-700 transition-all focus:bg-purple-50 focus:text-purple-700 outline-none"
                        >
                          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-colors group-hover:bg-purple-100 group-hover:text-purple-600 group-focus:bg-purple-100 group-focus:text-purple-600">
                            <Wallet className="h-4 w-4 shrink-0" />
                          </div>
                          Wallet
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => router.push("/creator/transactions")}
                          className="group flex cursor-pointer items-center rounded-xl px-2 py-2 text-sm font-medium text-gray-700 transition-all focus:bg-purple-50 focus:text-purple-700 outline-none"
                        >
                          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-colors group-hover:bg-purple-100 group-hover:text-purple-600 group-focus:bg-purple-100 group-focus:text-purple-600">
                            <History className="h-4 w-4 shrink-0" />
                          </div>
                          Transactions
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => router.push("/creator/kyc")}
                          className="group flex cursor-pointer items-center rounded-xl px-2 py-2 text-sm font-medium text-gray-700 transition-all focus:bg-purple-50 focus:text-purple-700 outline-none"
                        >
                          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-colors group-hover:bg-purple-100 group-hover:text-purple-600 group-focus:bg-purple-100 group-focus:text-purple-600">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                          </div>
                          KYC
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="bg-gray-100 my-1" />

                  <DropdownMenuItem
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="group flex cursor-pointer items-center rounded-xl px-2 py-2 text-sm font-medium text-gray-700 transition-all focus:bg-red-50 focus:text-red-700 outline-none"
                  >
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-colors group-hover:bg-red-100 group-hover:text-red-600 group-focus:bg-red-100 group-focus:text-red-600">
                      <LogOut className="h-4 w-4 shrink-0" />
                    </div>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  href="/creator/signup"
                  className={theme.buttons.navPrimary}
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <span>Join as creator</span>
                </Link>
                <Link href="/signup" className={theme.buttons.navSecondary}>
                  <Briefcase className="h-4 w-4 shrink-0" />
                  <span>Join as brand</span>
                </Link>
                <Link
                  href="/login"
                  className="flex items-center space-x-2 rounded-full px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-600"
                >
                  <LogIn className="h-4 w-4 shrink-0" />
                  <span>Login</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile buttons & menu button */}
          <div className="flex items-center space-x-2 lg:hidden min-h-[40px]">
            {isMounted && !isLoggedIn && (
              <Link
                href="/login"
                className="flex items-center space-x-1.5 rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-600 border border-gray-100"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-600"
            >
              {isOpen ? (
                <X className="h-6 w-6 shrink-0" />
              ) : (
                <Menu className="h-6 w-6 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full bg-white shadow-xl rounded-b-3xl lg:hidden animate-in slide-in-from-right">
            <div className="space-y-1 p-4">
              {navItems.map((item) => (
                <div
                  key={item.title}
                  className="border-b border-gray-100 last:border-0"
                >
                  <Link
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="flex w-full items-center justify-between py-3 text-left font-medium text-gray-700 hover:text-purple-600"
                  >
                    {item.title}
                  </Link>
                </div>
              ))}

              <div className="flex flex-col space-y-3 pt-4">
                {isMounted && isLoggedIn ? (
                  <>
                    {userRole === "brand" ? (
                      <>
                        <Link
                          href="/brand/profile"
                          className="flex items-center justify-center space-x-2 rounded-full border-2 border-purple-200 px-5 py-3 text-sm font-medium text-purple-600 transition-colors hover:border-purple-300 hover:bg-purple-50 bg-white"
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="h-4 w-4 shrink-0" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          href="/brand/orders"
                          className="flex items-center justify-center space-x-2 rounded-full border-2 border-purple-200 px-5 py-3 text-sm font-medium text-purple-600 transition-colors hover:border-purple-300 hover:bg-purple-50 bg-white"
                          onClick={() => setIsOpen(false)}
                        >
                          <ShoppingBag className="h-4 w-4 shrink-0" />
                          <span>Orders</span>
                        </Link>
                        <Link
                          href="/brand/cart"
                          className="flex items-center justify-center space-x-2 rounded-full border-2 border-purple-200 px-5 py-3 text-sm font-medium text-purple-600 transition-colors hover:border-purple-300 hover:bg-purple-50 bg-white"
                          onClick={() => setIsOpen(false)}
                        >
                          <ClipboardList className="h-4 w-4 shrink-0" />
                          <span>Cart</span>
                        </Link>
                        <Link
                          href="/brand/transactions"
                          className="flex items-center justify-center space-x-2 rounded-full border-2 border-purple-200 px-5 py-3 text-sm font-medium text-purple-600 transition-colors hover:border-purple-300 hover:bg-purple-50 bg-white"
                          onClick={() => setIsOpen(false)}
                        >
                          <History className="h-4 w-4 shrink-0" />
                          <span>Transactions</span>
                        </Link>

                        <Link
                          href="/brand/subscription"
                          className="flex items-center justify-center space-x-2 rounded-full border-2 border-purple-200 px-5 py-3 text-sm font-medium text-purple-600 transition-colors hover:border-purple-300 hover:bg-purple-50 bg-white"
                          onClick={() => setIsOpen(false)}
                        >
                          <Sparkles className="h-4 w-4 shrink-0" />
                          <span>Pricing</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/creator/profile"
                          className="flex items-center justify-center space-x-2 rounded-full border-2 border-purple-200 px-5 py-3 text-sm font-medium text-purple-600 transition-colors hover:border-purple-300 hover:bg-purple-50 bg-white"
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="h-4 w-4 shrink-0" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          href="/creator/wallet"
                          className="flex items-center justify-center space-x-2 rounded-full border-2 border-purple-200 px-5 py-3 text-sm font-medium text-purple-600 transition-colors hover:border-purple-300 hover:bg-purple-50 bg-white"
                          onClick={() => setIsOpen(false)}
                        >
                          <Wallet className="h-4 w-4 shrink-0" />
                          <span>Wallet</span>
                        </Link>
                        <Link
                          href="/creator/transactions"
                          className="flex items-center justify-center space-x-2 rounded-full border-2 border-purple-200 px-5 py-3 text-sm font-medium text-purple-600 transition-colors hover:border-purple-300 hover:bg-purple-50 bg-white"
                          onClick={() => setIsOpen(false)}
                        >
                          <History className="h-4 w-4 shrink-0" />
                          <span>Transactions</span>
                        </Link>
                        <Link
                          href="/creator/kyc"
                          className="flex items-center justify-center space-x-2 rounded-full border-2 border-purple-200 px-5 py-3 text-sm font-medium text-purple-600 transition-colors hover:border-purple-300 hover:bg-purple-50 bg-white"
                          onClick={() => setIsOpen(false)}
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>KYC</span>
                        </Link>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        setIsLogoutModalOpen(true);
                      }}
                      className="flex items-center justify-center space-x-2 rounded-full border-2 border-red-200 px-5 py-3 text-sm font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 bg-white"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : isMounted ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/creator/signup"
                        className="flex items-center justify-center space-x-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-3 text-[12px] sm:text-sm font-medium text-white shadow-md transition-all hover:shadow-lg"
                        onClick={() => setIsOpen(false)}
                      >
                        <Users className="h-4 w-4 shrink-0" />
                        <span>Join as creator</span>
                      </Link>
                      <Link
                        href="/signup"
                        className="flex items-center justify-center space-x-2 rounded-full border-2 border-purple-200 px-3 py-3 text-[12px] sm:text-sm font-medium text-purple-600 transition-colors hover:border-purple-300 hover:bg-purple-50 bg-white"
                        onClick={() => setIsOpen(false)}
                      >
                        <Briefcase className="h-4 w-4 shrink-0" />
                        <span>Join as brand</span>
                      </Link>
                    </div>
                  </>
                ): <></>
              }
              </div>
            </div>
          </div>
        )}
      </nav>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to log out?"
        confirmText="Log out"
        cancelText="Cancel"
        isDanger={true}
      />
    </header>
  );
};

export default Header;
