import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import ScrollToTop from "./components/ScrollToTop";
import FloatingContactButton from "./components/FloatingContactButton";
import MobileContactBar from "./components/MobileContactBar";

import HomePage from "./pages/HomePage";
import CataloguePage from "./pages/CataloguePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage";

import AdminPage from "./pages/AdminPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminProductEditPage from "./pages/AdminProductEditPage";
import AdminProductNewPage from "./pages/AdminProductNewPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminLogsPage from "./pages/AdminLogsPage";
import AdminImageCleanupPage from "./pages/AdminImageCleanupPage";

import AdminInvoicesPage from "./pages/AdminInvoicesPage";
import AdminInvoiceNewPage from "./pages/AdminInvoiceNewPage";
import AdminInvoiceDetailPage from "./pages/AdminInvoiceDetailPage";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminPage />} />

          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route
            path="/admin/products/:id/edit"
            element={<AdminProductEditPage />}
          />
          <Route path="/admin/products/new" element={<AdminProductNewPage />} />

          <Route path="/admin/invoices" element={<AdminInvoicesPage />} />
          <Route path="/admin/invoices/new" element={<AdminInvoiceNewPage />} />
          <Route
            path="/admin/invoices/:id"
            element={<AdminInvoiceDetailPage />}
          />

          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/logs" element={<AdminLogsPage />} />
          <Route path="/admin/images" element={<AdminImageCleanupPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <div className="flex min-h-screen flex-col pb-20 md:pb-0 print:pb-0">
        <div className="print:hidden">
          <Navbar />
        </div>

        <div className="flex-1">
          <AnimatedRoutes />
        </div>

        <div className="print:hidden">
          <Footer />
          <FloatingContactButton />
          <MobileContactBar />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;