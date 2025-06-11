'use client';

import { Moon, Sun } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from './ui/button';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Toggle } from './ui/toggle';
import { useState, useEffect } from 'react';

export default function DarkMode() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* 夜間模式測試 */}
      {/* <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme('light')}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('system')}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}
      {/* <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label="Toggle theme"
        // 不動原本的 icon transition
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button> */}
      {/* <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        aria-label="Toggle theme"
      >

        <div className="flex items-center space-x-2">
          <Sun className={`${isDark ? 'opacity-50' : 'opacity-100'}`} />
          <Moon className={`${isDark ? 'opacity-100' : 'opacity-50'}`} />
        </div>
      </Switch> */}
      {/* <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label="Toggle theme"
        // 把樣式硬寫成跟 Button 類似，icon 部分保留原本 transition
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-transparent p-0"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </button> */}

      <Toggle
        onPressedChange={() => {
          setTheme(theme === 'light' ? 'dark' : 'light');
        }}
        aria-label="Toggle theme"
        className="relative h-8 w-8 rounded-md border border-input bg-transparent p-0"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Toggle>
    </>
  );
}
