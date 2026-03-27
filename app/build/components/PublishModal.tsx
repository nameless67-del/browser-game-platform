'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 追加
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function BuildContainer() {
  const router = useRouter(); // 追加
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Blob URLの管理
  useEffect(() => {
    if (generatedCode) {
      const blob = new Blob([generatedCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [generatedCode]);

  // AI生成処理
  const handleGenerate = async () => {
    if (isLoading || !prompt) return;
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      alert("❌ APIキーが設定されていません。\n.env.localを確認し、サーバーを再起動してください。");
      return;
    }

    setIsLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel(
        { model: "gemini-2.5-flash" },
        { apiVersion: "v1" }
      );

      const systemInstruction = `
        あなたは天才的なブラウザゲーム開発者です。
        NAROU GAME プロトコルに従い、1つのHTMLファイルで完結する高品質なゲームコードを出力してください。
        
        【重要ルール】
        ・CSSとJavaScriptはすべて1つのHTML内の<style>および<script>に記述すること。
        ・解説テキストやMarkdownの枠（\`\`\`html）は一切含めないこと。
        ・必ず <!DOCTYPE html> から書き始めること。
        ・アクセシビリティと熱中度（Rスコア）を意識した設計にすること。
      `;

      const result = await model.generateContent([systemInstruction, prompt]);
      const response = await result.response;
      let text = response.text();
      text = text.replace(/```html/g, "").replace(/```/g, "").trim();
      setGeneratedCode(text);
    } catch (error: any) {
      console.error("Gemini API Error Detail:", error);
      alert(`生成エラー: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 【重要】データを引き継いでEditorページへ遷移 ---
  const handleNextStep = () => {
    if (!generatedCode) return;
    
    // localStorageに一時保存（URLでは送れない大きなコードを保持するため）
    localStorage.setItem('narou_build_code', generatedCode);
    localStorage.setItem('narou_build_prompt', prompt);
    
    // /editor ページへ遷移
    router.push('/editor');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans tracking-tight text-slate-900 dark:text-white overflow-hidden">
      {/* ヘッダー */}
      <header className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-white/80 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <Link href="/" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition text-[10px] font-black uppercase tracking-[0.2em]">
          ← Exit Build
        </Link>
        <div className="text-[11px] font-black tracking-[0.4em] text-blue-600 dark:text-blue-500 uppercase italic">
          NAROU GAME : AI Build Environment
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white px-4 py-1.5 rounded text-[10px] font-black uppercase disabled:opacity-50 transition-all active:scale-95 border border-slate-200 dark:border-white/10 shadow-sm"
          >
            {isLoading ? 'Building...' : 'AI再ビルド'}
          </button>
          <button 
            onClick={handleNextStep}
            disabled={isLoading || !generatedCode}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-1.5 rounded text-[10px] font-black uppercase disabled:opacity-30 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            次へ進む (編集/公開) →
          </button>
        </div>
      </header>

      {/* メインエリア（見た目は以前と同じ） */}
      <main className="flex h-[calc(100vh-60px)]">
        <section className="w-1/3 border-r border-slate-200 dark:border-white/10 p-6 space-y-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/20">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 bg-blue-600 rounded-full"></span> AI Prompt
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-4 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white shadow-inner resize-none"
              placeholder="例: パステルカラーのテトリス。"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 bg-slate-400 rounded-full"></span> Code Output
            </label>
            <textarea 
              value={generatedCode}
              onChange={(e) => setGeneratedCode(e.target.value)}
              className="w-full h-[45vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-4 font-mono text-[10px] focus:outline-none text-slate-900 dark:text-white shadow-inner"
              placeholder="ビルドされたコードが表示されます..."
            />
          </div>
        </section>

        <section className="flex-1 bg-slate-100 dark:bg-black relative overflow-hidden">
          {previewUrl ? (
            <iframe 
              src={previewUrl} 
              className="w-full h-full border-none bg-white" 
              sandbox="allow-scripts" 
              title="NAROU Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-300 dark:text-slate-800 italic select-none">
              <div className="text-center">
                <div className="text-5xl mb-4 font-black opacity-20 tracking-tighter uppercase">Build Ready</div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Ready to materialize your vision</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}