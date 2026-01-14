import Navigation from '../components/Navigation'
import './globals.css'

export const metadata = {
  title: 'Clothify — Online Clothing Store',
  description: 'A small demo clothing shop built from the starter project',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <Navigation />
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
