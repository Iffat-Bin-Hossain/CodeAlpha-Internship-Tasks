const crypto=require("crypto");

function generateVerificationToken(){

    return crypto.randomBytes(32).toString("hex");

}

function tokenExpiry(){

    return new Date(

        Date.now()+24*60*60*1000

    );

}

module.exports={

    generateVerificationToken,

    tokenExpiry

};