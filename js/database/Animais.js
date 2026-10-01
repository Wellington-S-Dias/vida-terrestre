const mysql=require('mysql2')

class Animais{
    static connect(){
        const connection=mysql.createConnection({
            host:'localhost',
            user:'root',
            password:'',
            database:'vida_terrestre'
        })
        connection.connect()
        return connection
    }
    static getAnimais(){
        
    }
}module.exports=Animais