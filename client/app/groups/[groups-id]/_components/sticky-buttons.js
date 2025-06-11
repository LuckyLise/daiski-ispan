'use client';
import React from 'react';
import { Button } from '@/components/ui/button';

export default function MobileStickyButtons({ groupTitle, groupId, onJoinGroup, onJoinChat }) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-background border-t border-border flex space-x-2 p-2 md:hidden shadow-top-md z-40">
      <Button
        onClick={onJoinGroup}
        className="flex-1 py-3 bg-primary-500 text-white font-semibold text-p-tw text-center hover:bg-primary-600 transition active:scale-95 active:shadow-sm rounded-md"
      >我要參加</Button>
      <Button
        variant="outline"
        onClick={onJoinChat}
        className="flex-1 py-3 border-primary-500 text-primary-500 font-semibold text-p-tw hover:bg-primary-500/10 transition active:scale-95 active:shadow-sm rounded-md"
      >加入聊天室</Button>
    </div>
  );
}
