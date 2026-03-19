'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// Gemini API用のSDKをインポート
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function EditorPage() {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // コードが生成・更新されたら実行用のURL（Blob）を生成する
  useEffect(() => {
    if (generatedCode) {
      const blob = new Blob([generatedCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [generatedCode]);

  // Gemini APIを叩いてゲームコードを生成する関数
  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);

    try {
      // 1. APIキーを使用して初期化
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
      
      // 2. モデルの選択（コストと速度に優れた 1.5 Flash を使用）
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // 3. システム命令（仕様書に基づいた制約）の構築
      const systemInstruction = `
        あなたは天才的なブラウザゲーム開発者です。
        ユーザーの指示に従い、1つのHTMLファイルで完結する高品質なゲームコードを出力してください。
        
        【制約事項】
        ・CSSとJavaScriptはすべて1つのHTML内の<style>および<script>タグに記述してください。
        ・外部ライブラリ（CDN等）は極力使わず、ピュアなJavaScriptで記述してください。
        ・画像が必要な場合は、プレースホルダ(https://picsum.photos/)を使うか、CSS/Canvasで描画してください。
        ・著作権を侵害する特定の名称やキャラクターは避け、汎用的なデザインにしてください。
        ・解説やMarkdownの枠（\`\`\`html など）は一切含めず、<!DOCTYPE html>から始まるコードのみを直接出力してください。
      `;

      // 4. 生成の実行
      const result = await model.generateContent([systemInstruction, prompt]);
      const response = await result.response;
      let text = response.text();

      // 5. 万が一Markdownの装飾が含まれていた場合のクレンジング
      text = text.replace(/```html/g, "").replace(/```/g, "").trim();

      setGeneratedCode(text);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      alert("生成に失敗しました。APIキーを確認するか、少し時間を置いて試してください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans tracking-tight transition-colors">
      <header className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-white/80 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <Link href="/" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition text-[10px] font-black uppercase tracking-[0.2em]">← Exit Editor</Link>
        <div className="text-[11px] font-black tracking-[0.4em] text-blue-600 dark:text-blue-500 uppercase italic">AI Creative Studio</div>
        <div className="flex gap-2">
          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-[10px] font-black uppercase disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            {isLoading ? 'Generating...' : 'AI生成'}
          </button>
          <button className="border border-slate-200 dark:border-white/10 px-4 py-1.5 rounded text-[10px] font-black uppercase hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
            保存
          </button>
        </div>
      </header>

      <main className="flex h-[calc(100vh-60px)]">
        {/* 左：AIインストラクション & コードビュー */}
        <section className="w-1/3 border-r border-slate-200 dark:border-white/10 p-6 space-y-6 overflow-y-auto bg-white dark:bg-slate-950">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 bg-blue-600 rounded-full"></span> AI Instructions
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-4 font-mono text-xs focus:outline-none focus:border-blue-600/50 transition-all shadow-inner"
              placeholder="例: 画面内を跳ね回る赤いボールを、クリックで消していくゲーム。スコア機能付き。"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 bg-slate-400 rounded-full"></span> Raw Code Preview
            </label>
            <textarea 
              value={generatedCode}
              onChange={(e) => setGeneratedCode(e.target.value)}
              className="w-full h-[40vh] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-4 font-mono text-[10px] focus:outline-none focus:border-blue-600/50 transition-all shadow-inner leading-relaxed"
              placeholder="生成されたコードを直接編集することも可能です..."
            />
          </div>
        </section>

        {/* 右：リアルタイムプレビュー */}
        <section className="flex-1 bg-slate-100 dark:bg-black relative overflow-hidden">
          {previewUrl ? (
            <iframe 
              src={previewUrl} 
              className="w-full h-full border-none bg-white" 
              sandbox="allow-scripts" 
              title="AI Output Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-300 dark:text-slate-800 italic select-none">
              <div className="text-center">
                <div className="text-5xl mb-4 font-black opacity-20 dark:opacity-10 tracking-tighter">BOOTING...</div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Your vision will materialize here</p>
              </div>
            </div>
          )}
          
          <div className="absolute top-4 left-4">
            <span className="bg-green-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> Live Workspace
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}