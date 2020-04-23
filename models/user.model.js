const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: String,
    password: String,
    status: {
        type: String,
        enum: ['Pending confirmation', 'Active'],
        default: 'Pending confirmation'
    },
    cofirmationCode: String,
    email: String
},
 {
    timestamps: true
})

const User = mongoose.model("User", userSchema)

module.exports = User