import { ObjectID } from 'mongodb'

import Address from '../models/Address'
import Config from '../models/Config'
import Cart from '../models/Cart'
import CustomError from '../utils/CustomError'
import Order from '../models/Order'
import sendGmail from '../utils/sendGmail'
import User from '../models/User'

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
    appName,
    user
  } = req
  if (fullAddress === 'newAddress') {
    const address = await new Address({
      appName,
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
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id, appName },
      { $push: { addresses: address._id }},
      { new: true }
    ).populate({ path: 'addresses',  select: '-user' })

    await createCharge({
      address,
      cart,
      stripeToken,
      appName,
      res,
      user: updatedUser,
      newUserAddress: true,
    })
  } else {
    const address = await Address.findOne({ _id: fullAddress, appName })
    if (!address) throw Error('That address does not exist')
    await createCharge({
      address,
      cart,
      stripeToken,
      appName,
      res,
      user,
    })
  }
}

const createCharge = async ({
  address,
  cart,
  appName,
  res,
  stripeToken,
  user,
  newUserAddress,
}) => {
  try {
    const config = await Config.findOne({ appName })
    const { values: { stripeSkLive, stripeSkTest }} = config
    if (!stripeSkLive && !stripeSkTest) throw Error('Unable to create charge, no stripe api key found')
    const stripe = require("stripe")(stripeSkLive || stripeSkTest)
    const charge = await stripe.charges.create({
      amount: Math.round(cart.total),
      currency: "usd",
      source: stripeToken,
      description: `${appName} Order`
    })
    const order = await new Order({
      address,
      appName,
      cart,
      email: user.values.email,
      firstName: user.values.firstName,
      lastName: user.values.lastName,
      paymentId: charge.id,
      shipped: false,
      total: cart.total,
      user: user._id,
    }).save()
    await Cart.findOneAndRemove({ _id: cart._id })
    const response = newUserAddress ? { order, user } : { order }
    res.send(response)
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
      appName,
      to: user.values.email,
      toSubject: 'Thank you for your order!',
      toBody: `
        <p>Hi ${user.values.firstName},</p>
        <p>Thank you for your recent order ${order._id}.  We are preparing your order for delivery and will send you a confirmation once it has shipped.  Please don't hesitate to reach out regarding anything we can with in the interim.</p>
        ${htmlOrder}
      `,
      fromSubject: `New order received!`,
      fromBody: `
        <p>${user.values.firstName} ${user.values.lastName} just placed order an order!</p>
        ${htmlOrder}
        <p>Once shipped, you can mark the item as shipped in at <a href="${appName}/admin/orders">${appName}/admin/orders</a> to send confirmation to ${user.values.firstName}.</p>
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
    appName,
    query: { lastId, limit, orderId },
    user
  } = req
  const lastIdQuery = lastId && { _id: { $gt: lastId }}
  const idQuery = orderId && { _id: orderId }
  const query = {
    appName,
    user: user._id,
    ...lastIdQuery,
    ...idQuery,
  }
  if (orderId) {
    const order = await Order.findOne(query)
    return res.send(order)
  }
  const orders = await Order.find(query)
  .limit(parseInt(limit))
  return res.send(orders)
}



export const adminGet = async (req, res) => {
  const {
    appName,
    query: { lastId, limit, orderId, userId },
  } = req
  const lastIdQuery = lastId && { _id: { $gt: lastId }}
  const idQuery = orderId && { _id: orderId }
  const userQuery = userId && { user: userId }
  const query = {
    appName,
    ...lastIdQuery,
    ...idQuery,
    ...userQuery,
  }
  if (orderId) {
    const order = await Order.findOne(query)
    return res.send(order)
  }
  const orders = await Order.find(query)
  .limit(parseInt(limit))
  return res.send(orders)
}















export const getSalesByYear = async (req, res) => {
  const {
    appName,
    user
  } = req
  const sales = await Order.aggregate([
    { $match: {
      appName,
    }},
    { $project: {
      cYear: { $dateToString: { format: "%Y", date: new Date() }},
      pYear: { $dateToString: { format: "%Y", date: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }},
      dYear: { $dateToString: { format: "%Y", date: "$createdAt" }},
      month: { $month: "$createdAt" },
      total: "$total",
    }},
    { $group: {
      _id: {
        year: { $year: new Date() },
      },
      c: {
        $sum: {
          $cond: [{
            $eq: [ "$dYear", "$cYear" ]
          }, {
            $sum: "$total"
          }, 0]
        }
      },
      p: {
        $sum: {
          $cond: [{
            $eq: [ "$dYear", "$pYear" ]
          }, {
            $sum: "$total"
          }, 0]
        }
      }}
    },
    { $project: {
      _id: 0,
      year: "$_id.year",
      [new Date().getFullYear()]: "$c",
      [new Date().getFullYear() - 1]: "$p"
    }}
  ])
  return res.send(sales)
}



export const getSalesByMonth = async (req, res) => {
  const {
    appName,
    user
  } = req
  const sales = await Order.aggregate([
    { $match: {
      appName,
      createdAt: { "$gte": new Date(new Date().getFullYear() - 1, 0, 1) }
    }},
    { $project: {
      cYear: { $dateToString: { format: "%Y", date: new Date() }},
      pYear: { $dateToString: { format: "%Y", date: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }},
      dYear: { $dateToString: { format: "%Y", date: "$createdAt" }},
      month: { $month: "$createdAt" },
      total: "$total",
    }},
    { $group: {
      _id: {
        year: { $year: new Date() },
        month: "$month",
      },
      c: {
        $sum: {
          $cond: [{
            $eq: [ "$dYear", "$cYear" ]
          }, {
            $sum: "$total"
          }, 0]
        }
      },
      p: {
        $sum: {
          $cond: [{
            $eq: [ "$dYear", "$pYear" ]
          }, {
            $sum: "$total"
          }, 0]
        }
      }}
    },
    { $project: {
      _id: 0,
      month: "$_id.month",
      [new Date().getFullYear()]: "$c",
      [new Date().getFullYear() - 1]: "$p"
    }}
  ])
  return res.send(sales)
}



export const getSalesByDay = async (req, res) => {
  const {
    appName,
    user
  } = req
  const current = new Date()
  const last = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
  const sales = await Order.aggregate([
    { $match: {
      appName,
      createdAt: { "$gte": new Date(new Date().getFullYear() - 1, 0, 1) }
    }},
    { $project: {
      cYear: { $dateToString: { format: "%Y", date: new Date() }},
      pYear: { $dateToString: { format: "%Y", date: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }},
      dYear: { $dateToString: { format: "%Y", date: "$createdAt" }},
      month: { $month: "$createdAt" },
      day: { $dayOfMonth: "$createdAt" },
      total: "$total",
    }},
    { $group: {
      _id: {
        year: { $year: new Date() },
        month: { $month: new Date() },
        day: "$day"
      },
      c: {
        $sum: {
          $cond: [{
            $eq: [ "$dYear", "$cYear" ]
          }, {
            $sum: "$total"
          }, 0]
        }
      },
      p: {
        $sum: {
          $cond: [{
            $eq: [ "$dYear", "$pYear" ]
          }, {
            $sum: "$total"
          }, 0]
        }
      }}
    },
    { $project: {
      _id: 0,
      month: "$_id.month",
      day: "$_id.day",
      [new Date().getFullYear()]: "$c",
      [new Date().getFullYear() - 1]: "$p"
    }}
  ])
  return res.send(sales)
}














export const getAdmin = async (req, res) => {
  const { appName } = req
  const orders = await Order.find({ appName })
  return res.send(orders)
}



export const update = async (req, res) => {
  const {
    body: { type },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Order update failed, Invalid id')
  if (type === 'SHIPPED') {
    const order = await Order.findOneAndUpdate(
      { _id, appName },
      { $set: { shipped: true, shipDate: new Date() }},
      { new: true }
    )
    const { email, firstName, lastName, cart, address } = order
    const { name, phone, street, city, state, zip } = address
    res.send(order)
    sendGmail({
      appName,
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
