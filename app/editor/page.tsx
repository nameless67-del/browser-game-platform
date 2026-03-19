'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GoogleGenerativeAI } from "@google/generative-ai";
// Supabaseクライアントをインポート（保存機能用）
import { supabase } from '@/lib/supabase';

export default function EditorPage() {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // デバッグログ
    console.log("Checking Environment Variables...");
    console.log("GEMINI_KEY Status:", apiKey ? "FOUND" : "NOT FOUND");

    if (!apiKey) {
      alert("APIキーが設定されていません。再起動を試してください。");
      return;
    }

    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // 修正ポイント: 最も安定したモデル名に変更
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const systemInstruction = `
        あなたは天才的なブラウザゲーム開発者です。
        ユーザーの指示に従い、1つのHTMLファイルで完結する高品質なゲームコードを出力してください。
        
        【制約】
        ・CSSとJavaScriptはすべてHTML内に含めること。
        ・解説やMarkdown（\`\`\`html）は一切不要。
        ・<!DOCTYPE html>から始まるコードのみを出力すること。
      `;

      const result = await model.generateContent([systemInstruction, prompt]);
      const response = await result.response;
      let text = response.text();

      // クレンジング処理
      text = text.replace(/```html/g, "").replace(/```/g, "").trim();

      setGeneratedCode(text);
    } catch (error: any) {
      console.error("Gemini API Error Details:", error);
      alert(`生成エラー: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 【新機能】生成したゲームをSupabaseに保存する関数
  const handleSave = async () => {
    if (!generatedCode) {
      alert("保存するコードがありません。先に生成してください。");
      return;
    }

    setIsSaving(true);
    try {
      // Supabaseの 'games' テーブルに保存（テーブル未作成の場合はエラーになります）
      const { data, error } = await supabase
        .from('games')
        .insert([
          { 
            title: prompt.substring(0, 20) || "Untitled Game", 
            code: generatedCode,
            prompt: prompt
          }
        ])
        .select();

      if (error) throw error;

      alert("🎉 保存に成功しました！マイページに公開されます。");
    } catch (error: any) {
      console.error("Save Error:", error);
      alert("保存に失敗しました。Supabaseのテーブル設定を確認してください。");
    } finally {
      setIsSaving(false);
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
          <button 
            onClick={handleSave}
            disabled={isSaving || !generatedCode}
            className="border border-slate-200 dark:border-white/10 px-4 py-1.5 rounded text-[10px] font-black uppercase hover:bg-slate-50 dark:hover:bg-white/5 transition-all disabled:opacity-30"
          >
            {isSaving ? 'Saving...' : '保存'}
          </button>
        </div>
      </header>

      <main className="flex h-[calc(100vh-60px)]">
        {/* 左側：指示とコード */}
        <section className="w-1/3 border-r border-slate-200 dark:border-white/10 p-6 space-y-6 overflow-y-auto bg-white dark:bg-slate-950">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 bg-blue-600 rounded-full"></span> AI Instructions
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-4 font-mono text-xs focus:outline-none focus:border-blue-600/50 transition-all"
              placeholder="例: インベーダー風のゲームを作って。敵は黄色い四角で。"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 bg-slate-400 rounded-full"></span> Raw Code Preview
            </label>
            <textarea 
              value={generatedCode}
              onChange={(e) => setGeneratedCode(e.target.value)}
              className="w-full h-[40vh] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-4 font-mono text-[10px] focus:outline-none"
              placeholder="生成されたコードがここに表示されます..."
            />
          </div>
        </section>

        {/* 右側：ライブプレビュー */}
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
                <div className="text-5xl mb-4 font-black opacity-20 dark:opacity-10 tracking-tighter uppercase">Waiting...</div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Your vision will materialize here</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}