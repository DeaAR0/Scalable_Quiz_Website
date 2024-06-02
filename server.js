const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection pool for scalability
const db = mysql.createPool({
    connectionLimit: 10, // Increase limit for more connections
    host: 'localhost',
    user: 'root',
    password: 'password',  // replace 'password' with actual MySQL root password
    database: 'quiz_app'
});

// Save quiz data
app.post('/save-quiz', (req, res) => {
    const { title, questions } = req.body;
    const sqlInsertQuiz = 'INSERT INTO quizzes (title) VALUES (?)';
    db.query(sqlInsertQuiz, [title], (err, result) => {
        if (err) return res.status(500).send(err);
        const quizId = result.insertId;

        questions.forEach((question, index) => {
            const sqlInsertQuestion = 'INSERT INTO questions (quiz_id, question_text) VALUES (?, ?)';
            db.query(sqlInsertQuestion, [quizId, question.question_text], (err, result) => {
                if (err) return res.status(500).send(err);
                const questionId = result.insertId;

                question.answers.forEach((answer) => {
                    const sqlInsertAnswer = 'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)';
                    db.query(sqlInsertAnswer, [questionId, answer.answer_text, answer.is_correct], (err, result) => {
                        if (err) return res.status(500).send(err);
                    });
                });
            });
        });

        res.send({ message: 'Quiz saved successfully', quizId });
    });
});

// Fetch quizzes
app.get('/quizzes', (req, res) => {
    const sql = 'SELECT * FROM quizzes';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

// Fetch questions for a quiz
app.get('/quiz/:quizId/questions', (req, res) => {
    const { quizId } = req.params;
    const sql = 'SELECT * FROM questions WHERE quiz_id = ?';
    db.query(sql, [quizId], (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

// Fetch answers for a question
app.get('/question/:questionId/answers', (req, res) => {
    const { questionId } = req.params;
    const sql = 'SELECT * FROM answers WHERE question_id = ?';
    db.query(sql, [questionId], (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
