'use client';

import Slide from './slide';
import Content from './content';

export default function HomeNewProduct() {
  return (
    <>
      <div className="relative">
        <Slide />
        <div className="absolute left-1/2 top-1/5 -translate-x-1/2 -translate-y-[clamp(-100%,calc(-100%+0.056*(100vw-393px)),-50%)] z-[1]">
          <Content />
        </div>
      </div>
    </>
  );
}
