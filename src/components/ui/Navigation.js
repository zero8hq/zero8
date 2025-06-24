"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

// Add this CSS at the top of the file, after the imports
const dropdownAnimation = {
  enter: "transition-all duration-300 ease-out",
  enterFrom: "opacity-0 translate-y-2 scale-95",
  enterTo: "opacity-100 translate-y-0 scale-100",
  leave: "transition-all duration-200 ease-in",
  leaveFrom: "opacity-100 translate-y-0 scale-100",
  leaveTo: "opacity-0 translate-y-2 scale-95",
};

// Creative, modern SVG logo for ZER08 (infinity + zero)
const Zero8Logo = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="28" height="28" rx="8" fill="#18181B" />
    <ellipse
      cx="16"
      cy="16"
      rx="8"
      ry="8"
      stroke="#6366F1"
      strokeWidth="2.5"
      fill="none"
    />
    <ellipse
      cx="16"
      cy="16"
      rx="4.5"
      ry="8"
      stroke="#6366F1"
      strokeWidth="2.5"
      fill="none"
      transform="rotate(45 16 16)"
    />
    <circle cx="16" cy="16" r="2.5" fill="#6366F1" />
  </svg>
);

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
  const [starCount, setStarCount] = useState("002");
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const { data: session, status } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle hover for dropdowns
  const handleMouseEnter = (dropdown) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // If there's an active dropdown and we're switching to a different one
    if (activeDropdown && activeDropdown !== dropdown) {
      // Set a brief timeout to create a smooth transition between dropdowns
      setTimeout(() => {
        setActiveDropdown(dropdown);
      }, 50);
    } else {
      setActiveDropdown(dropdown);
    }
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 100);
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const toggleMobileDropdown = (dropdown) => {
    setActiveMobileDropdown(
      activeMobileDropdown === dropdown ? null : dropdown
    );
  };

  const navItems = [
    { name: "Pricing", href: "/pricing" },
    { name: "Documentation", href: "/docs" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  const resourcesDropdown = [
    {
      icon: (
        <svg
          className="w-5 h-5 mr-1.5"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
        </svg>
      ),
      title: "GitHub",
      description: "Check out our open-source projects and contributions.",
      href: "https://github.com/zero8hq/zero8",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
      title: "Twitter",
      description: "Follow us for the latest updates and announcements.",
      href: "https://twitter.com",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      title: "Docs",
      description: "Access our comprehensive documentation.",
      href: "/docs",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
          <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
        </svg>
      ),
      title: "Blog",
      description: "Read our latest articles and updates.",
      href: "/blog",
    },
  ];

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Sign out error:", error);
      setIsSigningOut(false);
    }
  };

  const userDropdownItems = [
    {
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      title: "Profile",
      href: "/profile",
    },
    {
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      ),
      title: isSigningOut ? "Signing out..." : "Sign Out",
      onClick: handleSignOut,
      disabled: isSigningOut,
    },
  ];

  return (
    <header className="z-50 w-full fixed top-0 left-0 right-0">
      {/* Desktop floating nav */}
      <div className="hidden md:flex justify-center w-full pt-5 pb-3">
        <div className="fixed top-5 left-1/2 -translate-x-1/2 flex items-center justify-between px-3 py-2 rounded-xl shadow-2xl bg-[#18181B]/95 border border-[#232329] w-[calc(100%-40px)] max-w-3xl mx-auto h-[54px] backdrop-blur-lg z-50">
          {/* Logo */}
          <Link href="/" className="flex items-center mr-6">
            <Zero8Logo />
            <span className="ml-2.5 text-lg font-semibold text-white tracking-tight">
              ZER08
            </span>
            <span className="ml-2 text-xs py-0.5 px-1.5 bg-[#333333] text-gray-300 rounded-md font-medium">
              beta
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center space-x-2 gap-1"
            ref={dropdownRef}
          >
            {/* Resources Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("resources")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center ${
                  activeDropdown === "resources"
                    ? "bg-[#222222] text-white"
                    : "text-gray-300 hover:text-white hover:bg-[#1a1a1a]"
                }`}
              >
                Resources
                <svg
                  className={`ml-1.5 w-4 h-4 transition-transform duration-200 ${
                    activeDropdown === "resources" ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                className={`absolute left-0 mt-2 w-[480px] rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] shadow-lg overflow-hidden z-50 ${
                  dropdownAnimation.enter
                } ${
                  activeDropdown === "resources"
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-3 px-2">
                    Resources
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {resourcesDropdown.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="flex items-start p-3 rounded-md hover:bg-[#222222] transition-colors group"
                      >
                        <div className="flex-shrink-0 mt-0.5 mr-3 text-gray-400 group-hover:text-gray-300 transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 group-hover:text-gray-300 transition-colors">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Link */}
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                pathname === "/dashboard"
                  ? "bg-[#222222] text-white"
                  : "text-gray-300 hover:text-white hover:bg-[#222222]"
              }`}
            >
              Dashboard
            </Link>

            {/* Pricing Link */}
            <Link
              href="/pricing"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                pathname === "/pricing"
                  ? "bg-[#222222] text-white"
                  : "text-gray-300 hover:text-white hover:bg-[#222222]"
              }`}
            >
              Pricing
            </Link>

            <div className="flex items-center mr-2 ml-2">
              <a
                href="https://github.com/zero8hq/zero8"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-2 py-1 rounded-md text-sm font-medium bg-[#000000] text-gray-300 transition-colors border border-[#000000] group"
              >
                <svg
                  className="w-4 h-4 mr-1.5"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                <div className="flex items-center">
                  <svg
                    className="w-3.5 h-3.5 mr-1 text-[#9197a3] group-hover:text-amber-400 transition-colors"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium text-sm">{starCount}</span>
                </div>
              </a>
            </div>

            {/* User Profile or Sign In */}
            {status === "loading" ? (
              <div className="ml-2 px-3 py-1.5 rounded-md bg-[#1a1a1a] flex items-center">
                <div className="w-7 h-7 rounded-full bg-[#222222] animate-pulse"></div>
                <div className="ml-2 w-4 h-4 rounded bg-[#222222] animate-pulse"></div>
              </div>
            ) : status === "authenticated" ? (
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter("user")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`ml-2 flex items-center px-3 py-1.5 rounded-md transition-all duration-300 ${
                    activeDropdown === "user"
                      ? "bg-[#222222] text-white"
                      : "text-gray-300 hover:text-white hover:bg-[#1a1a1a]"
                  }`}
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={50}
                      height={50}
                      className="rounded-full w-7 h-7"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {session.user?.name?.[0] ||
                        session.user?.email?.[0] ||
                        "?"}
                    </div>
                  )}
                  <svg
                    className={`ml-2 w-4 h-4 transition-transform duration-200 ${
                      activeDropdown === "user" ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* User Dropdown */}
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] shadow-lg overflow-hidden z-50 ${
                    dropdownAnimation.enter
                  } ${
                    activeDropdown === "user"
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <div className="p-2">
                    {userDropdownItems.map((item) =>
                      item.href ? (
                        <Link
                          key={item.title}
                          href={item.href}
                          className="flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#222222] rounded-md transition-colors duration-150"
                        >
                          {item.icon}
                          <span className="ml-2">{item.title}</span>
                        </Link>
                      ) : (
                        <button
                          key={item.title}
                          onClick={item.onClick}
                          className="cursor-pointer flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#222222] rounded-md transition-colors duration-150"
                        >
                          {item.icon}
                          <span className="ml-2">{item.title}</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/signin"
                className="ml-2 px-4 py-2 rounded-md text-sm font-medium bg-white text-gray-900 hover:bg-gray-200 transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden">
        {/* Fixed top bar */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-[#18181B] border-b border-[#232329] px-4 flex items-center justify-between z-50">
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Zero8Logo />
              <span className="ml-2.5 text-lg font-semibold text-white tracking-tight">
                ZER08
              </span>
              <span className="ml-2 text-xs py-0.5 px-1.5 bg-[#333333] text-gray-300 rounded-md font-medium">
                beta
              </span>
            </Link>

            {/* GitHub Stars (Compact) */}
            <div className="flex items-center mr-2">
              <a
                href="https://github.com/zero8hq/zero8"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-2 py-1 rounded-md text-sm font-medium bg-[#000000] text-gray-300 transition-colors border border-[#000000] group"
              >
                <svg
                  className="w-4 h-4 mr-1.5"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                <div className="flex items-center">
                  <svg
                    className="w-3.5 h-3.5 mr-1 text-[#9197a3] group-hover:text-amber-400 transition-colors"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium text-sm">{starCount}</span>
                </div>
              </a>
            </div>
          </div>

          {/* Menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-300 hover:text-white transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Slide-out menu */}
        <div
          className={`fixed inset-0 z-40 transition-all duration-300 ${
            isMobileMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
              isMobileMenuOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu panel */}
          <div
            className={`fixed right-0 top-16 bottom-0 w-[280px] bg-[#18181B] border-l border-[#232329] transform transition-transform duration-300 ease-out ${
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* User profile section */}
            {status === "loading" ? (
              <div className="p-4 border-b border-[#232329]">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#232329] animate-pulse" />
                  <div className="ml-3 flex-1">
                    <div className="h-4 w-24 bg-[#232329] rounded animate-pulse" />
                    <div className="h-3 w-32 bg-[#232329] rounded animate-pulse mt-2" />
                  </div>
                </div>
              </div>
            ) : status === "authenticated" ? (
              <div className="p-4 border-b border-[#232329]">
                <div className="flex items-center">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {session.user?.name?.[0] ||
                        session.user?.email?.[0] ||
                        "?"}
                    </div>
                  )}
                  <div className="ml-3">
                    <div className="font-medium text-white">
                      {session.user?.name || "User"}
                    </div>
                    <div className="text-sm text-gray-400">
                      {session.user?.email}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Navigation items */}
            <div className="py-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                    pathname === item.href
                      ? "text-white bg-[#232329]"
                      : "text-gray-400 hover:text-white hover:bg-[#1d1d20]"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User actions */}
            {status === "authenticated" ? (
              <div className="absolute bottom-0 left-0 right-0 border-t border-[#232329]">
                {userDropdownItems.map((item) =>
                  item.href ? (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="flex items-center px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-[#1d1d20] transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </Link>
                  ) : (
                    <button
                      key={item.title}
                      onClick={() => {
                        item.onClick();
                        setIsMobileMenuOpen(false);
                      }}
                      disabled={item.disabled}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-[#1d1d20] transition-colors duration-200 disabled:opacity-50"
                    >
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </button>
                  )
                )}
              </div>
            ) : (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#232329]">
                <Link
                  href="/signin"
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium bg-white text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
