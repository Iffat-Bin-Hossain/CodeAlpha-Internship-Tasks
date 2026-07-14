const jwt=require("jsonwebtoken");

require("dotenv").config();

function generateToken(user){

    return jwt.sign(

        {

            id:user.id,

            username:user.username,

            email:user.email

        },

        process.env.JWT_SECRET,

        {

            expiresIn:"7d"

        }

    );

}

function verifyToken(token){

    return jwt.verify(

        token,

        process.env.JWT_SECRET

    );

}

module.exports={

    generateToken,

    verifyToken

};