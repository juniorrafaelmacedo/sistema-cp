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
  Trash2,
  Info,
} from 'lucide-react';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile, remember: boolean) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  // Load saved credentials only if the user previously explicitly chose to save them
  const hasSavedPasswordChoice = localStorage.getItem('treasury_save_password_choice') === 'true';
  const initialSavedEmail = localStorage.getItem('treasury_saved_email') || 'junior.rafael.macedo@gmail.com';
  const initialSavedPassword = hasSavedPasswordChoice
    ? localStorage.getItem('treasury_saved_password') || ''
    : '';

  const [email, setEmail] = useState(initialSavedEmail);
  const [password, setPassword] = useState(initialSavedPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(hasSavedPasswordChoice);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [credentialsClearedMessage, setCredentialsClearedMessage] = useState<string | null>(null);

  const handleClearSavedCredentials = () => {
    try {
      localStorage.removeItem('treasury_saved_password');
      localStorage.removeItem('treasury_save_password_choice');
      localStorage.removeItem('treasury_auth_remember');
      setPassword('');
      setRememberPassword(false);
      setCredentialsClearedMessage('Senha salva removida da memória deste navegador com sucesso.');
      setTimeout(() => setCredentialsClearedMessage(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setLoginError('Por favor, informe seu e-mail corporativo.');
      return;
    }

    if (!password.trim()) {
      setLoginError('Por favor, digite sua senha de acesso.');
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

      try {
        if (rememberPassword) {
          localStorage.setItem('treasury_saved_email', trimmedEmail);
          localStorage.setItem('treasury_saved_password', password);
          localStorage.setItem('treasury_save_password_choice', 'true');
          localStorage.setItem('treasury_auth_remember', 'true');
        } else {
          localStorage.setItem('treasury_saved_email', trimmedEmail);
          localStorage.removeItem('treasury_saved_password');
          localStorage.setItem('treasury_save_password_choice', 'false');
          localStorage.removeItem('treasury_auth_remember');
        }
      } catch (e) {
        console.error('Erro ao gerenciar persistência de senha:', e);
      }

      setIsLoading(false);
      onLoginSuccess(userToLogin, rememberPassword);
    }, 350);
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

          {credentialsClearedMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{credentialsClearedMessage}</span>
            </div>
          )}

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-200 text-xs flex items-center gap-2">
              <span className="font-semibold">⚠️</span>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
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
                  placeholder="seu.email@empresa.com"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Senha de Acesso
                </label>
                {hasSavedPasswordChoice && (
                  <button
                    type="button"
                    onClick={handleClearSavedCredentials}
                    className="text-[11px] text-amber-400/90 hover:text-amber-300 flex items-center gap-1 transition-colors"
                    title="Remover senha da memória do navegador"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Esquecer senha salva</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
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

            {/* Checkbox to explicitly choose to save password */}
            <div className="p-3 rounded-xl bg-[#181818] border border-[#262626] space-y-1.5">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-200 select-none">
                <input
                  type="checkbox"
                  checked={rememberPassword}
                  onChange={e => setRememberPassword(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded bg-[#121212] border-[#3a3a3a] text-teal-600 focus:ring-teal-500 focus:ring-offset-0 cursor-pointer"
                />
                <div>
                  <span className="font-medium text-zinc-200">
                    Salvar senha neste navegador
                  </span>
                  <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                    Deixe desmarcado para digitar sua senha sempre que acessar o sistema pela internet.
                  </p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
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
