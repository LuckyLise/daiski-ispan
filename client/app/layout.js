// context套用第3步: 在最外(上)層包裹提供者元件
// 建立P(Providers)到C(Consumer)的階層關係
import Providers from './providers';
import '@/styles/globals.css';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ThemeProvider } from '@/components/theme-provider';
//shadCN的sonner
import { Toaster } from 'sonner';

import CustomCursorLoader from '@/components/custom-cursor-loader';

export const metadata = {
  title: 'DAISKI',
  description: 'SKI!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <Header></Header>
            <div className="min-h-screen">{children}</div>
            <Footer></Footer>
          </Providers>

          {/* 2. 渲染新的加載器組件 */}
          <CustomCursorLoader />
        </ThemeProvider>
        {/* richColors套用更飽和、對比更高的背景與文字色;position決定通知在螢幕上的停靠位置;expand為 true 後，所有 toast 一出現即為展開狀態 */}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
