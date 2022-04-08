var mongoose = require('mongoose');

let sellerSchema = new mongoose.Schema({
    is_profile_compleated: {
        type: Boolean,
        default: 0
    },
    access_token: {
        type: String,
        default: ""
    },
    mobile_number: {
        type: String,
        default: ""
    },
    is_verified: {
        type: Boolean,
        default: 0
    },
    verification_code: {
        type: String,
        default: ""
    },
    profile_image: {
        type: String,
        default: ""
    },
    first_name: {
        type: String,
        default: ""
    },
    last_name: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        default: ""
    },
    date_of_birth:{
        type:String,
        default:""
    },
    country_code:{
        type:String,
        default:""
    },
    gender:{
        type:String,
        enum:["male","female","other"]
    },
    city:{
        type:String,
        default:""
    },
    national_id:{
        type:String,
        default:""
    },
    emergency_contact:{
        type:String,
        default:""
    },
    device_type: {
        type: Number,
        default: 0 // 1. android 2. ios 3. web
    },
    device_token: {
        type: String,
        default: ""
    }
})

var User = new mongoose.model('User',sellerSchema)
module.exports = User;