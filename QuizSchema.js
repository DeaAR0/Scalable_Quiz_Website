const mongoose = require('mongoose');

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

module.exports = mongoose.model('Quiz', quizSchema);
