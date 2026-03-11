import { supabase } from '@/lib/supabase'

export default async function Home() {
  // Supabaseからgamesテーブルのデータを全件取得
  const { data: games, error } = await supabase
    .from('games')
    .select('*')

  if (error) {
    return <div className="p-10">エラーが発生しました: {error.message}</div>
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">BROWSER GAME PLATFORM</h1>
      
      <div className="grid gap-6">
        {games?.map((game) => (
          <div key={game.id} className="border p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold">{game.title}</h2>
            <p className="text-gray-600">{game.description}</p>
            <div className="mt-2 text-sm text-blue-600">
              作者: {game.author} / 平均プレイ時間: {game.play_time_avg}分
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}