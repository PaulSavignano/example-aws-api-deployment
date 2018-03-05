import { ObjectID } from 'mongodb'

import Address from '../models/Address'
import ApiConfig from '../models/ApiConfig'
import Cart from '../models/Cart'
import User from '../models/User'
import Order from '../models/Order'
import sendGmail from '../utils/sendGmail'
import CustomError from '../utils/CustomError'

const formatPrice = (cents) => `$${(cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`



export const add = async (req, res, next) => {
  const {
    body: {
      stripeToken,
      fullAddress,
      name,
      phone,
      street,
      city,
      state,
      zip,
      cart
    },
    params: { brandName },
    user
  } = req
  console.log('user is ', user)
  if (fullAddress === 'newAddress') {
    const address = await new Address({
      brandName,
      user: ObjectID(user._id),
      values: {
        name,
        phone,
        street,
        city,
        zip,
        state
      }
    }).save()
    const user = await User.findOneAndUpdate(
      { _id: user._id, brandName },
      { $push: { addresses: address._id }},
      { new: true }
    ).populate({ path: 'addresses',  select: '-user' })

    await createCharge({
      address,
      cart,
      stripeToken,
      brandName,
      res,
      user,
    })
  } else {
    const address = await Address.findOne({ _id: fullAddress, brandName })
    if (!address) throw Error('That address does not exist')
    await createCharge({
      address,
      cart,
      stripeToken,
      brandName,
      res,
      user,
    })
  }
}

const createCharge = async ({
  address,
  cart,
  brandName,
  res,
  stripeToken,
  user
}) => {
  try {
    const apiConfig = await ApiConfig.findOne({ brandName })
    const { values: { stripeSkLive, stripeSkTest }} = apiConfig
    if (!stripeSkLive && !stripeSkTest) throw Error('Unable to create charge, no stripe api key found')
    const stripe = require("stripe")(stripeSkLive || stripeSkTest)
    const charge = await stripe.charges.create({
      amount: Math.round(cart.total),
      currency: "usd",
      source: stripeToken,
      description: `${brandName} Order`
    })
    const order = await new Order({
      address: address.values,
      cart,
      email: user.email,
      firstName: user.firstName,
      brandName,
      lastName: user.lastName,
      paymentId: charge.id,
      total: cart.total,
      user: user._id,
    }).save()
    await Cart.findOneAndRemove({ _id: cart._id })
    res.send({ order, user })
    const { name, phone, street, city, state, zip } = address.values
    const htmlOrder = `
      <div style="font-weight: 900">Order Summary</div>
      <div>Order: ${order._id}</div>
      <div>Total: ${formatPrice(order.cart.total)}</div>
      <div>Quantity: ${order.cart.quantity}</div>
      <div>Items:</div>
      <ol>
        ${order.cart.items.map(item => (
          `<li style="display:flex;flex-flow:row wrap;align-items:center;font-family:inherit;">
            ${item.productQty} of <img src="${process.env.REACT_APP_IMAGE_ENDPOINT/item.image.src}" alt="order item" height="32px" width="auto" style="margin-left:8px;margin-right:8px"/> ${item.name} ${item.productId}
          </li>`
        ))}
      </ol>
      <div style="font-weight: 900">Delivery Summary</div>
      <div>${name}</div>
      <div>${phone}</div>
      <div>${street}</div>
      <div>${city}, ${state} ${zip}</div>
    `
    const mailData = await sendGmail({
      brandName: 'savignano-io-client-dev',
      to: user.email,
      toSubject: 'Thank you for your order!',
      toBody: `
        <p>Hi ${user.firstName},</p>
        <p>Thank you for your recent order ${order._id}.  We are preparing your order for delivery and will send you a confirmation once it has shipped.  Please don't hesitate to reach out regarding anything we can with in the interim.</p>
        ${htmlOrder}
      `,
      fromSubject: `New order received!`,
      fromBody: `
        <p>${user.firstName} ${user.lastName} just placed order an order!</p>
        ${htmlOrder}
        <p>Once shipped, you can mark the item as shipped in at <a href="${brandName}/admin/orders">${brandName}/admin/orders</a> to send confirmation to ${user.firstName}.</p>
      `
    })
  } catch (err) {
    if (err.type === 'StripeCardError') {
      throw new CustomError({ field: 'card', message: err.message, statusCode: err.statusCode})
    }
    return Promise.reject(err)
  }
}





