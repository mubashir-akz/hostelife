const db = require("../config/connection");
const collections = require("../config/collections");
const { ObjectId } = require("mongodb");
const object = require("mongodb").ObjectID;
const bcrypt = require('bcrypt')

module.exports = {
    loginValidation: (data) => {
        return new Promise(async (resolve, reject) => {
            const verify = await db.get().collection(collections.HOSTELS).find({ email: data.email }).toArray()
            console.log(verify);
            if (verify.length > 0) {
                bcrypt.compare(data.password, verify[0].password).then((status) => {
                    if (status) {
                        resolve(verify[0]);
                    } else {
                        resolve({ status: false });
                    }
                });
            } else {
                resolve({ status: false })
            }
        })
    },
    hostelAddToDb: (data) => {
        return new Promise(async (resolve, reject) => {
            const addToDb = await db.get().collection(collections.HOSTELLIST).insertOne(data)
            resolve()
        })
    },
    getData: (data) => {
        return new Promise(async (resolve, reject) => {
            const datas = await db.get().collection(collections.HOSTELLIST).findOne({ ownerId: data })
            resolve(datas)
        })
    },
    addToUpdatedHostelProfile: (data) => {
        return new Promise(async (resolve, reject) => {
            const updateDb = await db.get().collection(collections.HOSTELLIST).updateOne({ ownerId: data.ownerId }, { $set: data }).then(() => {
                resolve()
            })
        })
    },
    addGuestToDB: (daat) => {
        return new Promise(async (resolve, reject) => {
            const dbSave = await db.get().collection(collections.HOSTELGUESTS).insertOne(daat).then((data) => {
                resolve(data.ops[0]._id)
            })
        })
    },
    dataFromDb: (id) => {
        return new Promise(async (resolve, reject) => {
            const data = await db.get().collection(collections.HOSTELGUESTS).find({ hostel: id }).toArray()
            resolve(data)
        })
    }


}