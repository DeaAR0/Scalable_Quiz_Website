const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const dbUri = 'mongodb+srv://claradea7017:quizApp_Scalable@quizapp.3upezjj.mongodb.net/quiz_app?retryWrites=true&w=majority';

mongoose.connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});

const quizSchema = new mongoose.Schema({
    title: String,
    questions: [{
        text: String,
        details: String,
        correctAnswer: String,
        options: [String],
        image: String
    }],
    quizId: { type: String, unique: true }
});

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String
});

const Quiz = mongoose.model('Quiz', quizSchema);
const User = mongoose.model('User', userSchema);

function generateUniqueId() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, 'secret');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

app.post('/saveQuiz', auth, async (req, res) => {
    const quizData = req.body;
    quizData.quizId = generateUniqueId();
    const quiz = new Quiz(quizData);
    await quiz.save();
    res.send({ success: true, id: quiz.quizId });
});

app.get('/getQuiz/:id', async (req, res) => {
    const quiz = await Quiz.findOne({ quizId: req.params.id });
    res.send(quiz);
});

app.post('/signup', [
    check('email').isEmail(),
    check('password').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    app.post('/saveScore', async (req, res) => {
        const { quizId, userId, score } = req.body;
        const scoreData = new Score({ quizId, userId, score });
        await scoreData.save();
        res.send({ success: true });
    });
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }

        user = new User({ email, password: bcrypt.hashSync(password, 10) });
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
