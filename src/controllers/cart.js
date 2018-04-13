import { ObjectID } from 'mongodb'

import Cart from '../models/Cart'
import Product from '../models/Product'



export const add = async (req, res) => {
  const {
    body: { productId, productQty },
    appName,
  } = req
  const product = await Product.findOne({ _id: productId, appName })
  const { price, name } = product.values
  const cart = await new Cart({
    appName,
    items: [{
      productId,
      productQty,
      image: product.values.image,
      name,
      price,
      total: productQty * price
    }],
    quantity: productQty,
    total: productQty * price + ((productQty * price) * .075),
    subTotal: productQty * price,
  }).save()
  res.set('cartId', cart._id)
  return res.send(cart)
}






export const getId = async (req, res) => {
  const {
    appName,
    params: { _id },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Get cart by id failed, Invalid id')
  const cart = await Cart.findOne({ _id, appName })
  if (!cart) throw Error('No cart found')
  return res.send(cart)
}






export const update = async (req, res) => {
  const {
    body: { type, productId, productQty },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Cart update failed, Invalid id')
  const cart = await Cart.findOne({ _id, appName })
  if (!cart) throw Error('cart not found')
  const index = cart.items.map(i => i.productId.toHexString()).indexOf(productId)
  if (index !== -1) {
    switch (type) {
      case 'ADD_TO_CART': {
        cart.total = cart.total + ((cart.items[index].price * productQty) + (cart.items[index].price * productQty) * .075)
        cart.subTotal = cart.subTotal + (cart.items[index].price * productQty)
        cart.quantity = cart.quantity + productQty
        cart.items[index] = {
          total: cart.items[index].price * (cart.items[index].productQty + productQty),
          price: cart.items[index].price,
          image: cart.items[index].image,
          name: cart.items[index].name,
          productQty: cart.items[index].productQty + productQty,
          productId: cart.items[index].productId
        }
        const addToCart = await cart.save()
        return res.send(addToCart)
      }
      case 'REDUCE_FROM_CART':
        if (cart.items[index].productQty - productQty > 0) {
          cart.total = cart.total - ((cart.items[index].price * productQty) + (cart.items[index].price * productQty) * .075)
          cart.subTotal = cart.subTotal - (cart.items[index].price * productQty)
          cart.quantity = cart.quantity - productQty
          cart.items[index] = {
            total: cart.items[index].price * (cart.items[index].productQty - productQty),
            price: cart.items[index].price,
            image: cart.items[index].image,
            name: cart.items[index].name,
            productQty: cart.items[index].productQty - productQty,
            productId: cart.items[index].productId
          }
          const reduceFromCart = await cart.save()
          return res.send(reduceFromCart)
        } else {
          cart.total = cart.total - ((cart.items[index].price * productQty) + (cart.items[index].price * productQty) * .075)
          cart.subTotal = cart.subTotal - (cart.items[index].price * productQty)
          cart.quantity = cart.quantity - productQty
          cart.items = cart.items.filter(item =>
            item.productId.toHexString() !== productId
          )
          const reduceToRemoveFromCart = await cart.save()
          return res.send(reduceToRemoveFromCart)
        }
      case 'REMOVE_FROM_CART': {
        cart.total = cart.total - ((cart.items[index].price * cart.items[index].productQty) + ((cart.items[index].price * cart.items[index].productQty) * .075))
        cart.subTotal = cart.subTotal - (cart.items[index].price * cart.items[index].productQty)
        cart.quantity = cart.quantity - cart.items[index].productQty
        cart.items = cart.items.filter(item =>
          item.productId.toHexString() !== productId
        )
        const removeFromCart = await cart.save()
        return res.send(removeFromCart)
      }
      default:
        return cart
    }
  } else {
    const product = await Product.findOne({ _id: productId, appName })
    cart.total = cart.total + ((product.values.price * productQty) + (product.values.price * productQty) * .075)
    cart.subTotal = cart.subTotal + (product.values.price * productQty)
    cart.quantity = cart.quantity + productQty
    const item = {
      productId,
      productQty,
      image: product.values.image,
      name: product.values.name,
      price: product.values.price,
      total: product.values.price * productQty
    }
    cart.items.push(item)
    const addNewToCart = await cart.save()
    return res.send(addNewToCart)
  }
}






export const remove = async (req, res) => {
  const {
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Cart remove failed, Invalid id')
  const cart = await Cart.findOneAndRemove({ _id, appName })
  return res.send(cart._id)
}
