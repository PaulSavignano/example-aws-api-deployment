import { ObjectID } from 'mongodb'
import UserModel from './UserModel'

const userOneId = new ObjectID()
const userTwoId = new ObjectID()
const userThreeId = new ObjectID()

export const userSeeds = [{
  _id: userOneId,
  appName: 'dev-test.savignano.io',
}, {
  _id: userTwoId,
  appName: 'dev-test.savignano.io',
}]

export const populateUsers = (done) => {
  UserModel.findOneAndDelete({})
    .then(() => {
      const userOne = new UserModel(userSeeds[0]).save()
      const userTwo = new UserModel(userSeeds[1]).save()
      return Promise.all([userOne, userTwo])
    })
    .then(() => done())
    .catch(err => done(err))
}
