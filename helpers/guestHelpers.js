const db = require("../config/connection");
const collections = require("../config/collections");
const { ObjectId } = require("mongodb");
const object = require("mongodb").ObjectID;
const bcrypt = require('bcrypt')

module.exports = {
    getHostelList: () =>
        new Promise(async (resolve, reject) => {
            const hostels = [{ 'Hostel': 'Perl Harbour', 'RoomType': 'Single', 'perNight': '450', 'perMonth': '5000', 'description': 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco. ' }]
            resolve(hostels);
        }),
    addGoogle: (data) => {
        return new Promise(async (resolve, reject) => {
            const datas = {
                type: 'google',
                name: data.name,
                picture: data.picture,
                // email: data.email,
                gid: data.sub,
                // password: '33333333333333'
            }
            var verify = await db.get().collection(collections.GUEST_USERS).find({ gid: data.sub }).toArray()
            console.log(verify.length)
            if (verify.length == 0) {
                await db.get().collection(collections.GUEST_USERS).insertOne(datas)
                var to = await db.get().collection(collections.GUEST_USERS).find({ gid: data.sub }).toArray()
                resolve(to)
            } else {
                var to = await db.get().collection(collections.GUEST_USERS).find({ gid: data.sub }).toArray()
                resolve(to)
            }
        })
    },
    addFb: (data) => {
        return new Promise(async (resolve, reject) => {
            const datas = {
                name: data.name,
                fbId: data.id
            }
            const verify = await db.get().collection(collections.GUEST_USERS).find({ fbId: data.id }).toArray()
            if (verify.length == 0) {
                await db.get().collection(collections.GUEST_USERS).insertOne(datas)
                var to = await db.get().collection(collections.GUEST_USERS).find({ fbId: data.id }).toArray()
                resolve(to)
            } else {
                var to = await db.get().collection(collections.GUEST_USERS).find({ fbId: data.id }).toArray()
                resolve(to)
            }
        })
    },
    addToDb: (data) => {
        return new Promise(async (resolve, reject) => {
            const datas = {
                name: data.username,
                email: data.email,
                password: data.password,
                mobile: data.mobile
            }
            const verify = await db.get().collection(collections.GUEST_USERS).find({ email: datas.email }).toArray()
            if (verify == 0) {
                const d = await db.get().collection(collections.GUEST_USERS).insertOne(datas)
                resolve(d.ops)
            } else {
                resolve(false)
            }
        })

    },
    verifyLogin: async (data) => {
        return new Promise(async (resolve, reject) => {
            const verify = await db.get().collection(collections.GUEST_USERS).find({ email: data.email }).toArray()
            console.log(verify);
            if (verify[0]) {
                bcrypt.compare(data.password, verify[0].password).then((status) => {
                    if (status) {
                        resolve(verify);
                    } else {
                        resolve({ status: false });
                    }
                });
            } else {
                console.log('not');
                resolve({ status: false })
            }
        })
    }
}