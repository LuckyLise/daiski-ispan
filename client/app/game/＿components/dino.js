'use client';

import React, { useEffect, useRef, useState } from 'react';
import './styles/dino.css';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

import Link from 'next/link';

import useSWRMutation from 'swr/mutation';
import { useAuth } from '@/hooks/use-auth';

export default function Dino() {
  // 使用useSWRMutation來管理讀取post
  const {
    trigger,
    isMutating: isClaiming,
    error: claimError,
  } = useSWRMutation('http://localhost:3005/api/game', (url, { arg }) => {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 若靠 cookie 登入，一定要加
      body: JSON.stringify(arg), // arg 會是 trigger 傳進來的參數 { userId, couponId }
    }).then(async (r) => {
      const data = await r.json();
      if (!r.ok) {
        // 把後端回傳的 message 丟為 Error.message
        throw new Error(data.message || '領取失敗');
      }
      return data; // 後端回資料
    });
  });

  // 讀取會員ＩＤ
  const { user, isAuth } = useAuth();

  const game_id = 1;

  const dinoRef = useRef(null);
  const scoreRef = useRef(0);

  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false); // 控制遊戲是否啟動
  const [cactusVisible, setCactusVisible] = useState(false); //控制仙人掌是否可見
  const [obstacles, setObstacles] = useState([]); //用來儲存畫面上還沒消失的障礙物
  const [speed, setSpeed] = useState(1); //設定速度
  const reachedGoalRef = useRef(false); // 追蹤是否 1000 分

  //isPaused = true 時，所有 CSS animation 暫停
  const [isPaused, setIsPaused] = useState(false);

  // 延長跳躍時間
  const [isJumping, setIsJumping] = useState(false); //是否有在跳躍
  const jumpStartRef = useRef(0);
  const posYRef = useRef(0); // 位置
  const vyRef = useRef(0); // 速度
  const [, forceRender] = useState(0); // 用來觸發畫面更新
  const gravity = -0.6; // 每幀重力加速度
  const jump_power = 11; //起跳出速
  const max_hold_time = 800; //最多可按 800ms

  // 控制 AlertDialog 開關
  const [startDialogOpen, setStartDialogOpen] = useState(true);
  const [gameOverDialogOpen, setGameOverDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [claimFailDialogOpen, setClaimFailDialogOpen] = useState(false);
  const [claimFailMessage, setClaimFailMessage] = useState('');

  // 按下開始後的狀態
  const handleStart = () => {
    // 關閉開始提示視窗 → 開始遊戲
    setStartDialogOpen(false);
    setStarted(true);
    setIsPaused(false);
    setScore(0);
    scoreRef.current = 0;
    setCactusVisible(false);
    setObstacles([]);
    reachedGoalRef.current = false;
    posYRef.current = 0;
    vyRef.current = 0;
    setTimeout(() => setCactusVisible(true), 0);
  };

  // 跳躍處理
  useEffect(() => {
    if (!started) return;

    const onKeyDown = () => {
      if (posYRef.current === 0) {
        vyRef.current = jump_power;
        setIsJumping(true);
        jumpStartRef.current = performance.now();
      }
    };
    const onKeyUp = () => {
      setIsJumping(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [started]);

  // 隨時間提升速度
  useEffect(() => {
    if (!started) return;

    // 每5秒speed增加0.2
    const timer = setInterval(() => {
      setSpeed((prev) => prev + 0.6);
    }, 1000);

    return () => clearInterval(timer);
  });

  // 隨機生成
  useEffect(() => {
    // 當 started 變為 true 時，啟動遊戲迴圈
    if (!started || !cactusVisible) return;

    const genInterval = setInterval(
      () => {
        const id = Date.now();

        // 隨機決定障礙物是地面還是天空;
        const type = Math.random() < 0.7 ? 'ground' : 'sky';

        // 把新障礙物加入陣列裡
        setObstacles((prev) => [...prev, { id, type, speed }]);
      },
      1500 + Math.random() * 1500
    );

    return () => clearInterval(genInterval);
  }, [started, cactusVisible, speed]);

  // 遊戲迴圈 碰撞設定 + 分數計算
  useEffect(() => {
    if (!started) return;

    let rafId;

    async function loop(time) {
      if (isPaused) {
        return;
      }
      // 延長跳躍
      if (isJumping && time - jumpStartRef.current < max_hold_time) {
        vyRef.current += jump_power * 0.02;
      }
      console.log(time);

      // 重力
      vyRef.current += gravity;
      // 更新位置
      posYRef.current = Math.max(0, posYRef.current + vyRef.current);

      // 觸發一次 React 重渲染，把 ref 值丟到畫面上
      forceRender((n) => n + 1);

      const dinoEl = dinoRef.current;
      if (!dinoEl) return;

      // 取得恐龍邊界
      const dinoRect = dinoEl.getBoundingClientRect();

      // 記錄當前這一輪檢查中，是否有任何一個障礙物跟恐龍發生碰撞
      let collided = false;

      // 所有障礙物
      obstacles.forEach((o) => {
        const obsEl = document.getElementById(`obs-${o.id}`);
        if (!obsEl) return;

        // 取得障礙物邊界
        const obsRect = obsEl.getBoundingClientRect();

        // 碰撞條件
        const overlapX =
          Math.min(dinoRect.right, obsRect.right) -
          Math.max(dinoRect.left, obsRect.left);

        const overlapY =
          Math.min(dinoRect.bottom, obsRect.bottom) -
          Math.max(dinoRect.top, obsRect.top);

        // 只在左右重疊長度 > 20 時，才算撞；上下重疊只要有就算
        const isCollide =
          overlapX > 25 && // 左右要重疊至少 20px
          overlapY > 1; // 垂直只要有任何重疊

        // 只要撞到就結束遊戲
        if (isCollide) collided = true;
      });

      // 計算分數
      if (collided) {
        setIsPaused(true);
        setGameOverDialogOpen(true);
        scoreRef.current = 0; // ref 重置
        setScore(0); // state 重置，畫面歸零
        setStarted(false); // 停遊戲
        return;
      } else {
        // 沒撞到就 +1 分
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }

      // 如果分數到達500，強制結束遊戲
      if (scoreRef.current > 500 && posYRef.current === 0) {
        setIsPaused(true);
        setGoalDialogOpen(true);
        reachedGoalRef.current = true;

        // 如果當下 scoreRef.current > 500，就拿這個分數去傳送
        try {
          const resp = await trigger({
            gameId: game_id,
            score: scoreRef.current,
          });
          // 如果成功，就顯示「領取成功」的訊息
          toast.success(resp.message || '專屬券領取成功！');
        } catch (err) {
          // err.message 會是「已領過專屬券，無法重複領取」
          setClaimFailMessage(err.message);
          setClaimFailDialogOpen(true);
          setGoalDialogOpen(false);
        }
        // 重置分數與狀態
        scoreRef.current = 0;
        setScore(0);
        setStarted(false);
        return;
      }

      // 下一幀繼續執行
      rafId = requestAnimationFrame(loop);
    }

    // 啟動第一幀
    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [started, obstacles, isJumping]);

  // 處理「Game Over（分數 < 500）」視窗按鈕：點擊「重新開始」，把所有狀態清乾淨並回到開始 Dialog
  const handleGameOverConfirm = () => {
    setGameOverDialogOpen(false);
    // 重置所有參數
    scoreRef.current = 0;
    setScore(0);
    posYRef.current = 0;
    vyRef.current = 0;
    reachedGoalRef.current = false;
    setStarted(false);
    setObstacles([]);
    setSpeed(1);
    setIsPaused(false);
    // 再打開「開始遊戲」提示 Dialog
    setStartDialogOpen(true);
  };

  //處理「達到 500 分」視窗按鈕：點擊「確定」，把所有狀態清乾淨並回到開始 Dialog
  // const handleGoalConfirm = () => {
  //   setGoalDialogOpen(false);
  //   scoreRef.current = 0;
  //   setScore(0);
  //   posYRef.current = 0;
  //   vyRef.current = 0;
  //   reachedGoalRef.current = false;
  //   setStarted(false);
  //   setObstacles([]);
  //   setSpeed(1);
  //   setIsPaused(false);
  //   setStartDialogOpen(true);
  // };

  // 計算是否要把 CSS animation 暫停
  // const pauseStyle = { animationPlayState: 'paused' };
  // const runningStyle = { animationPlayState: 'running' };

  return (
    <>
      {/* 開始提示 */}
      <AlertDialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>注意事項</AlertDialogTitle>
            <AlertDialogDescription>
              • 用「任意鍵」讓小人跳躍。
              <br />
              • 躲避所有障礙物，撞到就會結算分數。
              <br />• 分數會隨時間累加，越久存活分數越高。
              <br />• 滿500分將得到一張全站優惠券。
              <br />• 每人限領一次。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button asChild>
                <Link href="/coupons">返回優惠券頁面</Link>
              </Button>
            </AlertDialogAction>
            <AlertDialogAction asChild>
              <Button onClick={handleStart}>開始遊戲</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Game Over (score < 1000) */}
      <AlertDialog
        open={gameOverDialogOpen}
        onOpenChange={setGameOverDialogOpen}
      >
        <AlertDialogContent className="max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle>Game Over</AlertDialogTitle>
            <AlertDialogDescription>
              尚未達到 500 分，請再接再厲！
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button asChild>
                <Link href="/coupons">返回優惠券頁面</Link>
              </Button>
            </AlertDialogAction>
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={handleGameOverConfirm}>
                重新開始
              </Button>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 通關 (score ≥ 500 且落地) */}
      <AlertDialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <AlertDialogContent className="max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle>恭喜通關！</AlertDialogTitle>
            <AlertDialogDescription>
              恭喜達到500分，將獲得一張全站優惠券，請至會員中心查看。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button asChild>
                <Link href="/profile">前往會員中心</Link>
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 領取失敗 */}
      <AlertDialog
        open={claimFailDialogOpen}
        onOpenChange={() => setClaimFailDialogOpen(false)}
      >
        <AlertDialogContent className="max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle>領取失敗</AlertDialogTitle>
            <AlertDialogDescription>
              {/** 把後端回傳的失敗訊息動態顯示出來 */}
              {claimFailMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button
                asChild
                variant="outline"
                onClick={() => setClaimFailDialogOpen(false)}
              >
                <Link href="/coupons">確認</Link>
              </Button>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="relative lg:w-[1000px] h-[500px] border border-black mx-auto overflow-hidden mt-10 z-[1]">
        {/* 遊戲畫面 */}
        <div className="absolute top-2 left-2 text-lg font-medium">
          Score: {score}
        </div>

        <div
          ref={dinoRef}
          id="dino"
          className="w-[70px] h-[65px]
                   bg-[url('/game/dino1.jpg')] bg-contain 
                   absolute  left-[50px] "
          style={{
            bottom: posYRef.current,
            // 停止恐龍的動畫
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />

        {obstacles.map((o) => (
          <div
            key={o.id}
            id={`obs-${o.id}`}
            className={`absolute bg-contain ${
              o.type === 'ground'
                ? "bg-[url('/game/dino4.png')] bottom-[-10px] w-[62px] h-[75px] "
                : "bg-[url('/game/dino5.png')] top-[225px] w-[70px] h-[46px]   "
            }`}
            style={{
              // 把動畫加進來：名稱 move、時長 = 基礎時間(例如 3s) ÷ speed、無限循環
              animation: `move ${3 / o.speed}s linear infinite`,
              // 決定要暫停還是運行 CSS animation
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          />
        ))}
      </div>
    </>
  );
}
