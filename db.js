const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/userData',{
    
}).then(()=>{
    console.log('Connection Connected')
}).catch((err)=>{
    console.log('Connection Failed');
})