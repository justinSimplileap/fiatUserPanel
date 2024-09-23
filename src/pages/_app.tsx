import { type AppType } from "next/dist/shared/lib/utils";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import { useEffect } from "react";
import localStorageService from "~/service/LocalstorageService";
import "~/styles/globals.css";
import hydrateStore from "~/helpers/hydrateStore";
import { checkUserByIP } from "~/service/ApiRequests";
import { logout } from "~/helpers/helper";
import Home from ".";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";

const MyApp: AppType = ({ Component, pageProps }) => {
  const router = useRouter();

  function NavigateToLogin() {
    const token = localStorageService.getLocalAccessToken();
    const unprotectedRoutes = [
      "/",
      "/auth/signup",
      "/auth/login",
      /^\/ecompayment\/[^/]+$/,
      /^\/invoices\/[^/]+$/,
      "EcomInvoicePayTwo",
      "EcomInvoiceScannerTwo",
      "InvoicePay",
      "InvoiceScanner",
    ];

    const isUnprotected = unprotectedRoutes.some((route) => {
      if (typeof route === "string") {
        return route === window.location.pathname;
      } else if (route instanceof RegExp) {
        return route.test(window.location.pathname);
      }
      return false;
    });

    if (token && isUnprotected) {
      if (/^\/invoices\/[^/]+$/.test(window.location.pathname)) {
        const invoiceId = window.location.pathname.split("/")[2];
        router.push(`/invoices/${invoiceId}`);
      } else {
        router.push("/app/dashboard");
      }
    } else if (window.location.pathname === "/auth/resetPassword") {
      router.push("/auth/resetPassword");
    } else if (!token && !isUnprotected) {
      router.push("/auth/login");
    }
  }

  async function findMyIp() {
    try {
      const ipAddress = await fetch("https://api.ipify.org?format=json");
      const res = await ipAddress.json();

      localStorageService.setIpAddress(res?.ip);

      const ip = res?.ip;

      if (ip) {
        const [res_en, error] = await ApiHandler(checkUserByIP, { ip });

        if (error) {
          router.push("/auth/ipBlocked");
          return;
        }

        if (res_en?.success) {
          NavigateToLogin();
        }
      }
    } catch (e) {
      NavigateToLogin();
    }
  }

  useEffect(() => {
    hydrateStore();
    findMyIp();

    const intervalId = setInterval(() => {
      everyMinute();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  function everyMinute() {
    const security = localStorageService.getSecurityBody();

    if (security) {
      const logoutMinutes = Number(security?.logoutMinutes ?? 0) - 1;

      if (logoutMinutes === 0) {
        toast.error(security?.messageBeforeLogout);
      }

      localStorageService.updateSecurityBody({
        logoutMinutes: logoutMinutes.toString(),
      });

      if (logoutMinutes < 0) {
        const timeoutPadding = Number(security?.timeoutPadding ?? 0) - 1 ?? 0;

        localStorageService.updateSecurityBody({
          timeoutPadding: timeoutPadding.toString(),
        });

        if (timeoutPadding === 0) {
          toast.error(security?.messageAfterLogout);
          logout();
        }
      }
    }
  }

  return (
    <div>
      <Home />
      <Component {...pageProps} />
      <Toaster />
    </div>
  );
};

export default MyApp;
