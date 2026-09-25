const mysql = require('mysql2');
const bcrypt=require('bcrypt')

class Usuarios{
    static connect(){
        const connection=mysql.createConnection({
            host:'localhost',
            user:'root',
            password:'',
            database:'vida_terrestre' //fazer
        })
        connection.connect()
        return connection
    }

    static async addUsuario(usuario,callback){

        const connection=Usuarios.connect()
        var {name,username,password}=usuario

        if(!name||!username||!password){
            return callback({'error':'Preencha todos os campo corretamente'})
        }

        usuario.password= await bcrypt.hash(usuario.password,10)
        var sql='insert into usuario set ?'
        connection.query(sql,usuario,(error,results)=>{
            if(error) throw error

            callback({'message':'Usuário cadastrado com sucesso!'})
        })
        connection.end()
    }
}module.exports=Usuarios