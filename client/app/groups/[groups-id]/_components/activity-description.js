'use client';
import React from 'react';
import { Card } from '@/components/ui/card';

export default function ActivityDescription({ description }) {
  return (
    <Card className="w-full max-w-screen-2xl mx-auto shadow-lg p-6 rounded-lg border-t border-border bg-card text-foreground mt-8 dark:bg-primary-800">
      <h3 className="text-lg font-semibold mb-4 text-primary-800 dark:text-white">
        活動說明
      </h3>
      <p className="leading-relaxed text-secondary-800 text-p-tw whitespace-pre-wrap dark:text-white">
        {description || '主辦人尚未提供詳細活動說明。'}
      </p>
    </Card>
  );
}
