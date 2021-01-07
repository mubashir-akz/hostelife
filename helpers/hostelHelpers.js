const db = require("../config/connection");
const collections = require("../config/collections");
const { ObjectId } = require("mongodb");
const object = require("mongodb").ObjectID;
const bcrypt = require('bcrypt')

module.exports = {
    loginValidation: (data) => {
        return new Promise(async (resolve, reject) => {
            const verify = await db.get().collection(collections.GUEST_USERS).find({ email: data.email }).toArray()
            if (verify[0]) {
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
    }
}