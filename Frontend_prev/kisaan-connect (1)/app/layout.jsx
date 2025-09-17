import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { ThemeProvider } from "next-themes"
import FloatingChat from "@/components/FloatingChat"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <LanguageProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
            <FloatingChat />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
