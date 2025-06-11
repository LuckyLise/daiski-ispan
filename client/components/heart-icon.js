'use client';

// 傳入true為實心，傳入false為空心

import { Heart } from 'lucide-react';
export default function IconHeart({ active }) {
  if (active) {
    return (
      <>
        <Heart fill="red" className="stroke-0"></Heart>
      </>
    );
  }
  if (active === false) {
    return (
      <>
        <Heart></Heart>
      </>
    );
  }
}
