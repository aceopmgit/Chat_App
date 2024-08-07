const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        const u = jwt.verify(token, process.env.TOKEN_SECRET);
        //console.log('***************************************************************************', u)

        const user = await User.findByPk(u.userId);
        req.user = user;
        next();


    } catch (err) {
        console.log(err);
        res.status(401).json({
            Error: err,
            success: false
        })
    }
}
