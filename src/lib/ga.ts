import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const MID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

const init = (() => {
  let done = false;
  return () => {
    if (done || !MID) return;
    done = true;
    const s = document.createElement("script");
    s.src = `https://www.googletagmanager.com/gtag/js?id=${MID}`;
    s.async = true;
    document.head.appendChild(s);
    (window as any).dataLayer = (window as any).dataLayer ?? [];
    (window as any).gtag = function () { (window as any).dataLayer.push(arguments); };
    (window as any).gtag("js", new Date());
    (window as any).gtag("config", MID, { send_page_view: false });
  };
})();

export const usePageTracking = () => {
  const location = useLocation();
  useEffect(() => {
    init();
    if (!MID) return;
    (window as any).gtag?.("event", "page_view", {
      page_path: location.pathname + location.search,
    });
  }, [location]);
};
