const express = require('express');
const auth = require('./authMiddleware');
const Quiz = require('./QuizSchema');
const redisClient = require('./redisClient');

const router = express.Router();

function generateUniqueId() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

router.post('/saveQuiz', auth, async (req, res) => {
    const quizData = req.body;
    quizData.quizId = generateUniqueId();
    const quiz = new Quiz(quizData);
    await quiz.save();
    redisClient.setex(`quiz:${quiz.quizId}`, 3600, JSON.stringify(quiz)); // Cache the saved quiz for 1 hour
    res.send({ success: true, id: quiz.quizId });
});

router.get('/getQuiz/:id', async (req, res) => {
    const quizId = req.params.id;

    redisClient.get(`quiz:${quizId}`, async (err, cachedQuiz) => {
        if (cachedQuiz) {
            return res.json(JSON.parse(cachedQuiz));
        } else {
            const quiz = await Quiz.findOne({ quizId });
            if (quiz) {
                redisClient.setex(`quiz:${quizId}`, 3600, JSON.stringify(quiz)); // Cache for 1 hour
                return res.json(quiz);
            } else {
                return res.status(404).json({ msg: 'Quiz not found' });
            }
        }
    });
});

module.exports = router;
