import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

/**
 * Production error boundary component that isolates sub-view runtime crashes
 * and provides a graceful retry action without crashing the entire single-page app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Đã có lỗi xảy ra trong quá trình hiển thị giao diện.',
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary caught exception]:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      errorMessage: null,
    });
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      const title = this.props.fallbackTitle || 'Gặp sự cố hiển thị';
      const message =
        this.props.fallbackMessage ||
        this.state.errorMessage ||
        'Đã xảy ra lỗi không mong muốn. Vui lòng thử tải lại trang hoặc liên hệ hỗ trợ.';

      return (
        <div className="min-h-[360px] flex items-center justify-center p-6 bg-theme-surface border border-theme rounded-2xl shadow-sm m-4 text-center">
          <div className="max-w-md space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-theme-error/10 text-theme-error flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
              <p className="text-xs text-theme-secondary leading-relaxed">{message}</p>
            </div>

            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-theme-accent hover:bg-theme-accent-hover rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Thử lại</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
