export const metadata = {
  title: 'Browser Game Platform',
  description: 'A platform for sharing and playing games',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}