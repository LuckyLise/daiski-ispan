import express from 'express';
import prisma from '../../lib/prisma.js';

// 解token獲得使用者資訊
import authenticate from '../../middlewares/authenticate.js';

const router = express.Router();

const cartCreateMap = {
  CartGroup: prisma.cartGroup,
  CartProduct: prisma.cartProduct,
  CartCourse: prisma.cartCourse,
};
const foreignKeyMap = {
  CartGroup: 'groupMemberId',
  CartProduct: 'productSkuId',
  CartCourse: 'courseVariantId',
};

// 註冊完成時要分配一台購物車給使用者
router.post('/createCart/:id', async function (req, res) {
  const userId = +req.params.id;
  // FIXME 要處理使用者有購物車的話則部新增
  try {
    const userCart = await prisma.cart.create({
      data: { userId },
    });

    return res
      .status(200)
      .json({ status: 'success', message: '建立購物車成功' });
  } catch (error) {
    return res.status(200).json({ status: 'fail', message: '建立購物車失敗' });
  }
});

// 新增
router.post('/', authenticate, async function (req, res, next) {
  try {
    const userId = +req.user.id;
    const category = req.body.category;
    const itemId = +req.body.itemId;
    const quantity = +req.body.quantity ? +req.body.quantity : 1;

    // 檢查分類
    const cartModel = cartCreateMap[category];
    const foreignKeyName = foreignKeyMap[category];

    if (!cartModel) {
      return res.status(200).json({ status: 'fail', message: '分類不存在' });
    }

    // 查詢使用者對應的購物車
    const userCart = await prisma.cart.findFirst({
      where: { userId },
    });

    // 新增
    try {
      // 判斷是否存在，若不存在才新增，否則用PUT增加
      const existingItem = await cartModel.findFirst({
        where: {
          cartId: +userCart.id,
          [foreignKeyName]: itemId,
        },
      });

      if (!existingItem) {
        if (category === 'CartProduct') {
          await cartModel.create({
            data: {
              cartId: userCart.id,
              [foreignKeyName]: itemId,
              quantity: quantity,
            },
          });
        } else {
          // 非商品沒有數量屬性
          await cartModel.create({
            data: {
              cartId: userCart.id,
              [foreignKeyName]: itemId,
            },
          });
        }
        return res.status(200).json({ status: 'success', data: '新增成功' });
      }
      return res
        .status(200)
        .json({ status: 'fail', data: '新增失敗，已存在，請改用PUT' });
    } catch (error) {
      return res.status(200).json({ status: 'fail', data: '新增失敗' });
    }
  } catch (e) {
    next(e);
  }
});

