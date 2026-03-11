import { supabase } from '../lib/supabase'

export default async function Home() {
  const { data: games, error } = await supabase
    .from('games')
    .select('*')

  return (
    <main style={{ padding: '2rem' }}>
      <h1>BROWSER GAME PLATFORM</h1>
      {error && <p>Error: {error.message}</p>}
      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        {games?.map((game: any) => (
          <div key={game.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{game.title}</h2>
            <p>{game.description}</p>
            <p style={{ fontSize: '0.8rem', color: '#666' }}>作者: {game.author}</p>
          </div>
        ))}
      </div>
    </main>
  )
}