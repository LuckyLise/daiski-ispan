import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './use-auth';
// context套用第1步: 建立context
// createContext的傳入參數defaultValue也有備援值(context套用失敗或錯誤出現的值)
// 以下為jsdoc的註解，這個註解是用來描述這個context的值的結構
/**
 * 購物車上下文，用於提供購物車相關的狀態和操作函式。
 *
 * 此上下文包含購物車的商品列表、操作函式（如增加、減少、移除商品）以及購物車的總數量和總金額。
 *
 * @typedef {Object} CartContextValue
 * @property {Array} items - 購物車中的商品列表，每個商品是包含 `id`、`count` 等屬性的物件。
 * @property {(itemId: string) => void} onIncrease - 用於增加購物車中某商品數量的函式。
 * @property {(itemId: string) => void} onDecrease - 用於減少購物車中某商品數量的函式。
 * @property {(itemId: string) => void} onRemove - 用於移除購物車中某商品的函式。
 * @property {(cartItem: { id: int; category: string; }) => void} onAdd - 用於將新商品加入購物車的函式。
 * @property {number} totalQty - 購物車中所有商品的總數量。
 * @property {number} totalAmount - 購物車中所有商品的總金額。
 */
/**
 * 購物車上下文，用於提供購物車相關的狀態和操作函式。
 *
 * @category {React.Context<CartContextValue | null>}
 */
const CartContext = createContext(null);
// 設定displayName屬性(react devtools除錯用)
CartContext.displayName = 'CartContext';

