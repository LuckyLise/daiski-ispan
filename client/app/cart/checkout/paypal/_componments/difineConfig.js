import React, { useState, useEffect } from 'react';

export default function Page(props) {
  const url = 'http://localhost:3005/paypal';
  async function fetchData(nextCart) {
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart: nextCart.cart,
        }),
      });
    } catch (err) {
      console.log(err);
    }
  }
}
