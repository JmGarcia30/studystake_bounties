import type { ReactNode } from "react";
import { AuthFlowRouter } from "./AuthFlowRouter";

interface Props {
  children: ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  return <AuthFlowRouter>{children}</AuthFlowRouter>;
}
