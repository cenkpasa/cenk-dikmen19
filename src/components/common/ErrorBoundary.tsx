import React, { Component, ErrorInfo, ReactNode } from 'react';
import Button from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Pick<State, 'hasError' | 'error'> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReport = () => {
    const { error, errorInfo } = this.state;
    const subject = "Uygulama Hatası Raporu";
    const body = `
      Merhaba, uygulamada bir hata ile karşılaştım. Detaylar aşağıdadır:

      Hata Mesajı:
      ${error?.toString()}

      Bileşen Yığını:
      ${errorInfo?.componentStack}
      
      --- Lütfen hatanın nasıl oluştuğunu buraya yazın ---
    `;
    window.location.href = `mailto:destek@cnkkesicitakim.com.tr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-cnk-bg-light">
            <div className="p-8 max-w-lg w-full bg-cnk-panel-light rounded-lg shadow-xl text-center border-t-4 border-cnk-accent-red">
                <i className="fas fa-bug text-5xl text-cnk-accent-red mb-4"></i>
                <h2 className="text-2xl font-bold text-cnk-txt-primary-light mb-2">Beklenmedik Bir Hata Oluştu</h2>
                <p className="text-cnk-txt-secondary-light mb-6">
                    Bir şeyler ters gitti. Sayfayı yenilemeyi deneyebilir veya hatayı ekibimize bildirebilirsiniz.
                </p>
                <div className="flex justify-center gap-4">
                    <Button onClick={() => window.location.reload()} variant="primary">
                        Sayfayı Yenile
                    </Button>
                    <Button onClick={this.handleReport} variant="secondary" icon="fas fa-paper-plane">
                        Hatayı Bildir
                    </Button>
                </div>
                <details className="mt-6 text-left bg-cnk-bg-light p-3 rounded-md">
                    <summary className="cursor-pointer text-sm text-cnk-txt-muted-light">Teknik Detaylar</summary>
                    <pre className="mt-2 text-xs overflow-auto">
                        {this.state.error?.toString()}
                        <br />
                        {this.state.errorInfo?.componentStack}
                    </pre>
                </details>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;