const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { isAuthenticated } = require('../middlewares/jwt.middleware')

const User = require('../models/User.model')
const router = require('express').Router()

router.post('/signup', async (req, res, next) => {
    const { username, password } = req.body
  
    const newUser = { username }
    
  
    const randomSalt = await bcryptjs.genSalt(10)
  
    const passwordHash = await bcryptjs.hash(password, randomSalt)

    newUser.passwordHash = passwordHash
    try {
      await User.create(newUser)
      res.status(201).json({ message: 'New user created', status: 'OK' })
    } catch (error) {
      console.log(error)
      if (error.code === 11000) {
        res.status(403).json({ message: 'Username already in use', status: 'KO' })
      } else {
        res.status(500).json({ message: error, status: 'KO' })
      }
    }
  })

  router.post('/login', async (req, res, next) => {
    const { username, password } = req.body
    console.log("Post logs");
    const user = await User.findOne({ username })

   
  
    if (user === null) {
      res.status(404).json({ message: 'Username not found', status: 'KO' })
    } else {
      const { passwordHash, createdAt, updatedAt } = user
      if (bcryptjs.compareSync(password, passwordHash)) {
        const tempUser = { username, createdAt, updatedAt }
        delete tempUser.passwordHash
        const token = jwt.sign(tempUser, process.env.TOKEN_SECRET, {
          algorithm: 'HS256',
          expiresIn: '6h',
        })
        console.log(token)
        res.json({ token })
      } else {
        res.status(403).json({ message: 'Wrong password', status: 'KO' })
      }
    }
  })
  
  router.get('/verify',isAuthenticated, (req, res, next) => {
    // <== CREATE NEW ROUTE
    // If JWT token is valid the payload gets decoded by the
    // isAuthenticated middleware and made available on `req.payload`
    console.log(`req.payload`, req.payload)
  
    // Send back the object with user data
    // previously set as the token payload
    res.status(200).json(req.payload)
  })
  
  module.exports = router