export const get = async (req, res) => {
  const {
    params: { brandName },
    user
  } = req
  const orders = await Order.find({ user: user._id, brandName })
  return res.send(orders)
}



export const getSalesByYear = async (req, res) => {
  const {
    params: { brandName },
    user
  } = req
  const current = new Date()
  const last = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
  const salesByYear = await Order.aggregate([
    {
      $match: {
        brandName,
        createdAt: {
          $gte: last,
          $lte: current
        }
      }
    },
    {
      $project: {
        date: { $dateToString: { format: "%Y", date: "$createdAt" }},
        year: { $year: "$createdAt" },
        total: "$total",
      }
    },
    {
      $group: {
        _id: {
          date: "$date",
          year: "$year",
        },
        total: { $sum: "$total" },
      }
    }
  ])
  console.log('year ', salesByYear)
  return res.send(salesByYear)
}



export const getSalesByMonth = async (req, res) => {
  const {
    params: { brandName },
    user
  } = req
  const current = new Date()
  const last = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
  const salesByMonth = await Order.aggregate([
    {
      $match: {
        brandName,
        createdAt: {
          $gte: last,
          $lte: current
        }
      },
    },
    {
      $project: {
        date: { $dateToString: { format: "%Y/%m", date: "$createdAt" }},
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        total: "$total",
      }
    },
    {
      $group: {
        _id: {
          date: "$date",
          year: "$year",
          month: "$month",
        },
        total: { $sum: "$total" }
      }
    }
  ])
  console.log('month ', salesByMonth)
  return res.send(salesByMonth)
}



export const getSalesByWeek = async (req, res) => {
  const {
    params: { brandName },
    user
  } = req
  const current = new Date()
  const last = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
  const salesByWeek = await Order.aggregate([
    {
      $match: {
        brandName,
        createdAt: {
          $gte: last,
          $lte: current
        }
      },
    },
    {
      $project: {
        date: { $dateToString: { format: "%U", date: "$createdAt" }},
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        week: { $week: "$createdAt" },
        total: "$total",
      }
    },
    {
      $group: {
        _id: {
          date: "$date",
          year: "$year",
          month: "$month",
          week: "$week",
        },
        total: { $sum: "$total" },
      }
    }
  ])
  console.log('week ', salesByWeek)
  return res.send(salesByWeek)
}




export const getSalesByDay = async (req, res) => {
  const {
    params: { brandName },
    user
  } = req
  const current = new Date()
  const last = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
  const salesByDay = await Order.aggregate([
    {
      $match: {
        brandName,
        createdAt: {
          $gte: last,
          $lte: current
        }
      },
    },
    {
      $project: {
        date: { $dateToString: { format: "%Y/%m/%d", date: "$createdAt" }},
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
        week: { $week: "$createdAt" },
        total: "$total",
      }
    },
    {
      $group: {
        _id: {
          date: "$date",
          year: "$year",
          month: "$month",
          week: "$week",
          day: "$day"
        },
        total: { $sum: "$total" },
      }
    }
  ])
  console.log('day ', salesByDay)
  return res.send(salesByDay)
}




export const getAdmin = async (req, res) => {
  const { brandName } = req
  const orders = await Order.find({ brandName })
  return res.send(orders)
}



export const update = async (req, res) => {
  const {
    body: { type },
    params: { _id, brandName }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Order update failed, Invalid id')
  if (type === 'SHIPPED') {
    const order = await Order.findOneAndUpdate(
      { _id, brandName },
      { $set: { shipped: true, shipDate: new Date() }},
      { new: true }
    )
    const { email, firstName, lastName, cart, address } = order
    const { name, phone, street, city, state, zip } = address
    res.send(order)
    sendGmail({
      brandName,
      to: email,
      toSubject: 'Your order has shipped!',
      toBody: `
        <p>Hi ${firstName},</p>
        <p>Order ${order._id} is on it's way!</p>
      `,
      fromSubject: `Order shipped!`,
      fromBody: `
        <p>Order ${order._id} has been changed to shipped!</p>
        <div>Order: ${order._id}</div>
        <div>Total: ${formatPrice(order.cart.total)}</div>
        <div>Quantity: ${order.cart.quantity}</div>
        <div>Items:</div>
        <ul>
          ${order.cart.items.map(item => `<li>${item.productQty} of ${item.name} ${item.productId}</li>`)}
        </ul>
        <div>Address:</div>
        <div>${name}</div>
        <div>${phone}</div>
        <div>${street}</div>
        <div>${city}, ${state} ${zip}</div>
      `
    })
  }
}