// 查詢
router.get('/', authenticate, async function (req, res) {
  try {
    const userId = +req.user.id;

    const data = await prisma.cart.findFirst({
      select: {
        CartProduct: {
          select: {
            id: true,
            quantity: true,
            productSku: {
              select: {
                id: true,
                price: true,
                product_size: {
                  select: {
                    name: true,
                  },
                },
                product: {
                  select: {
                    name: true,
                    product_image: {
                      select: {
                        url: true,
                      },
                      where: {
                        sort_order: 0,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        CartCourse: {
          select: {
            courseVariant: {
              select: {
                id: true,
                price: true,
                duration: true,
                start_at: true,
                course: {
                  select: {
                    name: true,
                    CourseImg: {
                      select: {
                        img: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        CartGroup: {
          include: {
            groupMember: {
              select: {
                group: {
                  select: {
                    id: true,
                    title: true,
                    startDate: true,
                    endDate: true,
                    price: true,
                    location: { select: { name: true } },
                    customLocation: true,
                    images: {
                      select: { imageUrl: true },
                      orderBy: { sortOrder: 'asc' },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },

      where: {
        userId: userId,
      },
    });

    // 商品、課程、揪團攤平
    const CartProduct = data.CartProduct.map((item) => ({
      id: item.productSku.id,
      quantity: item.quantity,
      price: item.productSku.price,
      name: item.productSku.product.name,
      imageUrl: item.productSku.product.product_image[0].url,
      size: item.productSku.product_size?.name,
    }));

    const CartCourse = data.CartCourse.map((item) => {
      const start_at = item.courseVariant.start_at;
      const duration = item.courseVariant.duration;
      const date = new Date(start_at);
      date.setHours(date.getHours() + duration);
      const end_at = date.toISOString();
      return {
        id: item.courseVariant.id,
        price: item.courseVariant.price,
        name: item.courseVariant.course.name,
        imageUrl:
          item.courseVariant.course.CourseImg[
            item.courseVariant.course.CourseImg.length - 1
          ].img,
        startAt: start_at,
        endAt: end_at,
        duration: duration,
      };
    });

    const CartGroup = data.CartGroup.map((item) => ({
      id: item.groupMemberId,
      name: item.groupMember.group.title,
      startAt: item.groupMember.group.startDate,
      endAt: item.groupMember.group.endDate,
      price: item.groupMember.group.price,
      // FIXME若無照片則回傳預設
      imageUrl: item.groupMember.group.images[0].imageUrl
        ? item.groupMember.group.images[0].imageUrl
        : '',
    }));

    const totalCartProduct = CartProduct.reduce((acc, product) => {
      acc += product.price * product.quantity;
      return acc;
    }, 0);
    const totalCartCourse = CartCourse.reduce((acc, course) => {
      acc += course.price;
      return acc;
    }, 0);

    // 調用後端API獲得Group資料;
    // let resGroup = await fetch(
    //   `http://localhost:3005/api/group/user/${userId}`
    // );
    // let CartGroup = (await resGroup.json()).memberships;

    // 優惠券
    const token = req.token;

    let resCoupon = await fetch(
      `http://localhost:3005/api/coupons/cartcoupon`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    let CartCoupon = (await resCoupon.json()).cartcoupon;

    CartCoupon = CartCoupon.map((item) => {
      const id = item.id;
      const name = item.name;
      const target = item.target;
      const amount = item.amount;
      const type = item.type;
      const endAt = item.endAt;
      const minPurchase = item.minPurchase;
      let canUse = false;
      const checked = false;
      // totalCartCourse
      // totalCartProduct
      if (target === '全站') {
        if (totalCartProduct + totalCartCourse >= minPurchase) {
          canUse = true;
        }
      } else if (target === '商品') {
        if (totalCartProduct >= minPurchase) {
          canUse = true;
        }
      } else if (target === '課程') {
        if (totalCartCourse >= minPurchase) {
          canUse = true;
        }
      }
      return {
        id,
        name,
        target,
        amount,
        type,
        endAt,
        minPurchase,
        canUse,
        checked,
      };
    });

    const cart = {
      ...data,
      CartProduct,
      CartCourse,
      CartGroup,
      CartCoupon,
      userInfo: {
        name: '',
        phone: '',
      },
      shippingInfo: {
        zipCode: '',
        address: '',
        shippingMethod: '',
        storename: '',
      },
      payment: '',
    };

    return res.status(200).json({ status: 'success', cart });
  } catch (error) {
    return res
      .status(200)
      .json({ status: 'fail', message: `查詢失敗:${error}` });
  }
});

// 更新(只有商品有數量，課程跟揪團票券固定只有1)
router.put('/:itemId', authenticate, async function (req, res) {
  const category = req.body.category;
  // 檢查分類
  const cartModel = cartCreateMap[category];
  const foreignKeyName = foreignKeyMap[category];

  if (!cartModel) {
    return res.status(200).json({ status: 'fail', message: '分類不存在' });
  }

  const userId = +req.user.id;
  const nextItem = req.body.item;

  // 查詢使用者對應的購物車
  const userCart = await prisma.cart.findFirst({
    where: { userId },
  });
  try {
    await prisma.cartProduct.updateMany({
      where: {
        cartId: +userCart.id,
        [foreignKeyName]: +req.params.itemId,
      },
      data: {
        quantity: nextItem.quantity,
      },
    });

    res.status(200).json({ status: 'success', data: '更新商品成功' });
  } catch (error) {
    res.status(200).json({ status: 'fail', message: '更新商品失敗' });
  }
});
// 清空購物車
router.delete('/items', authenticate, async function (req, res) {
  try {
    const userId = +req.user.id;
    // 查詢使用者對應的購物車
    const userCart = await prisma.cart.findFirst({
      where: { userId },
    });

    await prisma.cartCourse.deleteMany({
      where: {
        cartId: +userCart.id,
      },
    });
    await prisma.cartProduct.deleteMany({
      where: {
        cartId: +userCart.id,
      },
    });
    await prisma.cartGroup.deleteMany({
      where: {
        cartId: +userCart.id,
      },
    });

    return res.status(200).json({ status: 'success', message: '購物車已清空' });
  } catch (error) {
    return res
      .status(200)
      .json({ status: 'fail', message: `查詢失敗:${error}` });
  }
});
// 刪除特定商品
router.delete('/:itemId', authenticate, async function (req, res) {
  try {
    const category = req.body.category;
    // 檢查分類
    const cartModel = cartCreateMap[category];
    const foreignKeyName = foreignKeyMap[category];

    if (!cartModel) {
      return res.status(200).json({ status: 'fail', message: '分類不存在' });
    }

    const userId = +req.user.id;
    // 查詢使用者對應的購物車
    const userCart = await prisma.cart.findFirst({
      where: { userId },
    });

    await cartModel.deleteMany({
      where: {
        cartId: +userCart.id,
        [foreignKeyName]: +req.params.itemId,
      },
    });

    res.status(200).json({ status: 'success', message: '刪除成功' });
  } catch (error) {
    res
      .status(200)
      .json({ status: 'fail', message: '刪除失敗', error: { error } });
  }
});

// 新增單筆訂單紀錄
router.post('/order', authenticate, async function (req, res) {
  try {
    const userId = +req.user.id;
    const orderInput = req.body;
    console.log(orderInput);
    const {
      shipping,
      payment,
      name,
      phone,
      address,
      amount,
      couponId,
      CartGroup,
      CartCourse,
      CartProduct,
    } = orderInput;

    const orderResult = await prisma.order.create({
      data: {
        userId,
        amount,
        couponId,
        payment,
        address,
        phone,
        name,
        shipping,
      },
    });

    const newOrderId = +orderResult.id;

    // 揪團
    const groupIds = CartGroup.map((item) => item.id);
    const orderGroup = groupIds.map((groupId) => ({
      orderId: newOrderId,
      groupMemberId: groupId,
    }));

    const orderGroupResult = await prisma.orderGroup.createMany({
      data: orderGroup,
    });

    // 課程
    const courseIds = CartCourse.map((item) => item.id);
    const orderCourse = courseIds.map((courseId) => ({
      orderId: newOrderId,
      courseVariantId: courseId,
    }));

    const orderCourseResult = await prisma.orderCourse.createMany({
      data: orderCourse,
    });

    // 商品
    const orderProduct = CartProduct.map((product) => ({
      orderId: newOrderId,
      productSkuId: product.id,
      quantity: product.quantity,
    }));

    const orderProductResult = await prisma.orderProduct.createMany({
      data: orderProduct,
    });

    return res.status(200).json({ status: 'success', data: newOrderId });
  } catch (error) {
    res
      .status(200)
      .json({ status: 'fail', message: '訂單失敗:', error: { error } });
  }
});

// 會員訂單紀錄
router.get('/orders', authenticate, async function (req, res) {
  try {
    const userId = +req.user.id;

    const ordersResult = await prisma.order.findMany({
      select: {
        id: true,
        amount: true,
        createdAt: true,
        orderProduct: {
          select: {
            quantity: true,
            productSku: {
              select: {
                id: true,
                product: {
                  select: {
                    name: true,
                    product_image: {
                      select: {
                        url: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderCourse: {
          select: {
            courseVariant: {
              select: {
                course: {
                  select: {
                    name: true,
                    CourseImg: {
                      select: {
                        img: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderGroup: {
          select: {
            groupMember: {
              select: {
                group: {
                  select: {
                    title: true,
                    images: {
                      select: {
                        imageUrl: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const toUTC8 = (utcString) => {
      const date = new Date(utcString);
      date.setHours(date.getHours() + 8); // 加上 8 小時
      const [d, t] = date.toISOString().split('T');
      return `${d} ${t.split('.')[0].slice(0, 5)}`;
    };

    const orders = ordersResult.map((order) => {
      return {
        id: order.id,
        amount: order.amount,
        createdAt: toUTC8(order.createdAt),

        // 商品名稱陣列
        OrderProduct: order.orderProduct.map((item) => {
          return {
            id: item.productSku.id,
            quantity: item.quantity,
            name: item.productSku.product.name,
            imageUrl: item.productSku.product.product_image[0].url,
          };
        }),

        OrderCourse: order.orderCourse.map((item) => {
          return {
            name: item.courseVariant.course.name,
            imageUrl: item.courseVariant.course.CourseImg[0]?.img,
          };
        }),

        OrderGroup: order.orderGroup.map((item) => {
          return {
            name: item.groupMember.group.title,
            imageUrl: item.groupMember.group.images[0].imageUrl,
          };
        }),
      };
    });

    return res.status(200).json({ status: 'success', orders });
  } catch (error) {
    return res
      .status(200)
      .json({ status: 'fail', message: `查詢失敗:${error}` });
  }
});

// 寫入使用的優惠券時間
router.put('/couponUsed/:id', authenticate, async function (req, res) {
  const couponId = +req.params.id;
  const userId = +req.user.id;

  try {
    // 1. 查找領取記錄
    const couponEntry = await prisma.userCoupon.findFirst({
      where: { userId, couponId },
    });

    if (!couponEntry) {
      return res
        .status(404)
        .json({ error: `找不到 ID 為 ${couponId} 的領取記錄。` });
    }

    // 2. 更新 usedAt 欄位為當前時間
    const updatedCouponEntry = await prisma.userCoupon.update({
      where: {
        uniq_user_coupon: {
          userId,
          couponId,
        },
      },

      data: {
        usedAt: new Date(), // 設定為當前伺服器時間
      },
    });

    res.status(200).json({
      message: `ID 為 ${couponId} 的參與記錄已成功更新付款時間。`,
      data: updatedCouponEntry,
    });
  } catch (error) {
    console.error(
      `更新 groupMemberId ${couponId} 的 paid_at 狀態時發生錯誤:`,
      error
    );
  }
});

// 單筆訂單紀錄(結帳後、會員查詢單筆訂單紀錄)
router.get('/order/:id', authenticate, async function (req, res) {
  try {
    const userId = +req.user.id;
    const orderId = +req.params.id;
    // console.log(typeof req.params.id);

    const data = await prisma.order.findUnique({
      select: {
        id: true,
        couponId: true,
        amount: true,
        payment: true,
        address: true,
        phone: true,
        name: true,
        shipping: true,
        createdAt: true,

        orderProduct: {
          select: {
            id: true,
            quantity: true,
            productSku: {
              select: {
                id: true,
                price: true,
                product_size: {
                  select: {
                    name: true,
                  },
                },
                product: {
                  select: {
                    name: true,
                    product_image: {
                      select: {
                        url: true,
                      },
                      where: {
                        sort_order: 0,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderCourse: {
          select: {
            courseVariant: {
              select: {
                id: true,
                price: true,
                duration: true,
                start_at: true,
                course: {
                  select: {
                    name: true,
                    CourseImg: {
                      select: {
                        img: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderGroup: {
          include: {
            groupMember: {
              select: {
                group: {
                  select: {
                    id: true,
                    title: true,
                    startDate: true,
                    endDate: true,
                    price: true,
                    location: { select: { name: true } },
                    customLocation: true,
                    images: {
                      select: { imageUrl: true },
                      orderBy: { sortOrder: 'asc' },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },

      where: {
        // userId: userId,
        id: orderId,
      },
    });

    let couponData = {};
    if (data?.couponId) {
      couponData = await prisma.coupon.findUnique({
        select: {
          id: true,
          name: true,
          endAt: true,
          minPurchase: true,
          couponType: {
            select: {
              type: true,
              amount: true,
            },
          },
          couponTarget: {
            select: {
              target: true,
            },
          },
        },

        where: {
          id: data?.couponId,
        },
      });
    }
    const orderCoupon = couponData?.id
      ? {
          id: couponData.id,
          name: couponData.name,
          endAt: couponData.endAt,
          minPurchase: couponData.minPurchase,
          type: couponData.couponType.type,
          amount: couponData.couponType.amount,
          target: couponData.couponTarget.target,
        }
      : {};
    // console.log('優惠券購買後:');
    // console.log(orderCoupon);

    // 商品、課程、揪團攤平
    const orderProduct = data.orderProduct.map((item) => ({
      id: item.productSku.id,
      quantity: item.quantity,
      price: item.productSku.price,
      name: item.productSku.product.name,
      imageUrl: item.productSku.product.product_image[0].url,
      size: item.productSku.product_size?.name,
    }));

    const orderCourse = data.orderCourse.map((item) => {
      const start_at = item.courseVariant.start_at;
      const duration = item.courseVariant.duration;
      const date = new Date(start_at);
      date.setHours(date.getHours() + duration);
      const end_at = date.toISOString();
      return {
        id: item.courseVariant.id,
        price: item.courseVariant.price,
        name: item.courseVariant.course.name,
        imageUrl: item.courseVariant.course.CourseImg[0].img,
        startAt: start_at,
        endAt: end_at,
        duration: duration,
      };
    });

    const orderGroup = data.orderGroup.map((item) => ({
      id: item.groupMemberId,
      name: item.groupMember.group.title,
      startAt: item.groupMember.group.startDate,
      endAt: item.groupMember.group.endDate,
      price: item.groupMember.group.price,
      // FIXME若無照片則回傳預設
      imageUrl: item.groupMember.group.images[0].imageUrl
        ? item.groupMember.group.images[0].imageUrl
        : '',
    }));

    const order = {
      ...data,
      orderProduct,
      orderCourse,
      orderGroup,
      orderCoupon,
    };

    return res.status(200).json({ status: 'success', order });
  } catch (error) {
    return res
      .status(200)
      .json({ status: 'fail', message: `查詢失敗:${error}` });
  }
});
export default router;
