'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
export default function CouponSelectedStates({
  state,
  selectedStates,
  setSelectedStates,
  onClick,
}) {
  const isActive = selectedStates === state;

  return (
    <>
      <button
        className={`font-tw leading-p-tw hover:underline decoration-red decoration-2 underline-offset-4 cursor-pointer ${
          isActive ? 'underline' : ''
        }`}
        onClick={onClick}
      >
        {state}
      </button>
      {/* <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectItem value="grapes">Grapes</SelectItem>
            <SelectItem value="pineapple">Pineapple</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select> */}
    </>
  );
}
