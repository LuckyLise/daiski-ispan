'use client';
import React from 'react';

export function GradientDivider() {
  return (
    <div className="w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg" />
  );
}

export function WavyDivider() {
  return (
    <div className="w-full overflow-hidden leading-[0px]">
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="relative block w-full h-[80px] md:h-[120px] fill-gray-100"
      >
        <path d="M0,64 C200,0 400,120 600,64 C800,0 1000,120 1200,64 L1200,120 L0,120 Z" />
      </svg>
    </div>
  );
}

export function DiagonalDivider() {
  return (
    <div className="h-20 md:h-32 bg-gradient-to-r from-slate-100 to-gray-50 transform -skew-y-3 my-[-1px]"></div>
  );
}