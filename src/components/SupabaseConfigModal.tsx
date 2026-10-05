import React, { useState } from 'react';
import { X, Database, Check, Copy, ExternalLink, ShieldCheck, Terminal, AlertCircle } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, getSupabaseClient, SUPABASE_SQL_SCHEMA } from '../services/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, anonKey);

    setTesting(true);
    setStatusMessage(null);

    try {
      const client = getSupabaseClient();
      if (!client) {
        setStatusMessage({
          text: 'Configuração salva localmente. Para ativar a sincronização em nuvem, informe URL e Chave válidas.',
          isError: false,
        });
        setTesting(false);
        return;
      }

      // Try pinging the orders table or fetching count
      const { error } = await client.from('orders').select('id').limit(1);

      if (error && !error.message.includes('permission denied')) {
        setStatusMessage({
          text: `Aviso ao conectar com a tabela 'orders': ${error.message}. Lembre-se de rodar o Script SQL abaixo no Supabase SQL Editor.`,
          isError: true,
        });
      } else {
        setStatusMessage({
          text: 'Conexão com o Supabase testada com sucesso! Seus pedidos serão salvos no banco de dados em nuvem.',
          isError: false,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        text: `Erro ao testar conexão: ${err?.message || 'Verifique as credenciais.'}`,
        isError: true,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleCopySql = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">
                Conexão Supabase & GitHub
              </h2>
              <p className="text-xs text-stone-400">
                Banco de dados em nuvem e hospedagem do Restaurante Kaipira
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-stone-700">
          {/* Explanation notice */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              O aplicativo já funciona imediatamente!
            </span>
            <p className="text-stone-700">
              Por padrão, os pedidos são salvos no armazenamento local do navegador e podem ser enviados ao WhatsApp do restaurante. Para salvar em nuvem no seu projeto Supabase, basta colar as credenciais abaixo:
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                placeholder="https://sua-empresa.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-amber-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-800 block mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-amber-700"
              />
            </div>

            {statusMessage && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  statusMessage.isError
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{statusMessage.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={testing}
              className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>{testing ? 'Testando conexão...' : 'Salvar & Testar Conexão Supabase'}</span>
            </button>
          </form>

          {/* SQL Script Section for Supabase Setup */}
          <div className="border-t border-stone-200 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-amber-700" />
                  <span>Script SQL para o Supabase (Tabela Orders)</span>
                </h4>
                <p className="text-xs text-stone-500">
                  Execute no SQL Editor do Supabase para criar as tabelas e políticas de segurança.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopySql}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 bg-stone-900 text-stone-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-44 scrollbar-thin">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>

          {/* GitHub Hosting Guide */}
          <div className="border-t border-stone-200 pt-5 space-y-2">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Como Hospedar via GitHub:
            </h4>
            <ol className="list-decimal list-inside text-xs text-stone-600 space-y-1.5 leading-relaxed">
              <li>Envie este repositório para o seu GitHub pessoal ou da empresa.</li>
              <li>Conecte o repositório ao Vercel, Netlify, Cloudflare Pages ou GitHub Pages.</li>
              <li>Configure as variáveis de ambiente <code className="bg-stone-100 px-1 py-0.5 rounded text-amber-900">VITE_SUPABASE_URL</code> e <code className="bg-stone-100 px-1 py-0.5 rounded text-amber-900">VITE_SUPABASE_ANON_KEY</code> se desejar embutir no build.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
