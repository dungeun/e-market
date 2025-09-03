import axios from 'axios'

interface TossPaymentData {
  amount: number
  orderId: string
  orderName: string
  customerEmail?: string
  customerName?: string
  successUrl: string
  failUrl: string
}

interface TossPaymentResponse {
  paymentKey: string
  orderId: string
  amount: number
  status: string
}

const TOSS_PAYMENTS_BASE_URL = 'https://api.tosspayments.com/v1'

export class TossPayments {
  private clientKey: string
  private secretKey: string

  constructor() {
    this.clientKey = process.env.TOSS_CLIENT_KEY || ''
    this.secretKey = process.env.TOSS_SECRET_KEY || ''

    if (!this.clientKey || !this.secretKey) {
      throw new Error('Toss Payments keys are not configured')
    }
  }

  private getAuthHeader() {
    const credentials = Buffer.from(`${this.secretKey}:`).toString('base64')
    return `Basic ${credentials}`
  }

  async createPayment(data: TossPaymentData) {
    try {
      const response = await axios.post(
        `${TOSS_PAYMENTS_BASE_URL}/payments`,
        {
          amount: data.amount,
          orderId: data.orderId,
          orderName: data.orderName,
          customerEmail: data.customerEmail,
          customerName: data.customerName,
          successUrl: data.successUrl,
          failUrl: data.failUrl,
        },
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        }
      )

      return response.data
    } catch (error) {

      throw new Error('Failed to create Toss payment')
    }
  }

  async confirmPayment(paymentKey: string, orderId: string, amount: number) {
    try {
      const response = await axios.post(
        `${TOSS_PAYMENTS_BASE_URL}/payments/confirm`,
        {
          paymentKey,
          orderId,
          amount,
        },
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        }
      )

      return response.data as TossPaymentResponse
    } catch (error) {

      throw new Error('Failed to confirm Toss payment')
    }
  }

  async cancelPayment(paymentKey: string, cancelReason: string) {
    try {
      const response = await axios.post(
        `${TOSS_PAYMENTS_BASE_URL}/payments/${paymentKey}/cancel`,
        {
          cancelReason,
        },
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        }
      )

      return response.data
    } catch (error) {

      throw new Error('Failed to cancel Toss payment')
    }
  }

  async getPayment(paymentKey: string) {
    try {
      const response = await axios.get(
        `${TOSS_PAYMENTS_BASE_URL}/payments/${paymentKey}`,
        {
          headers: {
            Authorization: this.getAuthHeader(),
          },
        }
      )

      return response.data
    } catch (error) {

      throw new Error('Failed to get Toss payment')
    }
  }
}

export const tossPayments = new TossPayments()