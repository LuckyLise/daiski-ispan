// app/groups/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { CirclePlus, BadgeCheck, Megaphone } from 'lucide-react';
// 引入 Framer Motion
// 1. 安裝: npm install framer-motion 或 yarn add framer-motion
import { motion } from 'framer-motion';

export default function GroupsPage() {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://daiski-ispan.onrender.com';

  const [groupStats, setGroupStats] = useState({
    total: 0,
    ongoing: 0,
    formed: 0,
  });
  const [latestGroups, setLatestGroups] = useState([]);
  const [loadingLatest, setLoadingLatest] = useState(true);

  // Framer Motion 不需要像 AOS 那樣在 useEffect 中初始化
  // 動畫直接在 JSX 中的 motion 組件上定義

  useEffect(() => {
    async function fetchGroupStats() {
      try {
        const statsRes = await fetch(`${API_BASE}/api/group/summary`);
        if (!statsRes.ok) throw new Error('無法獲取揪團統計數據');
        const statsData = await statsRes.json();
        setGroupStats({
          total: statsData.totalGroups || 0,
          ongoing: statsData.ongoingGroups || 0,
          formed: statsData.formedGroups || 0,
        });
      } catch (err) {
        console.error('載入揪團統計數據失敗:', err);
        setGroupStats({ total: 0, ongoing: 0, formed: 0 });
      }
    }
    async function fetchLatestGroups() {
      try {
        const res = await fetch(`${API_BASE}/api/group/latest`);
        if (!res.ok) throw new Error('無法獲取最新揪團列表');
        const data = await res.json();
        setLatestGroups(data);
      } catch (err) {
        console.error('獲取最新揪團列表失敗:', err);
        setLatestGroups([]);
      } finally {
        setLoadingLatest(false);
      }
    }
    fetchGroupStats();
    fetchLatestGroups();
  }, [API_BASE]);

  // 定義一個通用的滑入動畫變體
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.3 }, // amount: 0.3 表示元素可見30%時觸發
    transition: { duration: 0.6, ease: 'easeInOut' },
  };
  const fadeInRight = {
    initial: { opacity: 0, x: -60 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: false, amount: 0.3 },
    transition: { duration: 0.6, ease: 'easeInOut' },
  };
  const fadeInLeft = {
    initial: { opacity: 0, x: 60 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: false, amount: 0.3 },
    transition: { duration: 0.6, ease: 'easeInOut' },
  };

  return (
    <>
      {/* 跑馬燈 Section */}
      <section className="bg-secondary-200 dark:bg-slate-800 py-3 shadow-md">
        <div className="relative overflow-hidden max-w-screen-xl mx-auto">
          <div className="whitespace-nowrap animate-marquee pause text-primary-800 dark:text-white text-sm font-medium flex items-center gap-6 px-4">
            <span>🏂 現正招募中：北海道出國團</span>
            <span>⛷️ 苗場初學教學團</span>
            <span>🎿 富良野自由行！</span>
            <span>📅 官方協助排課中</span>
            <span className="pl-6">🏂 現正招募中：北海道出國團</span>
            <span>⛷️ 苗場初學教學團</span>
            <span>🎿 富良野自由行！</span>
            <span>📅 官方協助排課中</span>
          </div>
        </div>
      </section>

      {/* Hero Section with Video */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover -z-10"
          src="/ProductHeroSection.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-black/60 -z-10" />
        <motion.div
          className="relative z-10 max-w-3xl mx-auto px-4 py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }} // Hero 區塊通常是立即顯示，所以用 animate 而非 whileInView
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-h4-tw sm:text-h2-tw md:text-h2-tw font-bold text-white mb-6 leading-tight">
            找人開團滑雪，
            <br className="sm:hidden" />
            一起嗨翻雪場！
          </h1>
          <p className="mt-4 text-h6-tw sm:text-h6-tw text-white/90 mb-8 max-w-xl mx-auto">
            不論是自由行或是想體驗教學，歡迎發起屬於你的行程，官方協助安排課程與教練，讓旅程更加完美！
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <motion.div
              initial={fadeInRight.initial}
              whileInView={fadeInRight.whileInView}
              viewport={fadeInRight.viewport}
              transition={{ ...fadeInRight.transition, delay: 0.3 }}
            >
              <Button
                onClick={() => router.push('/groups/create')}
                size="lg"
                className="px-10 py-6 bg-primary-500 hover:bg-primary-600 text-white text-[1.25rem] font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                立即開團
              </Button>
            </motion.div>
            <motion.div
              initial={fadeInLeft.initial}
              whileInView={fadeInLeft.whileInView}
              viewport={fadeInLeft.viewport}
              transition={{ ...fadeInLeft.transition, delay: 0.4 }}
            >
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/groups/list')}
                className="px-10 py-6 text-black text-[1.25rem] dark:bg-white dark:text-black border-white hover:bg-white hover:text-slate-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                查看揪團
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 統計卡片 - 浮動疊加樣式 */}
      <motion.div
        className="relative z-20 -mt-24 sm:-mt-28 md:-mt-20 flex justify-center px-4"
        initial={fadeInUp.initial}
        whileInView={fadeInUp.whileInView}
        viewport={fadeInUp.viewport}
        transition={{ ...fadeInUp.transition, duration: 1 }} // 可以為特定元素調整動畫時長
      >
        <div className="w-full max-w-2xl bg-white dark:bg-slate-800 shadow-2xl rounded-xl p-8 sm:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 sm:divide-x sm:divide-border dark:sm:divide-border text-center">
            <div className="px-4">
              <p className="text-h4-tw sm:text-h3-tw md:text-h2-tw font-bold text-primary-500 dark:text-primary transition-all duration-300 hover:scale-110">
                {groupStats.total}
              </p>
              <p className="text-sm sm:text-p-tw md:text-p-tw text-secondary-800 dark:text-muted-foreground mt-2">
                總揪團
              </p>
            </div>
            <div className="px-4">
              <p className="text-h4-tw sm:text-h3-tw md:text-h2-tw font-bold text-primary-500 dark:text-primary transition-all duration-300 hover:scale-110">
                {groupStats.ongoing}
              </p>
              <p className="text-sm sm:text-p-tw md:text-p-tw text-secondary-800 dark:text-muted-foreground mt-2">
                揪團中
              </p>
            </div>
            <div className="px-4">
              <p className="text-h4-tw sm:text-h3-tw md:text-h2-tw font-bold text-primary-500 dark:text-primary transition-all duration-300 hover:scale-110">
                {groupStats.formed}
              </p>
              <p className="text-sm sm:text-p-tw md:text-p-tw text-secondary-800 dark:text-muted-foreground mt-2">
                已成團
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 最新揪團 Section */}
      <section className="pt-20 sm:pt-32 md:pt-20 pb-16 md:pb-24 bg-white dark:bg-background">
        <div className="max-w-screen-xl mx-auto px-6">
          <motion.h2
            className="text-h3-tw sm:text-h2-tw font-bold text-center mb-12 sm:mb-16 text-secondary-800 dark:text-foreground"
            initial={fadeInUp.initial}
            whileInView={fadeInUp.whileInView}
            viewport={fadeInUp.viewport}
            transition={fadeInUp.transition}
          >
            最新揪團
          </motion.h2>
          {loadingLatest ? (
            <p className="text-center text-muted-foreground dark:text-muted-foreground py-10">
              載入最新揪團中...
            </p>
          ) : latestGroups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {latestGroups.map((group, index) => (
                <motion.div
                  key={group.id} // 將 key 移到 motion.div
                  initial={fadeInUp.initial}
                  whileInView={fadeInUp.whileInView}
                  viewport={fadeInUp.viewport}
                  transition={{ ...fadeInUp.transition, delay: index * 0.1 }} // 錯開動畫
                >
                  <Card
                    className="p-0 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 rounded-xl flex flex-col group bg-white dark:bg-card border border-transparent hover:border-primary-500 dark:border-border dark:hover:border-primary h-full gap-1" //確保卡片等高，如果需要
                  >
                    <Link href={`/groups/${group.id}`} className="block">
                      <div className="relative w-full h-56 sm:h-60">
                        <Image
                          src={
                            group.imageUrl && group.imageUrl.startsWith('/')
                              ? `${API_BASE}${group.imageUrl}`
                              : group.imageUrl || '/deadicon.png'
                          }
                          alt={group.title || '揪團封面'}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="group-hover:scale-105 transition-transform duration-300 rounded-t-xl"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          onError={(e) => {
                            e.currentTarget.src = '/deadicon.png';
                            e.currentTarget.alt = '圖片載入失敗';
                          }}
                        />
                      </div>
                    </Link>
                    <CardContent className="p-4 flex flex-col flex-grow">
                      <p className="text-xs font-semibold text-primary-500 dark:text-primary mb-1 uppercase tracking-wider">
                        {group.type || '滑雪團'}
                      </p>
                      <h3 className="text-h6-tw font-semibold text-secondary-800 dark:text-foreground mb-2 leading-snug">
                        {group.title}
                      </h3>
                      <p className="text-sm text-secondary-800 dark:text-muted-foreground mb-3 flex-grow line-clamp-3">
                        {group.description}
                      </p>
                      <div className="mt-auto pt-3 border-t border-border dark:border-border/50 flex items-center justify-between text-xs text-muted-foreground dark:text-muted-foreground">
                        <span>{group.location || '地點未定'}</span>
                        <span>
                          {new Date(group.startDate).toLocaleDateString(
                            'zh-TW',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.p
              className="text-center text-muted-foreground dark:text-muted-foreground py-10"
              initial={fadeInUp.initial}
              whileInView={fadeInUp.whileInView}
              viewport={fadeInUp.viewport}
              transition={fadeInUp.transition}
            >
              目前沒有最新揪團。
            </motion.p>
          )}
        </div>
      </section>

      {/* Daiski 幫你揪 Section */}
      <section className="py-16 md:py-24 bg-secondary-200 dark:bg-background">
        <div className="max-w-screen-lg mx-auto px-6 text-center">
          <motion.h2
            className="text-h3-tw sm:text-h2-tw font-bold mb-12 sm:mb-16 text-secondary-800 dark:text-foreground"
            initial={fadeInUp.initial}
            whileInView={fadeInUp.whileInView}
            viewport={fadeInUp.viewport}
            transition={fadeInUp.transition}
          >
            DAISKI 幫你揪
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {[
              {
                icon: CirclePlus,
                title: '免費開團',
                description:
                  '註冊開團完全免費，不收上架費，不限制開團數，輕鬆成為開團主。',
                animation: fadeInRight, // 使用定義好的變體
              },
              {
                icon: BadgeCheck,
                title: '快速審核',
                description:
                  '開團確認上架審核機制，審核快速準確，避免揪團資訊錯誤不到位。',
                animation: fadeInUp,
                delay: 0.1, // 稍微延遲中間的卡片
              },
              {
                icon: Megaphone,
                title: '社群曝光',
                description: '開團審核上架後可免費曝光，協助快速找到團員。',
                animation: fadeInLeft,
                delay: 0.2,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center p-6 sm:p-8 bg-white dark:bg-primary-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5"
                initial={feature.animation.initial}
                whileInView={feature.animation.whileInView}
                viewport={feature.animation.viewport}
                transition={{
                  ...feature.animation.transition,
                  delay: feature.delay || index * 0.1,
                }}
              >
                <div className="p-4 bg-secondary-200 dark:bg-primary/20 rounded-full mb-5">
                  <feature.icon
                    className="w-10 h-10 sm:w-12 sm:h-12 text-primary-500 dark:text-primary"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-h6-tw font-semibold mb-2 text-secondary-800 dark:text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-secondary-800 dark:text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
