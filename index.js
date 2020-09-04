require("dotenv-safe").config()
const http = require('http')
const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization

    if(!authHeader) 
        return res.status(401).json({ auth: false, message: 'No authHeader provided.' })

    const parts = authHeader.split(' ')

    if(!parts.length === 2) 
        return res.status(401).send({ error: 'Token error' })

    const [ scheme, token ] = parts

    if(!/^Bearer$/i.test(scheme))
        return res.status(401).send({ error: 'Token malformatted' })
    
    jwt.verify(token, process.env.SECRET, function(err, decoded){
        if (err) 
            return res.status(401).json({ auth: false, message: 'Failed to authenticate authHeader.' })
        
            res.userId = decoded.id
            return next()
    })
    
}

app.get('/clientes', verifyJWT, (req, res, next) => {
    console.log('Retornou clientes!')
    res.json([{id:1,nome:'Pessoal'}])
})

app.post('/login', (req, res, next) => {
    // esse teste abaixo deve ser feito no banco de dados
    if(req.body.user === 'Pessoal' && req.body.pwd === '123'){
        // auth ok
        const id = 1 // id teste
        const token = jwt.sign({ id }, process.env.SECRET, {
            expiresIn: 300 // expires in 5min
        })

        return res.json({ auth: true, token: token })
    }

    res.status(500).json({ message: "Login inválido!" })
})

app.post('/logout', function(req, res){
    res.json({ auth: false, token: null })
})

const server = http.createServer(app)
server.listen(3000)
console.log('Servidor escutando na porta 3000...')











