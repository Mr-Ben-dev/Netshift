/**
 * PermissionsGate Component
 *
 * Wrapper that checks SideShift permissions and blocks execution in restricted regions.
 * Shows informative message for geo-blocked users.
 */

import { Loader2, XCircle } from "lucide-react";
import { usePermissions } from "../hooks/useNetShift";
import { Alert, AlertDescription } from "./ui/alert";

interface PermissionsGateProps {
  userIp?: string;
  children: React.ReactNode;
}

export function PermissionsGate({ userIp, children }: PermissionsGateProps) {
  const { data, error, isLoading } = usePermissions(userIp);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        <span className="ml-3 text-muted-foreground">
          Checking availability...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-destructive bg-destructive/10">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Unable to check permissions</strong>
          <p className="mt-2 text-sm">
            There was an error verifying service availability. Please try again
            later.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Check if shifts can be created (geo-blocking)
  if (!data?.createShift) {
    return (
      <Alert className="border-destructive bg-destructive/10">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Service Unavailable in Your Region</strong>
          <p className="mt-2 text-sm">
            NetShift uses SideShift.ai for crypto settlements, which is not
            available in restricted jurisdictions. This includes the United
            States and other regions with regulatory restrictions on crypto
            services.
          </p>
          <p className="mt-2 text-sm">
            <strong>What you can still do:</strong>
          </p>
          <ul className="mt-1 text-sm list-disc list-inside ml-2">
            <li>Browse exchange rates and pairs</li>
            <li>Create and compute settlements (view netting results)</li>
            <li>Export settlement data</li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            For more information, visit{" "}
            <a
              href="https://sideshift.ai/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              SideShift Terms of Service
            </a>
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
