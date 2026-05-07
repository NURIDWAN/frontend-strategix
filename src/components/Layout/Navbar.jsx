import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Moon, Sun } from "lucide-react";

function Navbar({ isDarkMode, toggleDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  // Tutup menu otomatis saat viewport berubah ke desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-gray-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md dark:border-gray-700">
      <div className="container flex items-center justify-between px-3 md:px-6 py-0 mx-auto max-w-7xl">
        {/* ========== LOGO ========== */}
        <Link to="/" className="flex items-center space-x-3">
          <img
            src="./assets/logo/logo-navbar.png"
            alt="Grapadi Strategix Icon"
            className="object-contain w-auto h-10 md:h-12"
          />
          <div className="flex flex-col gap-0">
            <span className="text-sm md:text-base font-bold leading-tight" style={{ color: "#114d0b" }}>
              Grapadi Strategix
            </span>
          </div>
        </Link>

        {/* ========== DESKTOP MENU ========== */}
        <div className="items-center hidden space-x-4 md:flex lg:space-x-8">
          <Link
            to="/"
            className={`text-xs md:text-base font-medium transition-colors ${location.pathname === "/" ? "font-bold" : "text-gray-700 dark:text-gray-300"}`}
            style={{ color: location.pathname === "/" ? (isDarkMode ? "#10B517" : "#167814") : "" }}
            onMouseEnter={(e) => {
              if (location.pathname !== "/") e.currentTarget.style.color = "#167814";
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== "/") e.currentTarget.style.color = "";
            }}
          >
            Home
          </Link>
          <Link
            to="/features"
            className={`text-xs md:text-base font-medium transition-colors ${location.pathname === "/features" ? "font-bold" : "text-gray-700 dark:text-gray-300"}`}
            style={{ color: location.pathname === "/features" ? (isDarkMode ? "#10B517" : "#167814") : "" }}
            onMouseEnter={(e) => {
              if (location.pathname !== "/features") e.currentTarget.style.color = "#167814";
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== "/features") e.currentTarget.style.color = "";
            }}
          >
            Features
          </Link>
          <Link
            to="/pricing"
            className={`text-xs md:text-base font-medium transition-colors ${location.pathname === "/pricing" ? "font-bold" : "text-gray-700 dark:text-gray-300"}`}
            style={{ color: location.pathname === "/pricing" ? (isDarkMode ? "#10B517" : "#167814") : "" }}
            onMouseEnter={(e) => {
              if (location.pathname !== "/pricing") e.currentTarget.style.color = "#167814";
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== "/pricing") e.currentTarget.style.color = "";
            }}
          >
            Pricing
          </Link>
          <Link
            to="/articles"
            className={`text-xs md:text-base font-medium transition-colors ${location.pathname.startsWith("/articles") ? "font-bold" : "text-gray-700 dark:text-gray-300"}`}
            style={{ color: location.pathname.startsWith("/articles") ? (isDarkMode ? "#10B517" : "#167814") : "" }}
            onMouseEnter={(e) => {
              if (!location.pathname.startsWith("/articles")) e.currentTarget.style.color = "#167814";
            }}
            onMouseLeave={(e) => {
              if (!location.pathname.startsWith("/articles")) e.currentTarget.style.color = "";
            }}
          >
            Articles
          </Link>
          <Link
            to="/faq"
            className={`text-xs md:text-base font-medium transition-colors ${location.pathname === "/faq" ? "font-bold" : "text-gray-700 dark:text-gray-300"}`}
            style={{ color: location.pathname === "/faq" ? (isDarkMode ? "#10B517" : "#167814") : "" }}
            onMouseEnter={(e) => {
              if (location.pathname !== "/faq") e.currentTarget.style.color = "#167814";
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== "/faq") e.currentTarget.style.color = "";
            }}
          >
            FAQ
          </Link>
          <Link
            to="/terms"
            className={`text-xs md:text-base font-medium transition-colors ${location.pathname === "/terms" ? "font-bold" : "text-gray-700 dark:text-gray-300"}`}
            style={{ color: location.pathname === "/terms" ? (isDarkMode ? "#10B517" : "#167814") : "" }}
            onMouseEnter={(e) => {
              if (location.pathname !== "/terms") e.currentTarget.style.color = "#167814";
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== "/terms") e.currentTarget.style.color = "";
            }}
          >
            Terms
          </Link>
          {/* <a
            href="#about"
            className="font-medium text-gray-700 transition-colors dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
          >
            About
          </a> */}
          {/* <a
            href="#contact"
            className="font-medium text-gray-700 transition-colors dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
          >
            Contact
          </a> */}
        </div>

        {/* ========== DARK MODE + CTA BUTTONS (DESKTOP) ========== */}
        <div className="items-center hidden space-x-2 md:space-x-3 md:flex">
          <button onClick={toggleDarkMode} className="p-1.5 md:p-2 text-gray-600 transition-colors rounded-lg dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Toggle dark mode">
            {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-600" />}
          </button>

          <Link
            to="/login"
            className="hidden lg:block text-xs md:text-sm font-medium text-gray-700 transition-colors dark:text-gray-300"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#084404")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-white px-3 md:px-5 py-1 md:py-2 rounded-lg transition-all text-xs md:text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
            style={{ backgroundColor: "#167814" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0a5505")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#167814")}
          >
            Mulai Gratis
          </Link>
          <Link
            to="/register-consultant"
            className="hidden xl:block text-[#167814] dark:text-[#10B517] border border-[#167814] dark:border-[#10B517] px-3 md:px-4 py-1 md:py-2 rounded-lg transition-all text-xs md:text-sm font-semibold hover:bg-[#167814] hover:text-white dark:hover:bg-[#10B517] dark:hover:text-gray-900"
          >
            Gabung Konsultan
          </Link>
        </div>

        {/* ========== HAMBURGER BUTTON (MOBILE) ========== */}
        <button className="z-50 text-gray-800 md:hidden focus:outline-none dark:text-gray-100 p-1" onClick={toggleMenu}>
          {isOpen ? <X size={18} className="dark:text-white" /> : <Menu size={18} />}
        </button>

        {/* ========== MOBILE MENU (FULLSCREEN) ========== */}
        <div
          className={`fixed inset-0 z-40 flex flex-col items-center justify-center dark:bg-gray-800 bg-white h-screen transition-all duration-500 ease-in-out transform ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
            }`}
        >
          <ul className="w-full space-y-2 md:space-y-4 text-sm md:text-base font-medium text-center dark:text-white px-4">
            <li>
              <Link
                to="/"
                className={`transition-colors ${location.pathname === "/" ? "font-bold" : "hover:text-green-600"}`}
                style={{ color: location.pathname === "/" ? (isDarkMode ? "#10B517" : "#167814") : "" }}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/features"
                className={`transition-colors ${location.pathname === "/features" ? "font-bold" : "hover:text-green-600"}`}
                style={{ color: location.pathname === "/features" ? (isDarkMode ? "#10B517" : "#167814") : "" }}
                onClick={() => setIsOpen(false)}
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                to="/pricing"
                className={`transition-colors ${location.pathname === "/pricing" ? "font-bold" : "hover:text-green-600"}`}
                style={{ color: location.pathname === "/pricing" ? (isDarkMode ? "#10B517" : "#167814") : "" }}
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                to="/articles"
                className={`transition-colors ${location.pathname.startsWith("/articles") ? "font-bold" : "hover:text-green-600"}`}
                style={{ color: location.pathname.startsWith("/articles") ? (isDarkMode ? "#10B517" : "#167814") : "" }}
                onClick={() => setIsOpen(false)}
              >
                Articles
              </Link>
            </li>
            <li>
              <Link
                to="/faq"
                className={`transition-colors ${location.pathname === "/faq" ? "font-bold" : "hover:text-green-600"}`}
                style={{ color: location.pathname === "/faq" ? (isDarkMode ? "#10B517" : "#167814") : "" }}
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className={`transition-colors ${location.pathname === "/terms" ? "font-bold" : "hover:text-green-600"}`}
                style={{ color: location.pathname === "/terms" ? (isDarkMode ? "#10B517" : "#167814") : "" }}
                onClick={() => setIsOpen(false)}
              >
                Terms
              </Link>
            </li>
            <li className="w-full px-2 md:px-8 mt-2">
              <Link to="/register" className="block w-full py-1 md:py-2 text-center text-green-600 transition border-2 border-green-600 rounded-md hover:bg-green-50 dark:hover:bg-gray-800 text-xs md:text-sm" onClick={() => setIsOpen(false)}>
                Sign Up
              </Link>
            </li>
            <li className="w-full px-2 md:px-8">
              <Link to="/register-consultant" className="block w-full py-1 md:py-2 text-center text-blue-600 transition border-2 border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-gray-800 text-xs md:text-sm" onClick={() => setIsOpen(false)}>
                Register Consultant
              </Link>
            </li>
            <li className="w-full px-2 md:px-8">
              <Link to="/login" className="block w-full py-1 md:py-2 text-center text-white transition bg-green-600 rounded-md hover:bg-green-700 text-xs md:text-sm" onClick={() => setIsOpen(false)}>
                Sign In
              </Link>
            </li>
            <li className="mt-2 md:mt-4">
              <button
                onClick={toggleDarkMode}
                className="p-1 md:p-2 text-gray-600 transition-colors bg-gray-100 rounded-full dark:bg-gray-800 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-600" />}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
