// components/Footer.tsx
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { apiWithoutAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toast } from "sonner";
import {
  Instagram,
  Youtube,
  Music2,
  Twitter,
  Linkedin,
  Facebook,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  Heart,
} from "lucide-react";

const Footer = () => {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [footerLinks, setFooterLinks] = useState(null);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchFooterLinks = async () => {
      try {
        const res = await apiWithoutAuth.get(API_ENDPOINTS.FOOTER_LINKS.LIST);
        if (res.data?.success) {
          setFooterLinks(res.data.data);
        }
      } catch {
        // Silently fail — fallback to defaults
      }
    };
    fetchFooterLinks();
  }, []);

  const handleSubscribe = async () => {
    if (!subscribeEmail || !subscribeEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubscribing(true);
    try {
      const res = await apiWithoutAuth.post(API_ENDPOINTS.LEADS.SUBSCRIBE, { email: subscribeEmail });
      if (res.data?.success) {
        toast.success(res.data.message || "Subscribed successfully!");
        setSubscribeEmail("");
      } else {
        toast.error(res.data?.message || "Failed to subscribe");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to subscribe");
    } finally {
      setIsSubscribing(false);
    }
  };

  const userRole = mounted ? (user?.role || localStorage.getItem("userRole")) : null;

  // Dynamic contact info with fallback
  const contactEmail = footerLinks?.email?.value || "support@hiresphere.com";
  const contactPhone = footerLinks?.phone?.value || "+1 (888) 123-4567";
  const contactAddress = footerLinks?.address?.value || "San Francisco, CA";
  const showEmail = footerLinks ? footerLinks.email !== null : true;
  const showPhone = footerLinks ? footerLinks.phone !== null : true;
  const showAddress = footerLinks ? footerLinks.address !== null : true;

  // Icon map for social platforms
  const socialIconMap = {
    instagram: Instagram,
    youtube: Youtube,
    tiktok: Music2,
    twitter: Twitter,
    linkedin: Linkedin,
    facebook: Facebook,
  };

  const socialLabelMap = {
    instagram: "Instagram",
    youtube: "YouTube",
    tiktok: "TikTok",
    twitter: "Twitter",
    linkedin: "LinkedIn",
    facebook: "Facebook",
  };

  const footerSections = useMemo(() => {
    const sections = [];

    // Always show Company/Product section
    sections.push({
      title: "Product",
      links: [
        { title: "About Us", href: "/about" },
        { title: "Blog", href: "/blog" },
        { title: "Pricing", href: "/pricing" },
        { title: "Search Creators", href: "/creators" },
        { title: "Support Center", href: "/support" },
      ],
    });

    if (userRole === "brand") {
      sections.push({
        title: "Brand Dashboard",
        links: [
          { title: "Home", href: "/brand/home" },
          { title: "Orders", href: "/brand/orders" },
          { title: "Wallet", href: "/brand/wallet" },
          { title: "Transactions", href: "/brand/transactions" },
          { title: "Subscription", href: "/brand/subscription" },
        ],
      });
    } else if (userRole === "creator") {
      sections.push({
        title: "Creator Dashboard",
        links: [
          { title: "Dashboard", href: "/creator/dashboard" },
          { title: "Orders", href: "/creator/orders" },
          { title: "Wallet", href: "/creator/wallet" },
          { title: "Portfolio", href: "/creator/portfolio" },
          { title: "Profile", href: "/creator/profile" },
        ],
      });
    } else {
      // Guest sections
      sections.push({
        title: "For Brands",
        links: [
          { title: "Find Creators", href: "/creators" },
          { title: "Pricing", href: "/pricing" },
          { title: "Case Studies", href: "/blog" },
        ],
      });
      sections.push({
        title: "For Creators",
        links: [
          { title: "Become a Creator", href: "/signup" },
          { title: "Find Jobs", href: "/creators" },
          { title: "Creator Blog", href: "/blog" },
        ],
      });
    }

    // Platforms section (adds value and fills gap)
    sections.push({
      title: "Platforms",
      links: [
        { title: "Instagram", href: "/creators?platform=instagram" },
        { title: "TikTok", href: "/creators?platform=tiktok" },
        { title: "YouTube", href: "/creators?platform=youtube" },
        { title: "UGC Creators", href: "/creators" },
        { title: "All Platforms", href: "/creators" },
      ],
    });

    // Always show Support/Legal
    sections.push({
      title: "Support",
      links: [
        { title: "Help Center", href: "/support" },
        { title: "Terms of Service", href: "/terms" },
        { title: "Privacy Policy", href: "/privacy" },
        { title: "Cookie Policy", href: "/cookies" },
        { title: "Return Policy", href: "/return-policy" },
      ],
    });

    return sections;
  }, [userRole]);

  // Dynamic social links from API with fallback
  const defaultSocialLinks = [
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
    { icon: Music2, href: "https://tiktok.com", label: "TikTok" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  ];

  const socialLinks = footerLinks?.socialLinks?.length
    ? footerLinks.socialLinks.map((link) => ({
        icon: socialIconMap[link.platform] || Instagram,
        href: link.url || "#",
        label: socialLabelMap[link.platform] || link.platform,
      }))
    : defaultSocialLinks;

  return (
    <footer className="relative bg-gradient-to-b from-white to-purple-50/50 pt-20 pb-8">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-purple-200/20 blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-pink-200/20 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl px-4">
        {/* Main Footer Content */}
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-1">
              <div className="relative h-14 w-14 overflow-hidden rounded-xl shrink-0">
                <img src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''}/Logo.png`} alt="HireSphere Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                HireSphere
              </span>
            </Link>

            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              The leading marketplace connecting brands with top influencers and
              content creators across all platforms.
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              {showEmail && (
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Mail className="h-4 w-4 shrink-0 text-purple-500" />
                  <span>{contactEmail}</span>
                </div>
              )}
              {showPhone && (
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Phone className="h-4 w-4 shrink-0 text-purple-500" />
                  <span>{contactPhone}</span>
                </div>
              )}
              {showAddress && (
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 shrink-0 text-purple-500" />
                  <span>{contactAddress}</span>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Follow us
              </h4>
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative"
                    aria-label={social.label}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 blur-md transition-opacity group-hover:opacity-30" />
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-all hover:scale-110 hover:shadow-xl">
                      <social.icon className="h-5 w-5 shrink-0 text-gray-700 transition-colors group-hover:text-purple-600" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-3 lg:col-start-2">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
              {!mounted ? (
                // Skeleton loading state
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-4 animate-pulse">
                    <div className="h-4 w-24 rounded bg-gray-200"></div>
                    <ul className="space-y-4 pt-1">
                      <li className="h-3 w-32 rounded bg-gray-100"></li>
                      <li className="h-3 w-28 rounded bg-gray-100"></li>
                      <li className="h-3 w-24 rounded bg-gray-100"></li>
                      <li className="h-3 w-36 rounded bg-gray-100"></li>
                    </ul>
                  </div>
                ))
              ) : (
                footerSections.map((section) => (
                  <div key={section.title} className="space-y-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                      {section.title}
                    </h4>
                    <ul className="space-y-3">
                      {section.links.map((link) => (
                        <li key={link.title}>
                          <Link
                            href={link.href}
                            className="group inline-flex items-center text-sm text-gray-600 transition-colors hover:text-purple-600"
                          >
                            <span>{link.title}</span>
                            <ArrowRight className="ml-1 h-3 w-3 shrink-0 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-4 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <h3 className="text-2xl font-bold text-white  ">
                Stay in the loop
              </h3>
              <p className="mt-2 text-purple-100">
                Get the latest updates on new creators and features
              </p>
            </div>
            <div className="flex w-full max-w-md flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                  className="w-full rounded-full bg-white/10 px-6 py-3 text-white placeholder-purple-200 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white"
                  disabled={isSubscribing}
                />
              </div>
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="rounded-full bg-white px-8 py-3 font-semibold text-purple-600 transition-all hover:shadow-lg hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center min-w-[120px]"
              >
                {isSubscribing ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex flex-col items-center space-y-2 text-sm text-gray-600 md:flex-row md:space-x-4 md:space-y-0">
              <span className="text-center md:text-left">
                © {new Date().getFullYear()} HireSphere. All rights reserved.
              </span>
              <span className="flex items-center">
                Made with{" "}
                <Heart className="mx-1.5 h-4 w-4 shrink-0 text-pink-500 fill-pink-500" />{" "}
                in SF
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link
                href="/terms"
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/return-policy"
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                Return Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
