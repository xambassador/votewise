"use client";

import type { ErrorInfo, ReactNode } from "react";

import { Component } from "react";

import { Button } from "./button";
import { AlertCircleSolid } from "./icons/alert-circle-solid";
import { RotateRightIcon } from "./icons/rotate-right";

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  canRetry?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  isDevMode: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isDevMode: process.env.NODE_ENV === "development"
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo, error });
    // TODO: Report error
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center size-full p-6">
          <div className="w-full max-w-md bg-nobelBlack-100 rounded-lg shadow-xl overflow-hidden border border-black-400">
            <div className="p-6">
              <div className="flex items-center justify-center size-16 mx-auto mb-4 rounded-full bg-black-500 text-orange-50">
                <AlertCircleSolid className="size-8" />
              </div>

              <h2 className="mb-2 text-2xl font-bold text-center text-gray-100">Well, This Is Embarrassing...</h2>

              <div className="mb-6 text-center text-gray-300">
                <p className="mb-4">
                  The hamsters powering this section have gone on strike. Union negotiations in progress.
                </p>
                {this.state.isDevMode && this.state.error && (
                  <div className="mt-4 p-3 bg-black-800 rounded-md text-left overflow-auto">
                    <p className="text-sm font-mono text-gray-300 mb-2">{this.state.error.toString()}</p>
                    {this.state.errorInfo && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                          Stack trace
                        </summary>
                        <pre className="mt-2 text-xs overflow-auto p-2 bg-black-900 rounded border border-black-600 text-gray-400">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
                {!this.state.isDevMode && (
                  <div className="mt-4 p-3 bg-black-800 rounded-md text-left">
                    <p className="text-sm font-mono text-gray-300 mb-2">
                      Something went wrong. Try again or come back later.
                    </p>
                  </div>
                )}
              </div>

              <Button onClick={this.resetErrorBoundary} className="w-full group">
                <RotateRightIcon className="mr-2 group-hover:rotate-[-60deg] transition-transform group-hover:transition-transform group-active:rotate-0 duration-300 group-hover:duration-300" />
                Try again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
