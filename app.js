var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
const ethers = require('ethers')

var app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)

const { v4: uuidv4 } = require('uuid')

// Şimdilik veritabanı olarak düşünelim
const addressNonceMap = {}

app.post('/auth/ethereum/message', (req, res) => {
  // Kullanıcının Ethereum adresi
  let { address } = req.body
  address = address.toLowerCase()

  // Tek kullanımlık kod yoksa adrese ait, oluşturalım
  addressNonceMap[address] = addressNonceMap[address] ?? uuidv4()

  const nonce = addressNonceMap[address]

  const message = `Welcome to there's no place like 127.0.0.1!\nClick "Sign" to sign in.\nWallet address: ${address}\n\nNonce: ${nonce}`
  res.send({
    message
  })
})

app.post('/auth/ethereum/verify', (req, res) => {
  let { address, signature } = req.body
  address = address.toLowerCase()

  const nonce = addressNonceMap[address]

  const message = `Welcome to there's no place like 127.0.0.1!\nClick "Sign" to sign in.\nWallet address: ${address}\n\nNonce: ${nonce}`

  // Istenilen mesaj ile imzalanmış mesajı kullanarak imzalayan adresi çıkart
  const recoveredAddress = ethers.utils.verifyMessage(message, signature)

  // Iddia edilen adres ile imzadan çıkartılan adres eşlesiyor mu?
  if (address === recoveredAddress.toLowerCase()) {
    res.json({
      status: true
    })
  } else {
    res.json({
      status: false
    })
  }
})

module.exports = app
