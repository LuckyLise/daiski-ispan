'use client';

import Card from './card';

export default function HomeCard() {
  return (
    <>
      <section>
        <div className="flex flex-col items-center justify-center gap-10 px-[clamp(0.25rem,calc(0.25rem+0.35*(100vw-640px)),20rem)] py-[clamp(3rem,calc(3rem+0.018*(100vw-640px)),4rem)]">
          <h2 className="text-h6-en sm:text-h2-en font-en">
            DAISKI 滑雪俱樂部
          </h2>
          <p className="text-p-tw text-center font-tw">
            我們致力於提供頂級滑雪課程和高品質的滑雪用具選購服務，搭配專業且經驗豐富的教練團隊，為各年齡層與不同滑雪水平的您打造量身定制的滑雪體驗。
            <br />
            無論您是初學者還是資深滑雪者，我們的教練皆能根據您的需求提供個性化指導，協助您快速提升技能，盡情享受滑雪樂趣。
          </p>
        </div>
        <ul className="flex flex-col h-auto">
          <Card
            title="滑雪教學"
            imgSrc="/home-images/img_ins.x.png"
            className="xl:mb-[-5rem]"
            href="/courses"
          />
          <Card
            title="教練一覽"
            imgSrc="/home-images/img_ins.png"
            reverse /* 文字右 / 圖片左 */
            className="xl:mt-[10rem]"
            textClassName="sm:mb-[15rem] mb-[5rem] text-center"
            href="/coaches"
          />

          <Card
            title="揪團滑雪"
            imgSrc="/home-images/img_ins.3.png"
            className="sm:mt-[-5rem] md:mt-[-8rem] lg:mt-[-12rem] mt-[-3.5rem] mb-[5rem]"
            textClassName="mt-[2rem] sm:mt-[5rem] text-center"
            href="/groups"
          />
        </ul>
      </section>
    </>
  );
}
