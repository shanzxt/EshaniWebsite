import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "@/index.css";
import App from "@/App";
import CaseStudyPage from "@/CaseStudyPage";
import { ReadModeProvider } from "@/components/site/ReadMode";

// Native scroll restoration is correct again now that Lenis is gone — the
// browser returns people to where they were on back/forward.

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ReadModeProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/work/:slug" element={<CaseStudyPage />} />
          <Route path="*" element={<App />} />
        </Routes>
        </ReadModeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);