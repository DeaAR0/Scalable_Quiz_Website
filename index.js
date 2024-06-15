const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Redis client setup
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

redisClient.on('error', (err) => {
    console.log('Redis error: ', err);
});

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});

// Import routes
const authRoutes = require('./auth');
const quizRoutes = require('./quizRoutes');

// Use routes
app.use('/auth', authRoutes);
app.use('/quiz', quizRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
