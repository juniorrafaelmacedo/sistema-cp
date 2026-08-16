import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('junior.rafael.macedo@gmail.com');
  const [password, setPassword] = useState('Loki1905@');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setLoginError('Por favor, informe seu e-mail corporativo.');
      return;
    }

    if (!password.trim()) {
      setLoginError('Por favor, informe sua senha de acesso.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // User identity setup
      const userToLogin: UserProfile = {
        id: 'user-rafael',
        name: 'Junior Rafael Macedo',
        email: trimmedEmail,
        role: 'Administrador & Analista de Tesouraria',
        avatarText: 'JM',
        department: 'Tesouraria & Contas a Pagar',
      };

      if (rememberMe) {
        localStorage.setItem('treasury_auth_remember', 'true');
      }

      setIsLoading(false);
      onLoginSuccess(userToLogin);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden selection:bg-teal-600 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-teal-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[280px] h-[280px] bg-emerald-950/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Login Box */}
      <div className="w-full max-w-md relative z-10">
        {/* App Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white font-bold text-2xl shadow-xl shadow-teal-950/50 mb-3">
            T
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            TreasuryAssist
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-400 border border-teal-800/40 font-mono">
              v1.0
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Sistema de Rotina Financeira, Contas a Pagar & Tesouraria (2026)
          </p>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-[#242424] shadow-2xl space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              Identificação & Acesso
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Entre com seu e-mail e senha corporativa para acessar o painel.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-200 text-xs flex items-center gap-2">
              <span className="font-semibold">⚠️</span>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="junior.rafael.macedo@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Senha de Acesso
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-200 p-0.5 transition-colors"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#1c1c1c] border-[#333] text-teal-600 focus:ring-teal-500 focus:ring-offset-0"
                />
                <span>Lembrar meu acesso nesta estação</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Autenticando sessão...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Entrar no Sistema</span>
                </>
              )}
            </button>
          </form>

          {/* Footer inside card */}
          <div className="pt-4 border-t border-[#1f1f1f] flex items-center justify-between text-[11px] text-zinc-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Ambiente Protegido</span>
            </div>
            <span className="font-mono text-zinc-400">Ano Vigente: 2026</span>
          </div>
        </div>

        {/* System Info Footnote */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-zinc-400">
            Controle de rotinas diárias, prazos bancários (Itaú 16h, Bradesco 17h, TED 17h) e diretório financeiro.
          </p>
        </div>
      </div>
    </div>
  );
};
