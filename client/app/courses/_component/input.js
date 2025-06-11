import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
export function InputWithButton() {
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input type="email" placeholder="請輸入關鍵字..." />
      <Button type="submit">
        <Send />
        搜尋
      </Button>
    </div>
  );
}
