import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: games, error } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false }) // 新着順に並べる

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ヘッダー */}
      <header className="border-b border-slate-800 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            AI-GAME HUB
          </h1>
          <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium transition">
            ゲームを投稿する
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-8 text-slate-400">注目の新作ゲーム</h2>
        
        {error && <p className="text-red-400">エラー: {error.message}</p>}

        {/* ゲームグリッド */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {games?.map((game: any) => (
            <div key={game.id} className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              {/* サムネイルエリア */}
              <div className="aspect-video bg-slate-800 relative">
                {game.thumbnail_url ? (
                  <img 
                    src={game.thumbnail_url} 
                    alt={game.title} 
                    className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    No Image
                  </div>
                )}
                {/* 収益化や時間を意識したバッジ（例） */}
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs">
                  {game.play_time_avg} min
                </div>
              </div>

              {/* ゲーム詳細 */}
              <div className="p-4">
                <h3 className="text-lg font-bold mb-1 group-hover:text-cyan-400 transition">
                  {game.title}
                </h3>
                <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                  {game.description}
                </p>
                <div className="flex justify-between items-center border-t border-slate-800 pt-3">
                  <span className="text-xs text-slate-500">by {game.author}</span>
                  <span className="text-xs font-semibold text-cyan-500">FREE</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}