// 有共享狀態的CartProvider元件，用來包裹套嵌的元件
export function CartProvider({ children }) {
  const { isAuth } = useAuth();
  // 購物車中的項目 與商品的物件屬性會相差一個count屬性(數字類型，代表購買數量)
  // const [items, setItems] = useState([]);
  const [cart, setCart] = useState({
    CartProduct: [],
    CartGroup: [],
    CartCourse: [],
  });

  console.log(cart);
  // 代表是否完成第一次渲染呈現的布林狀態值(信號值)
  const [didMount, setDidMount] = useState(false);

  // 資料庫與狀態同步
  async function fetchSyncData() {
    try {
      const url = 'http://localhost:3005/api/cart';
      const res = await fetch(url, { credentials: 'include' });
      const json = await res.json();
      setCart(json.cart);
    } catch (err) {
      throw new Error(err);
    }
  }

  // 將資料傳給後端
  async function fetchData(category = '', item = {}, method = '') {
    try {
      console.log(item);
      let url = '';
      if (method === 'POST') {
        url = 'http://localhost:3005/api/cart';
      } else if (method === 'PUT' || method === 'DELETE') {
        url = `http://localhost:3005/api/cart/${item.id}`;
      }
      let data = {};
      if (method === 'POST') {
        if (category === 'CartProduct') {
          data = {
            itemId: item.id,
            category: category,
            quantity: item.quantity ? item.quantity : 1,
          };
        } else {
          data = {
            itemId: item.id,
            category: category,
          };
        }
      } else if (method === 'PUT' || method === 'DELETE') {
        data = { category, item };
      }

      const res = await fetch(url, {
        method: method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const response = await res.json();

      console.log(response);
      fetchSyncData();
      //  設定到狀態(第二次同步確認用，第一次為樂觀更新)
    } catch (err) {
      throw new Error(err);
    }
  }

  // 處理遞增
  const onIncrease = (category, item) => {
    let nextItem;

    const nextList = cart[category].map((v) => {
      if (v.id === item.id) {
        nextItem = {
          ...v,
          quantity: v.quantity + (item.quantity ? item.quantity : 1),
        };
        return {
          ...v,
          quantity: v.quantity + (item.quantity ? item.quantity : 1),
        };
      } else {
        return v;
      }
    });

    const nextCart = {
      ...cart,
      [category]: nextList,
    };
    setCart(nextCart);
    fetchData(category, nextItem, 'PUT');
  };

  // FIXME 處理遞減
  const onDecrease = (category, item) => {
    let nextItem;
    const nextList = cart[category].map((v) => {
      if (v.id === item.id) {
        nextItem = { ...v, quantity: v.quantity - 1 };
        return { ...v, quantity: v.quantity - 1 };
      } else {
        return v;
      }
    });
    const nextCart = {
      ...cart,
      [category]: nextList,
    };

    setCart(nextCart);
    fetchData(category, nextItem, 'PUT');
    //   // 3 設定到狀態
    //   setCart(...cart, nextCart);
  };

  // 處理刪除
  const onRemove = (category, item) => {
    fetchData(category, item, 'DELETE');
    console.log('刪除' + item.id);

    if (category === 'CartGroup') {
      async function fetchData() {
        try {
          const url = `http://localhost:3005/api/group/members/${item.id}`;
          const res = await fetch(url, {
            method: 'DELETE',
            credentials: 'include',
          });
        } catch (err) {
          throw new Error(err);
        }
      }
      fetchData();
    } else if (category === 'CartCourse') {
      async function fetchData() {
        try {
          const url = `http://localhost:3005/api/coaches/cancel/${item.id}}`;
          const res = await fetch(url, {
            method: 'DELETE',
            credentials: 'include',
          });
        } catch (err) {
          throw new Error(err);
        }
      }
      fetchData();
    }
  };

  // 清空購物車
  const onClear = () => {
    async function fetchData() {
      try {
        const url = `http://localhost:3005/api/cart/items`;
        const res = await fetch(url, {
          method: 'DELETE',
          credentials: 'include',
        });
        fetchSyncData();
      } catch (err) {
        throw new Error(err);
      }
    }
    fetchData();
  };

  // 處理新增
  const onAdd = (category = '', item = {}) => {
    const categoryOptions = ['CartGroup', 'CartProduct', 'CartCourse'];
    console.log(category);

    //  如果沒有該類別要return
    if (!categoryOptions.includes(category)) {
      return console.log('分類錯誤');
    }
    // 判斷要加入的商品物件是否已經在購物車狀態
    const foundIndex = cart[category].findIndex((v) => v.id === item.id);
    if (foundIndex !== -1) {
      // 如果有找到 ===> 遞增購物車狀態商品數量
      if (category === 'CartProduct') {
        onIncrease(category, item);
      } else {
        console.log('已重複且非商品，無作為');
      }
    } else {
      // 否則 ===> 新增到購物車狀態
      const nextCart = {
        ...cart,
        [category]: [...(cart[category] || []), item],
      };
      setCart(nextCart);
      fetchData(category, item, 'POST');
    }
  };

  // 使用陣列的迭代方法reduce(歸納, 累加)
  const totalQty = [
    { type: 'CartProduct', quantity: 0 },
    { type: 'CartGroup', quantity: 0 },
    { type: 'CartCourse', quantity: 0 },
  ];

  for (const list of totalQty) {
    const key = list.type;
    if (cart?.[key]) {
      list.quantity = cart[key].reduce(
        (acc, v) => acc + (v.quantity ? v.quantity : 1),
        0
      );
    }
  }

  // const totalAmount = [
  //   { type: 'CartProduct', amount: 0 },
  //   { type: 'CartGroup', amount: 0 },
  //   { type: 'CartCourse', amount: 0 },
  // ];

  // for (const list of totalAmount) {
  //   const key = list.type;
  //   if (cart?.[key]) {
  //     list.price = cart[key].reduce(
  //       (acc, v) => acc + v.price * (v.quantity ? v.quantity : 1),
  //       0
  //     );
  //   }
  // }

  // 第一次渲染完成後，從localStorage取出儲存購物車資料進行同步化
  useEffect(() => {
    // 與資料庫同步資料
    fetchSyncData();
    // 第一次渲染完成
    setDidMount(true);
  }, []);

  // 登入後與資料庫同步同步
  useEffect(() => {
    if (didMount) {
      fetchSyncData();
    }
  }, [isAuth]);

  return (
    <>
      <CartContext.Provider
        // 如果傳出的值很多時，建議可以將數值/函式分組，然後依英文字母排序
        value={{
          cart,

          // totalAmount,
          totalQty,
          setCart,

          onAdd,
          onDecrease,
          onIncrease,
          onRemove,
          onClear,
          fetchSyncData,
        }}
      >
        {children}
      </CartContext.Provider>
    </>
  );
}

// 搭配上面的CartProvider專門客製化名稱的勾子，目的是提供更好的閱讀性
/**
 * 自訂 Hook，用於存取購物車的context(上下文)。
 *
 * 此 Hook 提供購物車context(上下文)的存取功能，包括購物車中的商品列表、
 * 增加、減少、移除商品數量的函式，以及計算購物車總數量與總金額的功能。
 * 使用此 Hook 時，必須在 CartProvider 的子元件中使用。
 *
 * @returns {CartContextValue} 購物車context(上下文)的值。
 *
 * @example
 * const { items, onAdd, onRemove, totalQty, totalAmount } = useCart();
 */
export const useCart = () => useContext(CartContext);
