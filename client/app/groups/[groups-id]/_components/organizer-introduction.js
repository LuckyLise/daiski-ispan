'use client';
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function OrganizerSection({ user, API_BASE }) {
  // 如果 user 或 user.introduction 不存在，則不渲染此組件
  if (!user?.introduction) return null;

  return (
    <Card className="w-full max-w-screen-2xl mx-auto shadow-lg p-6 rounded-lg border-t border-border bg-card text-foreground mt-8">
      <h3 className="text-lg font-semibold mb-4 text-primary-800">
        主辦人介紹
      </h3>
      <div className="flex items-start space-x-4">
        <Avatar className="w-16 h-16 flex-shrink-0">
          <AvatarImage
            src={user.avatar ? `${API_BASE}${user.avatar}` : undefined}
            alt={user.name}
          />
          <AvatarFallback>
            {user.name ? user.name[0].toUpperCase() : '主'}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-foreground text-base">{user.name}</p>
          <p className="leading-relaxed text-secondary-800 text-p-tw whitespace-pre-wrap mt-1">
            {user.introduction}
          </p>
        </div>
      </div>
    </Card>
  );
}
