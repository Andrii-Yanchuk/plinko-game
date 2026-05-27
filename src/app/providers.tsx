"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState, type ReactNode } from "react";
import toast, { resolveValue, ToastBar, Toaster } from "react-hot-toast";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
          className: "system-toast",
          duration: 4_000,
          iconTheme: {
            primary: "#F8FAFC",
            secondary: "#171C2C",
          },
          style: {
            background: "#1A1F2E",
            border: "1px solid #2A2F3E",
            borderRadius: "8px",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.28)",
            boxSizing: "border-box",
            color: "#F8FAFC",
            fontSize: "14px",
            fontWeight: 600,
            height: "54px",
            lineHeight: "20px",
            maxWidth: "calc(100vw - 32px)",
            minWidth: "356px",
            padding: "0 12px 0 14px",
            textAlign: "left",
            width: "fit-content",
          },
        }}
      >
        {(activeToast) => (
          <ToastBar toast={activeToast}>
            {({ icon }) => (
              <>
                <div
                  style={{
                    alignItems: "center",
                    display: "flex",
                    flex: 1,
                    gap: "10px",
                    minWidth: 0,
                  }}
                >
                  {icon}
                  <div
                    {...activeToast.ariaProps}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {resolveValue(activeToast.message, activeToast)}
                  </div>
                </div>
                <button
                  aria-label="Close notification"
                  onClick={() => toast.dismiss(activeToast.id)}
                  style={{
                    alignItems: "center",
                    border: 0,
                    borderRadius: "6px",
                    color: "#9CA3AF",
                    cursor: "pointer",
                    display: "inline-flex",
                    flex: "0 0 auto",
                    height: "28px",
                    justifyContent: "center",
                    marginLeft: "8px",
                    padding: 0,
                    width: "28px",
                  }}
                  type="button"
                >
                  <X aria-hidden="true" size={14} strokeWidth={2.5} />
                </button>
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
    </QueryClientProvider>
  );
}
