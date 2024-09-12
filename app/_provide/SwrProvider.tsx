"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from "react";
import { SWRConfig } from "swr";
import { defaultValues } from "../_swr/config";

export const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig value={defaultValues}>
      <ToastContainer position="top-right" />
      {children}
    </SWRConfig>
  );
};
