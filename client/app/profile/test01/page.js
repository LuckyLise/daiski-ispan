import { Eye } from "lucide-react"
import Image from "next/image"



export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-5xl font-bold text-center mb-4">登入</h1>

      <p className="text-[#4a5568] text-center mb-12">還不是會員? 現在加入!</p>

      <form className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-lg">
            電子郵件
          </label>
          <input
            id="email"
            type="email"
            placeholder="example@gmail.com"
            className="w-full px-4 py-3 rounded-lg border border-[#cbd5e0] focus:outline-none focus:ring-2 focus:ring-[#0059c8]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-lg">
            密碼
          </label>
          <div className="relative">
            <input
              id="password"
              type="password"
              placeholder="@#*%"
              className="w-full px-4 py-3 rounded-lg border border-[#cbd5e0] focus:outline-none focus:ring-2 focus:ring-[#0059c8]"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096]"
              aria-label="Toggle password visibility"
            >
              <Eye className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input id="remember" type="checkbox" className="w-5 h-5 border border-[#cbd5e0] rounded" />
            <label htmlFor="remember" className="ml-2 text-lg">
              記住密碼
            </label>
          </div>

          <a href="#" className="text-[#bd002a] hover:underline">
            忘記密碼?
          </a>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-[#12395e] text-white rounded-lg text-xl font-medium hover:bg-[#0059c8] transition-colors"
        >
          登入
        </button>
      </form>

      <div className="flex items-center my-8">
        <div className="flex-grow h-px bg-[#cbd5e0]"></div>
        <span className="px-4 text-[#718096] font-medium">OR</span>
        <div className="flex-grow h-px bg-[#cbd5e0]"></div>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          className="w-full py-4 px-6 border border-[#cbd5e0] rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <div className="w-6 h-6 relative">
            <Image
              src="/placeholder.svg?height=24&width=24"
              alt="Google logo"
              width={24}
              height={24}
              className="absolute inset-0"
            />
          </div>
          <span className="text-[#4a5568] text-lg">Continue with Google</span>
        </button>

        <button
          type="button"
          className="w-full py-4 px-6 border border-[#cbd5e0] rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <div className="w-6 h-6 relative">
            <Image
              src="/placeholder.svg?height=24&width=24"
              alt="Facebook logo"
              width={24}
              height={24}
              className="absolute inset-0"
            />
          </div>
          <span className="text-[#4a5568] text-lg">Continue with Facebook</span>
        </button>
      </div>
    </div>
  )
}
