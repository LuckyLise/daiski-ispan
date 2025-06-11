// {/* <div key={category + item.id} className="flex justify-between">
//                 {/* 圖與名稱 */}
//                 <div className="flex  w-full ">
//                   {item.imageUrl && (
//                     <Image
//                       // FIXME
//                       // fill
//                       src={
//                         item?.imageUrl
//                           ? `http://localhost:3005${item.imageUrl}`
//                           : ''
//                       }
//                       alt={item.imageUrl}
//                       width={96}
//                       height={96}
//                       className="object-cover w-[96]"
//                     ></Image>
//                   )}
//                   <div>
//                     <p>{item.name}</p>
//                   </div>
//                 </div>
//                 {/* 時間 */}

//                 {category !== 'CartProduct' && (
//                   <div className="w-full flex justify-center items-center flex-col ">
//                     <p className="flex flex-col">
//                       <span className="text-h6-tw ">
//                         {toUTC8(item?.startAt)}
//                       </span>
//                       <span className="text-p-tw flex justify-end  ">
//                         ~{toUTC8(item?.endAt)}
//                       </span>
//                     </p>
//                   </div>
//                 )}

//                 {/* 尺寸 */}
//                 {category === 'CartProduct' && (
//                   <div className="w-full flex justify-center items-center ">
//                     <p className="text-h6-tw">{item?.size}</p>
//                   </div>
//                 )}

//                 {/* 價格 */}
//                 <div className="w-full flex justify-center items-center ">
//                   <p className="text-h6-tw">${totalPrice}</p>
//                 </div>
//                 {/* 數量(只有商品有) */}
//                 {category === 'CartProduct' && (
//                   <div className="flex justify-center w-full items-center">
//                     <QuantityButton
//                       item={item}
//                       category={category}
//                       type="minus"
//                     ></QuantityButton>
//                     <div className="flex justify-center w-[50]">
//                       <p className="text-h6-tw">{item.quantity}</p>
//                     </div>
//                     <QuantityButton
//                       item={item}
//                       category={category}
//                       type="plus"
//                     ></QuantityButton>
//                   </div>
//                 )}
//                 {/* FIXME */}
//                 {/* 活動日期(只有課程跟揪團有) */}
//                 {/* 收藏、刪除 */}
//                 <div className="flex justify-center w-full gap-4">
//                   {/* <WishList
//                   wishList={wishList}
//                   index={i}
//                   setWishList={setWishList}
//                 ></WishList> */}
//                   {/* FIXME 收藏按鈕 */}
//                   {/* {category === 'CartProduct' && <Favorite data></Favorite>} */}

//                   {/* 刪除只有商品有 */}
//                   {category === 'CartProduct' && (
//                     <Delete
//                       name={item.name}
//                       category={category}
//                       item={item}
//                     ></Delete>
//                   )}
//                 </div>
//               </div> */}
