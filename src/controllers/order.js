import { ObjectID } from 'mongodb'

import Address from '../models/Address'
import Config from '../models/Config'
import Cart from '../models/Cart'
import CustomError from '../utils/CustomError'
import Order from '../models/Order'
import sendGmail from '../utils/sendGmail'
import User from '../models/User'
import getQuery from '../utils/getQuery'
import getCursorSort from '../utils/getCursorSort'

const formatPrice = (cents) => `$${(cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

export const add = async (req, res) => {
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
  } = req
  const hasNewAddress = fullAddress === 'newAddress' ? true : false
  const address = hasNewAddress ?
    await new Address({
      appName,
      user: ObjectID(req.user._id),
      values: {
        name,
        phone,
        street,
        city,
        zip,
        state
      }
    }).save()
    :
    await Address.findOne({ _id: fullAddress, appName })

  const user = hasNewAddress ?
    await User.findOneAndUpdate(
      { _id: req.user._id, appName },
      { $push: { addresses: address._id }},
      { new: true }
    )
    .populate({ path: 'addresses',  select: '-user' })
    :
    req.user

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
  .catch(err => {
    if (err.type === 'StripeCardError') {
      throw new CustomError({ field: 'card', message: err.message, statusCode: err.statusCode})
    }
    return Promise.reject(err)
  })

  const orderPromise = new Order({
    address: {
      _id: address._id,
      ...address.values,
    },
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

  const cartPromise = Cart.findOneAndRemove({ _id: cart._id })

  const [ order, cartDoc ] = await Promise.all([ orderPromise, cartPromise ])
  const response = hasNewAddress ? { cart: cartDoc, order, user, address } : { cart, order }
  res.send(response)

  const htmlOrder = `
    <h3>Order Summary</h3>
    <div>Order: ${order._id}</div>
    <div>Total: ${formatPrice(order.cart.total)}</div>
    <div>Quantity: ${order.cart.quantity}</div>
    <div>Items:</div>
    <ol>
      ${order.cart.items.map(item => (`
        <li style="display: flex; flex-flow: row wrap; align-items: center; font-family: inherit;">
          ${item.productQty} of <img src="${process.env.IMAGE_ENDPOINT}/${item.image.src}" alt="order item" height="32px" width="auto" style="margin-left:8px;margin-right:8px"/> ${item.name} ${item.productId}
        </li>
        `)
      )}
    </ol>
    <br/>
    <h3>Delivery Summary</h3>
    <div>${address.values.name}</div>
    <div>${address.values.phone}</div>
    <div>${address.values.street}</div>
    <div class="gutterBottom">
      ${address.values.city}, ${address.values.state} ${address.values.zip}
    </div>
  `
  console.log()

  await sendGmail({
    appName,
    toEmail: user.values.email,
    toSubject: 'Thank you for your order!',
    toBody: `
      <p>Hi ${user.values.firstName},</p>
      <p>Thank you for your recent order ${order._id}.  We are preparing your order for delivery and will send you a confirmation once it has shipped.  Please don't hesitate to reach out regarding anything we can with in the interim.</p>
      <br/>
      ${htmlOrder}
    `,
    adminSubject: `New order received!`,
    adminBody: `
      <p>${user.values.firstName} ${user.values.lastName} just placed order an order!</p>
      <br/>
      ${htmlOrder}
      <p>Once shipped, you can mark the item as shipped in at <a href="${appName}/admin/orders">${appName}/admin/orders</a> to send confirmation to ${user.values.firstName}.</p>
    `
  })

}








export const get = async (req, res) => {
  const {
    appName,
    query: {
      _id,
      lastId,
      lastShipped,
      lastPlaced,
      lastTotal,
      limit,
      shipped,
      sort,
    },
    user
  } = req
  const query = getQuery({
    appName,
    _id,
    lastId,
    lastShipped,
    lastPlaced,
    lastTotal,
    limit,
    shipped,
    sort,
    userId: user._id,
  })
  const cursorSort = getCursorSort({ sort })
  const limitInt = limit ? parseInt(limit) : 9
  const orders = await Order
  .find(query)
  .sort(cursorSort)
  .limit(limitInt)
  return res.send(orders)
}






export const adminGet = async (req, res) => {
  const {
    appName,
    query: {
      _id,
      lastId,
      lastShipped,
      lastPlaced,
      lastTotal,
      limit,
      shipped,
      sort,
      userId,
    },
  } = req
  const query = getQuery({
    appName,
    _id,
    lastId,
    lastShipped,
    lastPlaced,
    lastTotal,
    limit,
    shipped,
    sort,
    userId,
  })
  const cursorSort = getCursorSort({ sort })
  const limitInt = limit ? parseInt(limit) : 9
  const orders = await Order
  .find(query)
  .sort(cursorSort)
  .limit(limitInt)
  return res.send(orders)
}






export const getSalesByYear = async (req, res) => {
  const {
    appName,
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
    appName
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
  if (!ObjectID.isValid(_id)) throw Error('Order update failed, invalid _id')
  if (type === 'SHIPPED') {
    const order = await Order.findOneAndUpdate(
      { _id, appName },
      { $set: { shipped: true, shipDate: new Date() }},
      { new: true }
    )
    const { email, firstName, address } = order
    const { name, phone, street, city, state, zip } = address
    res.send(order)
    await sendGmail({
      appName,
      toEmail: email,
      toSubject: 'Your order has shipped!',
      toBody: `
        <p>Hi ${firstName},</p>
        <p>Order ${order._id} is on it's way!</p>
      `,
      adminSubject: `Order shipped!`,
      adminBody: `
        <p>Order ${order._id} has been changed to shipped!</p>
        <h3>Order: ${order._id}</h3>
        <div>Total: ${formatPrice(order.cart.total)}</div>
        <div>Quantity: ${order.cart.quantity}</div>
        <div>Items:</div>
        <ul>
          ${order.cart.items.map(item => `
            <li>
              <img src="${process.env.REACT_APP_IMAGE_ENDPOINT/item.image.src}"/>
              ${item.name} ${item.productId} quantity ${item.productQty} ${formatPrice(item.total)}
            </li>
            `
          )}
        </ul>
        <h3>Address:</h3>
        <div>${name}</div>
        <div>${phone}</div>
        <div>${street}</div>
        <div class="gutterBottom">${city}, ${state} ${zip}</div>
      `
    })
  }
}
