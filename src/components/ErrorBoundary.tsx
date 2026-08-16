import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearAndReset = () => {
    if (window.confirm('Deseja recarregar o sistema e restaurar o estado padrão?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#141414] border border-red-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-950/70 border border-red-800 text-red-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Ops, algo inesperado aconteceu</h2>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                {this.state.error?.message || 'Ocorreu um erro temporário na renderização.'}
              </p>
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar Aplicação</span>
              </button>
              <button
                onClick={this.handleClearAndReset}
                className="w-full py-2.5 px-4 rounded-xl bg-[#202020] hover:bg-[#282828] text-zinc-300 text-xs font-medium transition-colors"
              >
                Restaurar Configurações Iniciais
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
