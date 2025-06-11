import jwt  from "jsonwebtoken"; 
// import dotenv from "dotenv"
// dotenv.config();
// const secretKey= "member";
// const secretKey=process.argv[2];
const secretKey= process.env.JWT_SECRET_KEY;

const token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoibWZlZTY0MDJ0ZXN0MiIsIm1haWwiOiJtZmVlNjQwMkBtYWlsLmNvbSIsImlhdCI6MTc0NzIyNzY3OH0.4H5DV6v-LnjKlZro8Kxv39pLQF2JjzXALUSN-UXStu8";

jwt.verify(token,secretKey,(err,user)=>{
    if(err) return console.log(err);
    console.log(user);
})
