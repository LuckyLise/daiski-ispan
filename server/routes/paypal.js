import express from 'express';
import dotenv from 'dotenv';
import base64 from 'base-64';

dotenv.config();
const router = express.Router();

// 獲得token
const getAccessToken = async () => {
  try {
    const url = `${process.env.PAYPAL_BASEURL}/v1/oauth2/token`;
    const auth = base64.encode(
      `${process.env.PAYPAL_CLIENTID}:${process.env.PAYPAL_SECRET}`
    );

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await res.json();
    return data.access_token;
  } catch (err) {
    console.error('取得 access token 錯誤:', err);
  }
};

// 創建 PayPal 訂單
router.post('/', async function (req, res) {
  // 取得 PayPal access token
  const amount = req.body.amount;
  try {
    const accessToken = await getAccessToken();
    const url = `${process.env.PAYPAL_BASEURL}/v2/checkout/orders`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            items: [
              {
                name: '商品一批',
                description: '商品一批',
                quantity: '1',
                unit_amount: {
                  currency_code: 'USD',
                  value: amount,
                },
              },
            ],
            amount: {
              currency_code: 'USD',
              value: amount,
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: amount,
                },
              },
            },
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
              payment_method_selected: 'PAYPAL',
              brand_name: 'DAISKI',
              shipping_preference: 'NO_SHIPPING',
              locale: 'zh-TW',
              user_action: 'PAY_NOW',
              return_url: process.env.PAYPAL_REDIRECT_BASE_URL,
              cancel_url: process.env.PAYPAL_REDIRECT_BASE_URL,
            },
          },
        },
      }),
    });

    const data = await response.json();

    // console.log('PayPal 訂單回應:', data);
    const orderId = data.id;
    console.log('送出訂單' + data);
    return res.status(200).json({ orderId });
  } catch (error) {
    console.error('創建訂單錯誤:', error);
    res.status(500).json({ error: '網路伺服器錯誤' });
  }
});

// 捕獲支付方式
router.get('/:paymentId', async function (req, res) {
  try {
    const accessToken = await getAccessToken();
    const { paymentId } = req.params;
    const url = `${process.env.PAYPAL_BASEURL}/v2/checkout/orders/${paymentId}/capture`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: 'json',
    });
    const paymentData = await response.json();

    if (paymentData.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Paypal payment 失敗' });
    }

    const email = paymentData.payer.email_address;
    // 要回傳的資料
    res.status(200).json({
      status: 'success',
      user: {
        email,
      },
    });
  } catch (error) {
    console.log('網路伺服器錯誤');
    res.status(500).json({ error: '網路伺服器錯誤' });
  }
});

export default router;
