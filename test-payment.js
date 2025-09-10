// Use axios which is already installed
const axios = require('axios');

async function testPayment() {
  // Test data
  const paymentData = {
    orderItems: [
      {
        productId: 1,
        name: "다이슨 V15 디텍트 무선청소기",
        price: 390000,
        quantity: 1,
        image: "/images/dyson-v15.jpg"
      }
    ],
    totalAmount: 390000,
    shippingInfo: {
      name: "Test User",
      phone: "010-1234-5678",
      email: "test@example.com",
      postcode: "12345",
      address: "서울시 강남구",
      addressDetail: "101호"
    },
    paymentMethod: "cash",
    cashReceipt: {
      type: "personal",
      number: "010-1234-5678"
    }
  };

  try {
    const response = await axios.post('http://localhost:3005/api/payment/create', paymentData, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsIm5hbWUiOiJUZXN0IFVzZXIiLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3MzYzODM2NTMsImV4cCI6MTczNjk4ODQ1M30.Yq6zvSQHcMgJPGNX2KXG4K0vLEzojT3eKfgO7aUZKqg'
      }
    });

    const result = response.data;
    
    console.log('✅ Payment successful!');
    console.log('Order ID:', result.orderId);
    console.log('Order Number:', result.orderNumber);
    console.log('Redirect URL:', result.redirectUrl);
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

testPayment();