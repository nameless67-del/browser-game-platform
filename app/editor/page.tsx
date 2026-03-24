'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GoogleGenerativeAI } from "@google/generative-ai";
import PublishModal from './components/PublishModal';

export default function EditorPage() {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // 生成されたコードをiframeで実行可能なBlob URLに変換
  useEffect(() => {
    if (generatedCode) {
      const blob = new Blob([generatedCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      // メモリリーク防止のため、コンポーネント消滅時にURLを解放
      return () => URL.revokeObjectURL(url);
    }
  }, [generatedCode]);

  // --- AI生成処理 (NAROU Hybrid AI Engine - Layer 2) ---
  const handleGenerate = async () => {
    // 二重送信防止ガード
    if (isLoading || !prompt) return;

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // デバッグ用ログ：APIキーの読み込み確認（本番公開前に削除推奨）
    console.log("NAROU Engine: Initializing with Key Prefix:", apiKey?.substring(0, 8));

    if (!apiKey) {
      alert("❌ APIキーが設定されていません。\n.env.localを確認し、サーバーを再起動してください。");
      return;
    }

    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // 2026年現在の最新・高速モデル "gemini-2.5-flash" を使用
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

      // AIに生成を依頼
      const result = await model.generateContent([systemInstruction, prompt]);
      const response = await result.response;
      let text = response.text();

      // 不要なMarkdown記号を排除
      text = text.replace(/```html/g, "").replace(/```/g, "").trim();

      setGeneratedCode(text);
    } catch (error: any) {
      console.error("Gemini API Error Detail:", error);
      
      // クォータエラー（429）等の具体的なフィードバック
      if (error.message?.includes('429')) {
        alert("API制限に達しました。1分待ってから再度お試しください。");
      } else {
        alert(`生成エラー: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans tracking-tight text-slate-900 dark:text-white overflow-hidden">
      {/* ヘッダー */}
      <header className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-white/80 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <Link href="/" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition text-[10px] font-black uppercase tracking-[0.2em]">
          ← Exit Editor
        </Link>
        <div className="text-[11px] font-black tracking-[0.4em] text-blue-600 dark:text-blue-500 uppercase italic">
          NAROU GAME : AI Production Environment
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white px-4 py-1.5 rounded text-[10px] font-black uppercase disabled:opacity-50 transition-all active:scale-95 border border-slate-200 dark:border-white/10 shadow-sm"
          >
            {isLoading ? 'Generating...' : 'AI再生成'}
          </button>
          <button 
            onClick={() => setShowPublishModal(true)}
            disabled={isLoading || !generatedCode}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-1.5 rounded text-[10px] font-black uppercase disabled:opacity-30 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            次へ進む →
          </button>
        </div>
      </header>

      {/* メインエリア */}
      <main className="flex h-[calc(100vh-60px)]">
        {/* 左側：入力とソースコード */}
        <section className="w-1/3 border-r border-slate-200 dark:border-white/10 p-6 space-y-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/20">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 bg-blue-600 rounded-full"></span> AI Prompt (UGC Strategy)
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-4 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white shadow-inner resize-none"
              placeholder="例: パステルカラーのテトリス。消える時にエフェクトが欲しい。"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 bg-slate-400 rounded-full"></span> Generated Code Content
            </label>
            <textarea 
              value={generatedCode}
              onChange={(e) => setGeneratedCode(e.target.value)}
              className="w-full h-[45vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-4 font-mono text-[10px] focus:outline-none text-slate-900 dark:text-white shadow-inner"
              placeholder="生成されたコードがここに表示されます..."
            />
          </div>
        </section>

        {/* 右側：プレビュー画面 */}
        <section className="flex-1 bg-slate-100 dark:bg-black relative overflow-hidden">
          {previewUrl ? (
            <iframe 
              src={previewUrl} 
              className="w-full h-full border-none bg-white shadow-2xl" 
              sandbox="allow-scripts" 
              title="NAROU GAME Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-300 dark:text-slate-800 italic select-none">
              <div className="text-center">
                <div className="text-5xl mb-4 font-black opacity-20 tracking-tighter uppercase">Ready</div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Inject prompt to materialize your vision</p>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* パブリッシング・モーダル（確認画面） */}
      {showPublishModal && (
        <PublishModal 
          code={generatedCode} 
          initialPrompt={prompt} 
          onClose={() => setShowPublishModal(false)} 
        />
      )}
    </div>
  );
}