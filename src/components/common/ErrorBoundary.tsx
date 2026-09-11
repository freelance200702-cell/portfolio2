import { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from './Button';
import { Heading, Paragraph, MonoLabel } from './Typography';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-6 backdrop-blur-2xl">
          <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-red-950/20 p-8 shadow-[0_0_50px_rgba(239,68,68,0.15)] text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <MonoLabel className="text-red-400 mb-2 block">
              SYSTEM ANOMALY DETECTED
            </MonoLabel>

            <Heading level={2} className="mb-2 text-xl font-bold text-foreground">
              {this.props.fallbackTitle || 'Graphics Pipeline Interrupted'}
            </Heading>

            <Paragraph className="mb-6 text-sm text-muted-foreground">
              {this.state.error?.message ||
                'A WebGL context or runtime error halted the interactive 3D pipeline.'}
            </Paragraph>

            <div className="flex gap-3 justify-center">
              <Button variant="primary" onClick={this.handleReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Reboot System
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
