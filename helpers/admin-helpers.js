const db = require("../config/connection");
const collections = require("../config/collections");
const { ObjectId } = require("mongodb");
const object = require("mongodb").ObjectID;
const bcrypt = require('bcrypt')
module.exports = {
    adminValidation: (data) => {
        return new Promise(async (resolve, reject) => {
            const val = await db.get().collection(collections.ADMIN).find({ username: data.username }).toArray()
            if (val.length > 0) {
                if (val[0].password == data.password) {
                    resolve({ status: true })
                }
                else {
                    resolve({ status: false, message: 'password incorrect' })
                }
            } else {
                resolve({ status: false, message: 'email doesnt exist' })
            }
        })
    },
    addHostel: async (data) => {
        return new Promise(async (resolve, reject) => {
            const check = await db.get().collection(collections.HOSTELS).find({ email: data.email }).toArray()
            if (check.length > 0) {
                resolve({ status: false })
            } else {
                await db.get().collection(collections.HOSTELS).insertOne(data).then(
                    resolve({ status: true })
                )
            }
        })
    },
    getHostels: () => {
        return new Promise(async (resolve, reject) => {
            const hostels = await db.get().collection(collections.HOSTELS).find().toArray().then((data) => {
                resolve(data)
            }
            )
        })
    }
}
