使用postman測試：

-----login-----
方法：POST
URL:http://localhost:3005/api/users/login
body >
form-data >
Key:account,password >
Value:user1,user1 >
send

-----logout-----
方法：POST
URL:http://localhost:3005/api/users/logout
Authorization >
Type:Bearer Token >
Token的空格，要貼上登入時取得的token >
send