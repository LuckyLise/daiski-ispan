import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
export default function ProductSidebarSearch({
  searchValue,
  onChangeSearch,
  suggestions,
  isLoading,
  onSelect,
}) {
  return (
    // <Command className="max-h-20 overflow-clip">
    //   <div className="relative border-b border-[#d8d8d8] ">
    //     {/* <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#969696]" /> */}
    //     <CommandInput
    //       className="pl-4"
    //       placeholder="搜尋商品..."
    //       value={searchValue}
    //       onValueChange={onChangeSearch}
    //     />
    //   </div>
    //   <CommandList>
    //     {isLoading && (
    //       <div className="p-2 text-sm text-gray-500">搜尋中...</div>
    //     )}
    //     {!isLoading && suggestions.length === 0 && searchValue.length >= 2 && (
    //       <div className="p-2 text-sm text-gray-500">找不到結果</div>
    //     )}
    //     {suggestions.map((item) => (
    //       <CommandItem
    //         key={item.id}
    //         value={item.name}
    //         onSelect={() => onSelect(item)}
    //         className="px-6 py-3 text-p-tw hover:bg-gray-50"
    //       >
    //         {item.name}
    //       </CommandItem>
    //     ))}
    //   </CommandList>
    // </Command>

    <Command className="h-auto">
      <div className="relative border-b border-[#d8d8d8]">
        <CommandInput
          className="pl-4"
          placeholder="搜尋商品..."
          value={searchValue}
          onValueChange={onChangeSearch}
        />
      </div>

      {/* 條件渲染 CommandList */}
      {(searchValue.length >= 2 || suggestions.length > 0) && (
        <CommandList className="max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-2 text-sm  text-gray-500 dark:text-white">
              搜尋中...
            </div>
          ) : (
            <>
              {suggestions.length === 0 ? (
                <CommandEmpty className="p-2 text-sm  text-gray-500 dark:text-white">
                  找不到結果
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {suggestions.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.name}
                      onSelect={() => onSelect(item)}
                      className="px-6 py-3 text-p-tw hover:bg-gray-50"
                    >
                      {item.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      )}
    </Command>
  );
}
