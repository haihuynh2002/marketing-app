const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const middleware = require('./middleware')
const auth = require('./controllers/auth')
const user = require('./controllers/user')
const product = require('./controllers/product')
const blog = require('./controllers/blog')
const campaign = require('./controllers/campaign')
const message = require('./controllers/message')

require('./helpers/seedAdmin');
require('dotenv').config();

const port = process.env.PORT || 1337

const app = express()

app.use(middleware.csrf)
app.use(middleware.cors)
app.use(bodyParser.json())
app.use(cookieParser())

app.post('/login', auth.authenticate, auth.login)

app.get('/blogs', blog.listBlogs)
app.get('/blogs/:id', blog.getBlog)
app.post('/blogs', auth.ensureUser, blog.createBlog)
app.put('/blogs/:id', auth.ensureUser, blog.editBlog)
app.delete('/blogs/:id', auth.ensureUser, blog.deleteBlog)

app.get('/campaigns', campaign.listCampaigns)
app.get('/campaigns/:id', campaign.getCampaign)
app.post('/campaigns', auth.ensureUser, campaign.createCampaign)
app.put('/campaigns/:id', auth.ensureUser, campaign.editCampaign)
app.delete('/campaigns/:id', auth.ensureUser, campaign.deleteCampaign)

app.get('/messages', message.listMessages)
app.get('/messages/:id', message.getMessage)
app.post('/messages', auth.ensureUser, message.createMessage)
app.put('/messages/:id', auth.ensureUser, message.editMessage)
app.delete('/messages/:id', auth.ensureUser, message.deleteMessage)

app.get('/products', product.listProducts)
app.get('/products/:id', product.getProduct)
app.post('/products', auth.ensureUser, product.createProduct)
app.put('/products/:id', auth.ensureUser, product.editProduct)
app.delete('/products/:id', auth.ensureUser, product.deleteProduct)

app.post('/users', user.createUser);
app.get('/users/info', auth.ensureUser, user.getCurrentUser)
app.get('/users/:id', user.getUser)
app.get('/users', auth.ensureUser, user.listUsers);
app.put('/users/:id', auth.ensureUser, user.editUser)
app.delete('/users/:id', auth.ensureUser, user.deleteUser)

//app.get('/health', api.checkHealth)

app.use(middleware.handleError)
app.use(middleware.notFound)

const server = app.listen(port, () =>
  console.log(`Server listening on port ${port}`)
)

