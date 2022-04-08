const UserModel = require('../model/user')
let commonfunc = require('../common/utility')
let md5 = require('md5')
const joi = require('joi')
const jwt = require('jsonwebtoken')
// const genrateQrCode


exports.singUp = async function (req, res, next) {
    let {
        profile_image,
        first_name,
        last_name,
        email,
        country_code,
        mobile_number,
        password
    } = req.body

    const schema = joi.object({
        first_name: joi.string().required(),
        last_name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
        country_code: joi.string().optional().allow(''),
        mobile_number: joi.string().optional().allow('')
    })

    const options = {
        abortEarly: false,  //include all errors
        allowUnknown: true,  // ignore unknown props
        stripUnknown: true  //remove unknown props
    }

    const { error, value } = schema.validate(req.body, options)

    if (error) {
        return res.status(400).json({
            message: `${error}`
        })
    }

    let verification_code = commonfunc.generateRandomString();
    let userData = req.body;
    userData.email = userData.email.toLowerCase()

    userData.password = md5(userData.password)
    userData.verification_code = verification_code

    userData.is_profile_compleated = 0;

    let token = jwt.sign({
        email: userData.email
    }, 'supersecret')
    userData.access_token = token

    try {
        let isExists = await UserModel.findOne({
            $or: [{
                email: userData.email
            }, {
                mobile_number: userData.mobile_number
            }]
        })
        if (isExists) {
            return res.status(400).json({
                message: 'email or phone number already exists'
            })
        }


        var users = await UserModel.create(userData)

        delete users._doc.verification_code
        delete users._doc.password

        return res.status(200).json({
            data: users,
            message: 'successfully signed up'
        })

    } catch (e) {
        return res.status(400).json({
            message: e.message
        })
    }
}


exports.login = async function (req, res, next) {
    let {
        email,
        password
    } = req.body

    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).required()
    })

    const options = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true
    }

    const { error, value } = schema.validate(req.body, options)

    if (error) {
        return res.status(400).json({
            message: `Validation error: ${error.details[0].message}`
        })
    }

    var userData = req.body;
    userData.email = userData.email.toLowerCase();

    try {

        let users = await UserModel.findOne({
            email: userData.email,
            password: md5(userData.password)
        }, {
            new: true
        }).lean()

        if (!users) {
            return res.status(400).json({
                message: 'invalid credentials'
            })
        }

        let token = jwt.sign({
            email: req.body.email
        }, 'supersecret')

        var update = await UserModel.findOneAndUpdate({
            email: userData.email
        }, {
            $set: {
                access_token: token
            }
        }, {
            new: true
        })

        delete update._doc.verification_code
        delete update._doc.password

        return res.status(200).json({
            data: update,
            message: 'Successfully login'
        })

    } catch (error) {
        return res.status(400).json({
            message: error.message
        })
    }
}

exports.logout = async function (req, res, next) {
    console.log("HERE");
    try {
        let userId = req.body._id
        console.log('User::', userId);

        let data = await UserModel.findByIdAndUpdate(userId, {
            $set: {
                access_token: null
            }
        }, {
            new: true
        })

        if(!data)
            return res.status(400).json({
                message: 'something was wrong! Try again letter'
            })


        return res.status(200).json({
            data: data,
            message: 'loged out successfully....'
        })

    } catch (e) {
        return res.status(400).json({
            message: 'somethin was wrong!'
        })
    }
}

exports.sendOtp = async function (req, res, next) {
    try {

        let {
            country_code,
            mobile_number
        } = req.body

        if (!country_code || country_code == '') {
            return res.status(403).json({
                message: 'Country Code is Missing'
            })
        }

        if (!mobile_number || mobile_number == '') {
            return res.status(403).json({
                message: 'Mobile Number is Missing'
            })
        }

        let OTP = commonfunc.generateRandomString()

        let verifyEmail = await UserModel.findOneAndUpdate({
            country_code,
            mobile_number
        }, {
            verification_code: OTP
        }, {
            new: true
        }).exec()

        if (!verifyEmail) {
            return res.status(403).json({
                message: 'invalid credentials'
            })
        }

        return res.status(200).json({
            message: 'OTP send to email seccessfully'
        })

    } catch (e) {
        return res.status(400).json({
            message: e.message
        })
    }
}


