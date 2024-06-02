let optionCount = 4; // Initial number of options (A, B, C, D)
let currentQuestion = 1;

document.addEventListener('DOMContentLoaded', () => {
    updatePagination();

    const quizContainer = document.getElementById('quiz-container');

    quizContainer.addEventListener('mouseover', (event) => {
        if (event.clientX < quizContainer.offsetLeft + 50) {
            prevQuestion();
        } else if (event.clientX > quizContainer.offsetLeft + quizContainer.offsetWidth - 50) {
            nextQuestion();
        }
    });

    quizContainer.addEventListener('scroll', () => {
        const pages = document.querySelectorAll('.quiz-page');
        pages.forEach((page, index) => {
            const rect = page.getBoundingClientRect();
            if (rect.left >= 0 && rect.right <= window.innerWidth) {
                currentQuestion = index + 1;
                updatePagination();
            }
        });
    });

    loadQuizPages(); // Load quiz pages dynamically
});

// Function to load quiz pages dynamically
function loadQuizPages() {
    // This function should fetch quiz data from the backend and dynamically create quiz pages
    fetch('/quizzes')
        .then(response => response.json())
        .then(quizzes => {
            const quizContainer = document.getElementById('quiz-container');
            quizContainer.innerHTML = ''; // Clear existing content

            quizzes.forEach(quiz => {
                const quizPage = document.createElement('div');
                quizPage.className = 'quiz-page';
                quizPage.innerHTML = `
                    <div class="question-number">
                        <h2>${quiz.id}. <span contenteditable="true">${quiz.title}</span></h2>
                    </div>
                    <div class="question-and-image">
                        <div class="question">
                            <textarea rows="3" contenteditable="true">Enter your question details here...</textarea>
                        </div>
                        <div class="image-upload">
                            <input type="file" id="file-input-${quiz.id}" style="display: none;">
                            <button id="file-button-${quiz.id}" onclick="document.getElementById('file-input-${quiz.id}').click();">Select or drop image here</button>
                        </div>
                    </div>
                    <div class="answers-section">
                        <label><input type="radio" name="answer-${quiz.id}"> <span class="option-letter">A</span> <span class="editable" contenteditable="true">Answer</span></label>
                        <label><input type="radio" name="answer-${quiz.id}"> <span class="option-letter">B</span> <span class="editable" contenteditable="true">Answer</span></label>
                        <label><input type="radio" name="answer-${quiz.id}"> <span class="option-letter">C</span> <span class="editable" contenteditable="true">Answer</span></label>
                        <label><input type="radio" name="answer-${quiz.id}"> <span class="option-letter">D</span> <span class="editable" contenteditable="true">Answer</span></label>
                        <button class="add-option" onclick="addOption(${quiz.id})">+ Add new option</button>
                    </div>
                `;
                quizContainer.appendChild(quizPage);
            });

            updatePagination(); // Update pagination after loading quiz pages
        })
        .catch(error => console.error('Error loading quizzes:', error));
}

// Function to save quiz data
async function saveQuiz() {
    const title = document.getElementById('quiz-title').innerText;
    const questions = [];
    document.querySelectorAll('.quiz-page').forEach((page, index) => {
        const questionText = page.querySelector('.question span').innerText;
        const answers = [];
        page.querySelectorAll('.answers-section label').forEach(label => {
            const answerText = label.querySelector('.editable').innerText;
            answers.push({ answer_text: answerText, is_correct: false });
        });
        questions.push({ question_text: questionText, answers });
    });

    const response = await fetch('/save-quiz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, questions })
    });

    const data = await response.json();
    console.log(data);
}

// Example button to save the quiz
document.body.insertAdjacentHTML('beforeend', '<button onclick="saveQuiz()">Save Quiz</button>');

// Additional functions for handling options, pagination, and image upload remain the same as previous examples
function addOption(questionNumber) {
    const answersSection = document.querySelectorAll('.answers-section')[questionNumber - 1];
    const newOptionLetter = String.fromCharCode(65 + optionCount); // Get letter (A, B, C, D, ...)
    optionCount++;

    const newOptionLabel = document.createElement('label');
    newOptionLabel.innerHTML = `<input type="radio" name="answer-${questionNumber}"> <span class="option-letter">${newOptionLetter}</span> <span class="editable" contenteditable="true">Answer</span>`;

    answersSection.insertBefore(newOptionLabel, answersSection.querySelector('.add-option'));
}

function openFullscreen(src) {
    const modal = document.getElementById('fullscreen-modal');
    const img = document.getElementById('fullscreen-img');
    img.src = src;
    modal.style.display = "block";
}

function closeFullscreen() {
    const modal = document.getElementById('fullscreen-modal');
    modal.style.display = "none";
}

function updatePagination() {
    document.getElementById('current-question').innerText = currentQuestion;
}

function prevQuestion() {
    if (currentQuestion > 1) {
        goToQuestion(currentQuestion - 1);
    }
}

function nextQuestion() {
    const totalQuestions = document.querySelectorAll('.quiz-page').length;
    if (currentQuestion < totalQuestions) {
        goToQuestion(currentQuestion + 1);
    }
}

function goToQuestion(questionNumber) {
    const quizContainer = document.getElementById('quiz-container');
    const questionPage = document.querySelectorAll('.quiz-page')[questionNumber - 1];
    quizContainer.scrollTo({
        left: questionPage.offsetLeft - quizContainer.offsetLeft,
        behavior: 'smooth'
    });
    currentQuestion = questionNumber;
    updatePagination();
}
