'use client';
import { ShoppingCart } from 'lucide-react';
import { SquarePen } from 'lucide-react';
import { CircleCheckBig } from 'lucide-react';
import clsx from 'clsx';

export default function Process({ step }) {
  const bgSize =
    'flex items-center justify-center rounded-full  w-16 h-16 flex-shrink-0';
  const iconSize =
    'h-8 w-8 p-0 flex items-center justify-center stroke-1 flex-shrink-0';
  const nowStepBgColor = `bg-primary-600`;
  const nowStepIconColor = `stroke-secondary-200`;
  const otherStepBgColor = `bg-secondary-500`;
  const otherStepIconColor = `stroke-primary-600`;

  return (
    <>
      <div className="flex items-center justify-center flex-col">
        <div className="m-5 w-full py-5 px-16 lg:px-50 ">
          <div className="flex items-center justify-center  ">
            <div
              className={clsx(bgSize, {
                [nowStepBgColor]: step === '1',
                [otherStepBgColor]: step === '2' || step === '3',
              })}
            >
              <ShoppingCart
                className={clsx(iconSize, {
                  [nowStepIconColor]: step === '1',
                  [otherStepIconColor]: step === '2' || step === '3',
                })}
              />
            </div>

            <div className="w-full  h-[5] bg-secondary-500" />

            <div
              className={clsx(bgSize, {
                [nowStepBgColor]: step === '2',
                [otherStepBgColor]: step === '1' || step === '3',
              })}
            >
              <SquarePen
                className={clsx(iconSize, {
                  [nowStepIconColor]: step === '2',
                  [otherStepIconColor]: step === '1' || step === '3',
                })}
              />
            </div>

            <div className="w-full h-[5] bg-secondary-500" />

            <div
              className={clsx(bgSize, {
                [nowStepBgColor]: step === '3',
                [otherStepBgColor]: step === '1' || step === '2',
              })}
            >
              <CircleCheckBig
                className={clsx(iconSize, {
                  [nowStepIconColor]: step === '3',
                  [otherStepIconColor]: step === '1' || step === '2',
                })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between ">
            <div className="flex items-center justify-center flex-col">
              <p className="text-p-tw">Step 1</p>
              <p className="text-p-tw">確認訂購</p>
            </div>
            <div className="flex items-center justify-center flex-col">
              <p className="text-p-tw">Step 2</p>
              <p className="text-p-tw">填寫資料</p>
            </div>
            <div className="flex items-center justify-center flex-col">
              <p className="text-p-tw">Step 3</p>
              <p className="text-p-tw">完成訂購</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
