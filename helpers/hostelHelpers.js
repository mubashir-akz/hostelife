const db = require("../config/connection");
const collections = require("../config/collections");
const { ObjectId } = require("mongodb");
const object = require("mongodb").ObjectID;
const bcrypt = require('bcrypt')
const moment = require('moment')
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
            const data = await db.get().collection(collections.HOSTELGUESTS).find({ hostel: id, status: 'active' }).toArray()
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
                    resolve({ status: true })
                })
            }
        })
    },
    getRoomDetails: (dat) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.ROOMS).find({ ownerId: dat }).toArray().then(async (datas) => {
                var datass = []
                await datas.forEach(async (item) => {
                    var data = await db.get().collection(collections.HOSTELGUESTS).find({ RoomNo: item.roomNo }).toArray()
                    var lengthOfData = data.length
                    item.roomFree = item.roomCapacity - lengthOfData
                    datass.push(item)
                })
                console.log(datass);
                resolve(datass)
            })
        })
    },
    getHostelRoomNo: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ROOMS).find({ ownerId: id, }, { projection: { roomNo: 1, _id: 0, roomCapacity: 1 } }).toArray().then((data) => {
                var datas = []
                data.forEach(async (item, index) => {
                    await db.get().collection(collections.HOSTELGUESTS).find({ RoomNo: item.roomNo }).toArray().then((data) => {
                        if (data.length < item.roomCapacity) {
                            datas.push({ roomNo: item.roomNo })
                        }
                    })
                })
                resolve(datas)
            })
        }).catch((err) => {
            console.log(err);
        })
    },
    markGuestAsVacated: (id) => {
        new Promise(async (resolve, reject) => {
            var time = moment().format('YYYY/MM/DD')
            await db.get().collection(collections.HOSTELGUESTS).update({ _id: ObjectId(id) }, { $set: { status: 'Vacated',vacatedDate:time, RoomNo: '--', } })
            resolve()
        })
    },
    vacatedDataFromDb: (id) => {
        return new Promise(async(resolve, reject) => {
            const data = await db.get().collection(collections.HOSTELGUESTS).find({ hostel: id, status: 'Vacated'}).toArray()
            resolve(data)
        })
    },
    deleteRoom:(id)=>{
        new Promise(async(resolve,reject)=>{
            await db.get().collection(collections.ROOMS).remove({_id:ObjectId(id)})
            resolve()
        })
    }
}