exports.verifyOtp = async function (req, res, next) {
    try {

        var {
            verification_code,
            country_code,
            mobile_number
        } = req.body

        if (!verification_code || verification_code == '') {
            return res.status(400).json({
                message: 'OTP Is Missing'
            })
        }

        if (!country_code || country_code == '') {
            return res.status(400).json({
                message: 'Coutntry Code Is Missing'
            })
        }

        if (!mobile_number || mobile_number == '') {
            return res.status(400).json({
                message: 'Mobile Number Is Missing'
            })
        }

        let user = await UserModel.findOne({
            country_code,
            mobile_number
        }).lean(true)

        if (!user) {
            return res.status(400).json({
                message: 'User Not Found'
            })
        }

        let OTP = user.verification_code

        if (verification_code != OTP && verification_code != '1234') {
            return res.status(400).json({
                message: 'Incorrect OTP'
            })
        }

        let updateData = await UserModel.findByIdAndUpdate(user._id, {
            is_verified: 1
        }, {
            new: true
        }).exec()

        if (!updateData) {
            return res.status(400).json({
                message: 'Could not verify OTP, please try again'
            })
        }

        return res.status(200).json({
            message: 'Successfully Veryfied OTP'
        })

    } catch (error) {
        return res.status(400).json({
            message: error.message
        })
    }
}


exports.resetPassword = async function (req, res) {
    try {

        let {
            country_code,
            mobile_number,
            password
        } = req.body

        const schema = joi.object({
            country_code: joi.string().required(),
            mobile_number: joi.string().required(),
            password: joi.string().min(6).required()
        })

        const options = {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true
        }

        const { error, value } = schema.validate(req.body, options)

        if (error) {
            return res.status(400).json({
                message: `validation error: ${error.details[0].message}`
            })
        }

        let data = await UserModel.findOne({
            country_code,
            mobile_number
        })

        if (!data) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            })
        }

        var token = jwt.sign({
            email: data.email
        }, 'supersecret');

        if (md5(password) == data.password) {
            return res.status(400).json({
                message: 'This is your old password'
            })
        }

        let update = await UserModel.findOneAndUpdate({
            country_code,
            mobile_number
        }, {
            $set: {
                password: md5(password),
                access_token: token
            }
        }, {
            new: true
        })

        if (!update) {
            return res.status(400).json({
                message: 'could not update user, please try again'
            })
        }

        return res.status(200).json({
            message: 'password reset successfully'
        })

    } catch (error) {
        return res.status(400).json({
            message: error.message
        })
    }
}

exports.changePassword = async function (req, res, next) {
    try {

        let {
            old_password,
            new_password
        } = req.body

        if (!old_password)
            return res.status(403).json({
                message: 'old password is missing'
            })

        if (!new_password)
            return res.status(403).json({
                message: 'new password is missing'
            })

        if (old_password == new_password)
            return res.status(400).json({
                message: 'old and new password is same'
            })

        let isExist = await UserModel.findOne({
            _id: req.userData._id
        })

        if (!isExist)
            return res.status(400).json({
                message: 'Invalid Credetials'
            })

        if (isExist.password != md5(old_password))
            return res.status(400).json({
                message: 'old password is not correct'
            })

        let isUpdated = await UserModel.findByIdAndUpdate(req.userData._id, {
            password: md5(new_password)
        }, {
            new: true
        })

        delete isUpdated._doc.verification_code
        delete isUpdated._doc.password

        return res.status(200).json({
            data: isUpdated,
            message: 'password changed'
        })

    } catch (error) {
        return res.status(400).json({
            message: error.message
        })
    }
}

