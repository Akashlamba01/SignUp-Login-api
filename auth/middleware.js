const UserModel = require('../model/user')
const jwt = require('jsonwebtoken')



exports.verifyToken = (req, res, next) => {

    console.log("access_token", req.headers)

    // check header or url parameters or post parameters for token
    const token = req.headers.access_token;

    console.log("language=========", req.headers.language)

    if (!token) return res.status(401).json({
        auth: false,
        message: 'No token provided'
    });

    // verifies secret and check expiration
    jwt.verify(token, 'supersecret', async function (err, decoded) {
        if (err)
            return res.status(401).json({
                auth: false,
                message: 'unauthorized'
            });

        let user = await UserModel.findOne({
            access_token: token
        }).lean(true)
        // if everything is good, save to request for use in other routes
        if (!user)
            return res.status(401).json({
                auth: false,
                message: 'unauthorized'
            });
        req.userData = user
        next();
    });
};