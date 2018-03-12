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
    params: { brandName },
    user
  } = req
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
    const updatedUser = await User.findOneAndUpdate(
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
      user: updatedUser,
      newUserAddress: true,
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
  user,
  newUserAddress,
}) => {
  try {
    const config = await Config.findOne({ brandName })
    const { values: { stripeSkLive, stripeSkTest }} = config
    if (!stripeSkLive && !stripeSkTest) throw Error('Unable to create charge, no stripe api key found')
    const stripe = require("stripe")(stripeSkLive || stripeSkTest)
    const charge = await stripe.charges.create({
      amount: Math.round(cart.total),
      currency: "usd",
      source: stripeToken,
      description: `${brandName} Order`
    })
    const order = await new Order({
      address: address._id,
      cart,
      email: user.values.email,
      firstName: user.values.firstName,
      brandName,
      lastName: user.values.lastName,
      paymentId: charge.id,
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
      brandName,
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
        <p>Once shipped, you can mark the item as shipped in at <a href="${brandName}/admin/orders">${brandName}/admin/orders</a> to send confirmation to ${user.values.firstName}.</p>
      `
    })
  } catch (err) {
    if (err.type === 'StripeCardError') {
      throw new CustomError({ field: 'card', message: err.message, statusCode: err.statusCode})
    }
    return Promise.reject(err)
  }
}








export const getUser = async (req, res) => {
  const {
    params: { brandName },
    query: { lastId, limit },
    user
  } = req
  const params = lastId ? { _id: { $gt: lastId }, brandName, user: user._id } : { brandName, user: user._id }
  const orders = await Order.find(params)
  .limit(parseInt(limit))
  return res.send(orders)
}

export const getId = async (req, res) => {
  const {
    params: { brandName, _id },
    user
  } = req
  const order = await Order.findOne({ user: user._id, brandName, _id })
  return res.send(order)
}


export const adminGetUser = async (req, res) => {
  const {
    params: { brandName },
    query: { userId, limit, lastId },
    user
  } = req
  const params = lastId ? { _id: { $gt: lastId }, brandName, user: userId } : { brandName, user: userId }
  const orders = await Order.find(params)
  .limit(parseInt(limit))
  return res.send(orders)
}


export const adminGetId = async (req, res) => {
  const {
    params: { brandName, _id },
    user
  } = req
  const order = await Order.findOne({ brandName, _id })
  return res.send(order)
}


export const adminGetAll = async (req, res) => {
  const {
    params: { brandName, page },
    query: { limit, lastId },
    user
  } = req
  const params = lastId ? { _id: { $gt: lastId }, brandName } : { brandName }
  const orders = await Order.find(params)
  .limit(parseInt(limit))
  return res.send(orders)
}















export const getSalesByYear = async (req, res) => {
  const {
    params: { brandName },
    user
  } = req
  const sales = await Order.aggregate([
    { $match: {
      brandName,
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
    params: { brandName },
    user
  } = req
  const sales = await Order.aggregate([
    { $match: {
      brandName,
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
    params: { brandName },
    user
  } = req
  const current = new Date()
  const last = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
  const sales = await Order.aggregate([
    { $match: {
      brandName,
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
