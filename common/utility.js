/*
        gentate the random string
*/

exports.generateRandomString =  function(){
    let text = ""
    let possible = "1234567890"

    for(var i=0; i<4; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    
    return text;
}


exports.randomString = function(){
    var length = 5
    var text = ''
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    for(var i=length; i>0; --i)
        text += chars.charAt[Math.floor(Math.random()*chars.length)]

    return text;    
}