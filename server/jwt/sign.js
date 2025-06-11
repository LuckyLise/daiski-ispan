import jwt  from "jsonwebtoken"; 
// import dotenv from "dotenv";
// dotenv.config();
// const secretKey= "member";
// const secretKey=process.argv[2];
const secretKey= process.env.JWT_SECRET_KEY;

const token=jwt.sign({
    name:"mfee6402test2",
    mail:"mfee6402@mail.com"
},secretKey)
console.log(token);
