'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import {
  useAuthGet,
  useAuthLogout,
  useAuthLogin,
} from '@/services/rest-client/use-user';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from 'sonner';
// import { register } from 'module';
// 為了跳轉頁面（App Router）
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';

export default function UserPage() {
  const base = process.env.NEXT_PUBLIC_API_BASE || '';
  
  // 輸入表單用的狀態
  const [userInput, setUserInput] = useState({ account: '', password: '' });

  // 忘記密碼視窗狀態
  const [fpOpen, setFpOpen] = useState(false); // Dialog 開關
  const [fpEmail, setFpEmail] = useState(''); // email
  const [otpSent, setOtpSent] = useState(false); // 是否已寄出 OTP
  const [fpOtp, setFpOtp] = useState(''); // 使用者輸入的 OTP
  const [fpNewPwd, setFpNewPwd] = useState(''); // 新密碼
  const [fpLoading, setFpLoading] = useState(false); // 送出 loading
  

  // 登入後設定全域的會員資料用
  const { mutate } = useAuthGet();
  const { login } = useAuthLogin();
  const { logout } = useAuthLogout();
  //取用router，為了跳轉頁面
  const router = useRouter();
  // 取得登入狀態
  const { isAuth, isLoading } = useAuth();

  // 輸入帳號與密碼框用
  const handleFieldChange = (e) => {
    setUserInput({ ...userInput, [e.target.name]: e.target.value });
  };

  // 處理登入
  const handleLogin = async () => {
    // 如果是已登入狀態，就不要再登入
    if (isAuth) {
      toast.error('錯誤 - 會員已登入');
      return;
    }

    const res = await login(userInput);
    const resData = await res.json();

    console.log(resData);

    if (resData?.status === 'success') {
      // 呼叫useAuthGet的mutate方法
      // 將會進行重新驗證(revalidation)(將資料標記為已過期並觸發重新請求)
      mutate();
      router.push('/');
      // toast.success("已成功登入");
      // toast.success("已成功登入", { onClose: () => router.push("/profile") });
    } else {
      toast.error(`登入失敗`);
    }
  };

  // 處理登出
  const handleLogout = async () => {
    const res = await logout();
    const resData = await res.json();
    // 成功登出
    if (resData.status === 'success') {
      // 呼叫useAuthGet的mutate方法
      // 將會進行重新驗證(revalidation)(將資料標記為已過期並觸發重新請求)
      mutate();

      toast.success('已成功登出');
    } else {
      toast.error(`登出失敗`);
    }
  };

  // 處理檢查登入狀態
  const handleCheckAuth = async () => {
    if (isAuth) {
      toast.success('已登入會員');
    } else {
      toast.error(`非會員身份`);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h3>載入中...</h3>
      </div>
    );
  }

  return (
    <>
      <div className="flex container justify-center  mx-auto  gap-1 min-h-screen">
        <div className="relative w-full sm:w-1/2 py-12 left flex-1 min-w-0 bg-[url('/login.png')] bg-fixed bg-cover bg-center lg:bg-none px-4 lg:px-0 ">
          <div className="absolute inset-0 bg-white/80  lg:hidden" />
          <div className="relative z-10">
            <div className="text-center ">
              <h1 className="text-h2-tw">登入</h1>
              <p>
                還不是會員？
                <Link href="/auth/register">
                  <span className="text-primary-500">現在加入！</span>
                </Link>
              </p>
            </div>
            <div className="max-w-md mx-auto mt-30 flex flex-col gap-2">
              <label>
                帳號:
                <input
                  type="text"
                  name="account"
                  value={userInput.account}
                  onChange={handleFieldChange}
                  className="w-full px-4 py-3 rounded-lg border border-[#272b2e] focus:outline-none focus:ring-2 focus:ring-[#2770ea]"
                />
              </label>
              <label className="">
                密碼:
                <input
                  type="password"
                  name="password"
                  value={userInput.password}
                  onChange={handleFieldChange}
                  className="w-full px-4 py-3 rounded-lg border border-[#272b2e] focus:outline-none focus:ring-2 focus:ring-[#2770ea]"
                />
              </label>
              <p className="text-end">
                <button
                  type="button"
                  onClick={() => setFpOpen(true)}
                  className="text-primary-500 hover:underline"
                >
                  忘記密碼？
                </button>
              </p>
              <button
                onClick={handleLogin}
                className="w-full mt-16 px-4 py-3 hover:bg-primary-500 rounded-md text-white bg-primary-600"
              >
                登入(login)
              </button>
            </div>

            <div className="mt-16">
              {/* <button
                onClick={() => {
                  // 測試帳號 harry/11111
                  setUserInput({ account: 'harry', password: '11111' });
                }}
              >
                一鍵輸入範例
              </button>
              <hr /> */}
              {/* <h1>會員登入認証&授權測試(JWT)</h1> */}
              {/* <p>會員狀態:{isAuth ? '已登入' : '未登入'}</p>
              <hr />
              <button onClick={handleLogout}>登出(logout)</button>
              <hr />
              <button onClick={handleCheckAuth}>
                檢查登入狀況(check login)
              </button>
              <hr /> */}

              {/* <p>
            以下連結為測試會員隱私資料頁，如果未登入完成會跳轉回登入頁(本頁)，實作程式碼詳見useAuth勾子
          </p> */}
              {/* <p>
                <Link href="/auth/login/status">存取會員隱私資料</Link>
              </p> */}
            </div>
          </div>
        </div>
        <div className="hidden lg:block w-1/2 flex-1 min-w-0">
          <Image
            src="/login.png"
            alt="Login Image"
            width={100}
            height={100}
            className=" object-fill shadow-lg w-full h-full"
          />
        </div>
      </div>

      {/* 土司訊息視窗用 */}
      <ToastContainer position="bottom-right" autoClose={1000} closeOnClick />
      {/* 忘記密碼彈出式視窗 */}
      <Dialog open={fpOpen} onOpenChange={setFpOpen}>
        <DialogTrigger asChild />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>重設密碼</DialogTitle>
            <DialogDescription>
              {otpSent
                ? '請輸入收到的 OTP 驗證碼與新密碼'
                : '輸入註冊時的 Email，我們會寄送 OTP 驗證碼給你'}
            </DialogDescription>
          </DialogHeader>

          {/* ========= 階段 1：只輸入 email ========= */}
          {!otpSent && (
            <div className="space-y-4">
              <Input
                placeholder="email@example.com"
                type="email"
                value={fpEmail}
                onChange={(e) => setFpEmail(e.target.value)}
                disabled={fpLoading}
              />
              <button
                onClick={async () => {
                  if (!fpEmail) return toast.error('請輸入 Email');
                  setFpLoading(true);
                  try {
                    const r = await fetch(
                      'http://localhost:3005/api/auth/otp',
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: fpEmail }),
                      }
                    );
                    const data = await r.json();
                    if (r.ok && data.status === 'success') {
                      toast.success('OTP 已寄出，請收信！');
                      setOtpSent(true); // 進入階段 2
                    } else {
                      toast.error(data.message || '寄送失敗');
                    }
                  } catch (err) {
                    toast.error('系統錯誤，請稍後再試');
                  } finally {
                    setFpLoading(false);
                  }
                }}
                disabled={fpLoading}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500"
              >
                {fpLoading ? '寄送中…' : '取得 OTP 驗證碼'}
              </button>
            </div>
          )}

          {/* ========= 階段 2：輸入 OTP + 新密碼 ========= */}
          {otpSent && (
            <div className="space-y-4">
              {/* 仍顯示「OTP」，但實際送出 token */}
              <Input
                placeholder="6 位數 OTP"
                value={fpOtp}
                onChange={(e) => setFpOtp(e.target.value)}
                maxLength={6}
                disabled={fpLoading}
              />
              {/* 仍顯示「新密碼」，但實際送出 password */}
              <Input
                placeholder="請輸入新密碼"
                type="password"
                value={fpNewPwd}
                onChange={(e) => setFpNewPwd(e.target.value)}
                disabled={fpLoading}
              />

              <button
                onClick={async () => {
                  if (!fpEmail || !fpOtp || !fpNewPwd)
                    return toast.error('資料填寫不完整');

                  setFpLoading(true);
                  try {
                    const r = await fetch(
                      'http://localhost:3005/api/auth/reset-password',
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          email: fpEmail, // ✔ 必填
                          token: fpOtp, // ✔ 後端要 token
                          password: fpNewPwd, // ✔ 後端要 password
                        }),
                      }
                    );
                    const data = await r.json();

                    if (r.ok && data.status === 'success') {
                      toast.success('密碼已重設，請重新登入');
                      setFpOpen(false);
                      // 清理狀態
                      setOtpSent(false);
                      setFpEmail('');
                      setFpOtp('');
                      setFpNewPwd('');
                    } else {
                      toast.error(data.message || '重設失敗');
                    }
                  } catch (err) {
                    toast.error('系統錯誤，請稍後再試');
                  } finally {
                    setFpLoading(false);
                  }
                }}
                disabled={fpLoading}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500"
              >
                {fpLoading ? '送出中…' : '重設密碼'}
              </button>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setFpOpen(false)}
              className="text-sm text-muted-foreground hover:underline"
            >
              取消
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
