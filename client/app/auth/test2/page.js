'use client';
//==== 這是系統二的一般功能如何通過驗證 ====
import React, { useState, useEffect, use } from 'react';

export default function Test2Page(props) {
  const [userProfile, setUserProfile] = useState({});
  useEffect(function () {
    const token = localStorage.getItem('tokenBox');
    console.log('token', token);
    async function getUser() {
      const response = await fetch('https://daiski-ispan.onrender.com/api/auth/test', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });
      const data = await response.json();
      setUserProfile(data.data);
      console.log('data', data);
    }
    getUser();
  }, []);
  console.log('userProfile',userProfile);
  //====End Token取用====
  return (
    <>
      <div>{userProfile['account']}</div>
    </>
  );
  //透過Token取用資料庫資料
}
