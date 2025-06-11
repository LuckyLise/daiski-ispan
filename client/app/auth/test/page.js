//這是系統二的login頁面
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
import { color } from 'framer-motion';

export default function TestPage(props) {
  const defaultLogin = {
    account: 'harry',
    password: '11111',
  };
  const [login, setLogin] = useState({ ...defaultLogin });
  // ==== login ====
  async function handleSubmit(e) {
    e.preventDefault();
    const response = await fetch('http://localhost:3005/api/auth/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(login),
    });
    const data = await response.json();
    console.log('data',data);
    const token=data.token
    console.log('token',token);
    localStorage.setItem('tokenBox',token)
  }
  // ==== END login ====
  return (
    <>
      <h1>會員登入認証&授權測試(JWT)</h1>

      <hr />
      <form onSubmit={handleSubmit}>
        <label>
          帳號:
          <input
            type="text"
            name="account"
            value={login.account}
            onChange={(e) => {
              setLogin({ ...login, ['account']: e.target.value });
            }}
            className=" border-4 border-lime-700"
          />
        </label>
        <label className="block text-lg">
          密碼:
          <input
            type="text"
            name="password"
            value={login.password}
            onChange={(e) => {
              setLogin({ ...login, ['password']: e.target.value });
            }}
            className="w-full px-4 py-3 rounded-lg border border-[#cbd5e0] focus:outline-none focus:ring-2 focus:ring-[#0059c8]"
          />
        </label>
        <button>提交</button>
      </form>

      <br />
    </>
  );
}
