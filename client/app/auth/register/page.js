'use client';

import { useState } from 'react';
import { useUserRegister } from '@/services/rest-client/use-user';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useUserRegister();
  const [userInput, setUserInput] = useState({
    name: '',
    account: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    birthday: '2000-01-01', // ← 設定預設值
    is_coach: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { isAuth } = useAuth();

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserInput((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAuth) return toast.error('錯誤：請先登出再註冊');
    if (userInput.password !== userInput.confirmPassword) {
      return toast.error('錯誤：兩次密碼不一致');
    }
    try {
      const payload = {
        ...userInput,
        is_coach: userInput.is_coach ? 1 : 0,
      };
      const res = await register(payload);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status === 'success') {
        toast.success('註冊成功', {
          onClose: () => router.push('/auth/login'),
        });
      } else {
        toast.error(`註冊失敗：${data.message || res.statusText}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('無法連線伺服器，稍後再試');
    }
  };

  return (
    <>
      <div className="flex container justify-center mx-auto gap-1 min-h-screen">
        <div className="hidden sm:block w-1/2 flex-1 min-w-0">
          <Image
            src="/register.png"
            alt="register Image"
            width={100}
            height={100}
            className="object-cover shadow-lg w-full"
          />
        </div>
        <div className="relative w-full sm:w-1/2 py-12 left flex-1 min-w-0 bg-[url('/register.png')] bg-cover bg-center sm:bg-none px-4 sm:px-0">
          <div className="absolute inset-0 bg-white/80 sm:hidden" />
          <div className="relative z-10">
            <div className="text-center">
              <h1 className="text-h2-tw">會員註冊</h1>
              <p>
                已經有帳號？
                <Link href="/auth/login">
                  <span className="text-primary-500">前往登入！</span>
                </Link>
              </p>
            </div>
            <div className="max-w-md mx-auto mt-6">
              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-2"
              >
                <label>
                  姓名:
                  <input
                    type="text"
                    name="name"
                    value={userInput.name}
                    onChange={handleFieldChange}
                    className="w-full px-4 py-3 rounded-lg border border-[#272b2e] focus:outline-none focus:ring-2 focus:ring-[#2770ea]"
                  />
                </label>

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

                <label className="block">
                  密碼:
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={userInput.password}
                      onChange={handleFieldChange}
                      className="w-full px-4 py-3 rounded-lg border border-[#272b2e] pr-10 focus:outline-none focus:ring-2 focus:ring-[#2770ea]"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 "
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </label>

                <label className="block">
                  確認密碼:
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={userInput.confirmPassword}
                      onChange={handleFieldChange}
                      className="w-full px-4 py-3 rounded-lg border border-[#272b2e] pr-10 focus:outline-none focus:ring-2 focus:ring-[#2770ea]"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </label>

                <label>
                  電子郵件信箱:
                  <input
                    type="text"
                    name="email"
                    value={userInput.email}
                    onChange={handleFieldChange}
                    className="w-full px-4 py-3 rounded-lg border border-[#272b2e] focus:outline-none focus:ring-2 focus:ring-[#2770ea]"
                  />
                </label>

                <label>
                  手機:
                  <input
                    type="text"
                    name="phone"
                    value={userInput.phone}
                    onChange={handleFieldChange}
                    className="w-full px-4 py-3 rounded-lg border border-[#272b2e] focus:outline-none focus:ring-2 focus:ring-[#2770ea]"
                  />
                </label>

                <label>
                  生日:
                  <input
                    type="date"
                    name="birthday"
                    value={userInput.birthday}
                    onChange={handleFieldChange}
                    className="w-full px-4 py-3 rounded-lg border border-[#272b2e] focus:outline-none focus:ring-2 focus:ring-[#2770ea]"
                  />
                </label>

                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_coach"
                    checked={userInput.is_coach}
                    onChange={handleFieldChange}
                  />
                  我是教練
                </label>

                <button
                  type="submit"
                  className="w-full mt-16 px-4 py-3 hover:bg-primary-500 rounded-md text-white bg-primary-600"
                >
                  註冊
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={1000} closeOnClick />
    </>
  );
}
