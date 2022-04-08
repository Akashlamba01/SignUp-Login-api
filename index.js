const express = require('express');
const db = require('./db')
const userRouter = require('./user/userRouter').router
const bodyParser = require('body-parser')

const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static('public'));

// app.get('/', (req, res)=>{
//     res.end('hello world')
// })
app.use('/', userRouter)



app.listen(port, ()=>{
    console.log('Server Runnig');
})
