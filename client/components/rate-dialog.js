'use client';

import { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
// 只從 ui/slider 匯入 Slider 即可，因為子組件掛在 Slider 下
import { Slider } from '@/components/ui/slider';

export default function RateDialog({ orderId, productId, open, onOpenChange }) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3005';

  useEffect(() => {
    if (open) {
      setRating(0);
      setReviewText('');
    }
  }, [open]);

  const renderStars = () => {
    const icons = [];
    let remaining = rating;
    for (let i = 0; i < 5; i++) {
      if (remaining >= 1) {
        icons.push(<FaStar key={i} className="text-yellow-500" />);
        remaining -= 1;
      } else if (remaining >= 0.5) {
        icons.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
        remaining -= 0.5;
      } else {
        icons.push(<FaRegStar key={i} className="text-yellow-500" />);
      }
    }
    return icons;
  };

  const submitRating = async () => {
    try {
      const res = await fetch(
        `${base}/api/products/${productId}/orders/${orderId}/rate`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rating,
            review_text: reviewText,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        alert('錯誤：' + (data.message || '提交失敗'));
        return;
      }
      onOpenChange(false);
      alert('評分已送出！');
    } catch (error) {
      console.error(error);
      alert('提交評分時發生錯誤');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>評價此商品</DialogTitle>
          <DialogDescription>
            給予 0.0～5.0 星評分，並留下您的心得。
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 text-2xl mt-4">{renderStars()}</div>

        {/* Shadcn Slider：step=0.5, min=0, max=5 */}
        <div className="px-2 mt-2">
          <Slider
            defaultValue={[0]}
            max={5}
            step={0.5}
            value={[rating]}
            onValueChange={(val) => {
              setRating(val[0]);
            }}
          >
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb />
          </Slider>
        </div>

        <p className="text-sm text-gray-600 dark:text-white mt-1">
          目前評分：{rating.toFixed(1)}
        </p>

        <textarea
          className="w-full border rounded-md p-2 mt-4 resize-none"
          rows={4}
          placeholder="留下您的使用心得 (選填)"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={submitRating} disabled={rating === 0}>
            送出
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
