"use client";

import type { ErrorInfo, ReactNode } from "react";

import { Component } from "react";

import { Error } from "./error";

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
    if (this.state.hasError && this.state.error) {
      return (
        <Error
          error={this.state.error.toString()}
          errorInfo={this.state.errorInfo}
          resetErrorBoundary={this.resetErrorBoundary.bind(this)}
        />
      );
    }

    return this.props.children;
  }
}
