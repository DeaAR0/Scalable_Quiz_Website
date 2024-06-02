let optionCount = 4; // Initial number of options (A, B, C, D)
let currentQuestion = 1;

function addOption(questionNumber) {
    const answersSection = document.querySelectorAll('.answers-section')[questionNumber - 1];
    const newOptionLetter = String.fromCharCode(65 + optionCount); // Get letter (A, B, C, D, ...)
    optionCount++;

    const newOptionLabel = document.createElement('label');
    newOptionLabel.innerHTML = `<input type="radio" name="answer-${questionNumber}"> <span class="option-letter">${newOptionLetter}</span> <span class="editable" contenteditable="true">Answer</span>`;

    answersSection.insertBefore(newOptionLabel, answersSection.querySelector('.add-option'));
}

document.querySelectorAll('[id^=file-input-]').forEach((input) => {
    input.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.onclick = () => openFullscreen(e.target.result);
                const uploadButton = input.nextElementSibling;
                uploadButton.innerHTML = '';
                uploadButton.appendChild(img);
            }
            reader.readAsDataURL(file);
        }
    });
});

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
});

// Get the progress element
var progressElement = document.getElementById("progress");
// Determine the color based on the percentage
var color;
if (percentage <= 20) {
    color = "#632C2C";
} else if (percentage <= 40) {
    color = "#A54A4A";
} else if (percentage <= 60) {
    color = "#D3A156";
} else if (percentage <= 80) {
    color = "#D3B756";
} else {
    color = "#93A54A";
}

// Apply the color to the progress element
progressElement.style.backgroundColor = color;
