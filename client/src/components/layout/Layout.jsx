import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Block body on purpose: newer browsers return a Promise from scrollTo, and React must not receive it as a cleanup function.
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function Layout() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brass focus:px-4 focus:py-2 focus:font-semibold">
        Skip to content
      </a>
      <ScrollToTop />
      <Navbar />
      <main id="main" className="min-h-[70vh]">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
