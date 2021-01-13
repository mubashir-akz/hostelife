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
            resolve(addToDb.ops)
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
            const number = await db.get().collection(collections.HOSTELGUESTS).findOne({ mobile: daat.mobile })
            console.log(number);
            if (number) {
                resolve({ status: false })
            } else {
                await db.get().collection(collections.HOSTELGUESTS).insertOne(daat).then((data) => {
                    resolve({ data: data.ops[0]._id, status: true })
                })
            }
        })
    },
    dataFromDb: (id) => {
        return new Promise(async (resolve, reject) => {
            const data = await db.get().collection(collections.HOSTELGUESTS).find({ hostel: id }).toArray()
            resolve(data)
        })
    },
    addRoomsToDb: (data) => {
        return new Promise(async (resolve, reject) => {
            const ifRoomExist = await db.get().collection(collections.ROOMS).find({ ownerId: data.ownerId, roomNo: data.roomNo }).toArray()
            if (ifRoomExist.length > 0) {
                resolve({ status: false })
            }
            else {
                db.get().collection(collections.ROOMS).insertOne(data).then(() => {
                    resolve({status:true})
                })
            }
        })
    },
    getRoomDetails: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ROOMS).find({ ownerId: data }).toArray().then((datas) => {
                // console.log(datas);
                resolve(datas)
            })
        })
    }


}