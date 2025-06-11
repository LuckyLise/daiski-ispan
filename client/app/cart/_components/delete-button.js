'use client';

import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useCart } from '@/hooks/use-cart';

export default function Delete({ category = '', item = {}, name = '' }) {
  const { onRemove } = useCart();

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger>
          <div className="flex">
            <Trash2></Trash2>
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要刪除?</AlertDialogTitle>
            <AlertDialogDescription>將刪除:{name}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            {/* NOTE 待做 */}
            <AlertDialogAction onClick={() => onRemove(category, item)}>
              確認
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
