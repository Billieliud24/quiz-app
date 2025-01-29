const root = document.getElementById("root");
// app data
let quizData = [];
let currentQuestion = 0;
let score = 0;
let timer;
let incorrectAnswer = [];
// fetch quiz data
fetch("quizData.json")
  .then((response) => response.json())
  .then((data) => {
    quizData = data;
    renderQuiz(); // start quiz when the data is loaded
  })
  .catch((error) => {
    console.error("failed to load quiz", error);
    root.innerHTML = "Failed to load quiz data.Please try again later";
  });

// view hantering
function switchView(view) {
  root.innerHTML = "";
  if (view === "quiz") {
    renderQuiz();
  } else if (view === "result") {
    renderResult();
  } else if (view === "answers") {
    renderAnswers();
  }
}
// quiz view
function renderQuiz() {
  if (currentQuestion >= quizData.length) {
    switchView("result");
    return;
  }
  const question = quizData[currentQuestion];
  root.innerHTML = `
    <h2>${question.question}</h2>
    <div id ="options">
      ${question.options
        .map(
          (option) => `
      <label class ="option">
        <input type ="radio" name="quiz" value="${option}" />
        ${option}
      </label>
      `
        )
        .join("")}
    </div>
    <button id ="submit" disabled>Submit</button>
    <div id ="timer">Time left: 10s</div>
    <div id = "feedback"></div>

  `;
  //to activate the submit btn
  document.querySelectorAll('input[name ="quiz"]').forEach((input) => {
    input.addEventListener("change", () => {
      document.getElementById("submit").disabled = false;
    });
  });

  // start timer
  startTimer();
  //handle submit
  document.getElementById("submit").addEventListener("click", () => {
    checkAnswer();
    resetTimer();
    currentQuestion++;
    setTimeout(() => renderQuiz(), 1000);
  });
}
// timer logic
function startTimer() {
  let timeleft = 10;
  const timerDisplay = document.getElementById("timer");
  timerDisplay.textContent = `time left:${timeleft}s`;

  timer = setInterval(() => {
    timeleft--;
    timerDisplay.textContent = `time left:${timeleft}s`;

    if (timeleft <= 0) {
      clearInterval(timer);
      checkAnswer(true);
      currentQuestion++;
      setTimeout(() => renderQuiz(), 1000);
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
}
// display result
function renderResult() {
  root.innerHTML = `
    <h2> Quiz completed </h2>
    <p>Your score is  ${score} out of  ${quizData.length} </p> 
    <button id ='retry'>Retry</button>
     <button id ='showAnswer'>show Answer</button>
     `;
  const retryBtn = document.getElementById("retry");
  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      currentQuestion = 0;
      score = 0;
      incorrectAnswer = [];
      switchView("quiz");
    });
  }
  const showAnswerBtn = document.getElementById("showAnswer");
  if (showAnswerBtn) {
    showAnswerBtn.addEventListener("click", () => {
      switchView("answers");
    });
  }
}

// to show the right answer
function renderAnswers() {
  root.innerHTML = `
    <h2> Review your Answers </h2>
    ${incorrectAnswer
      .map(
        (item) => `
      
        <p>
        <strong> Question:</strong>
        ${item.question} <br>
        <strong> Your Answer :</strong>
        ${item.incorrectAnswer}<br>
        <strong> Correct Answer: </strong>
        ${item.correctAnswer}</p>`
      )
      .join("")}
    <button id = 'retry'>Retry quiz</button> `;

  document.getElementById("retry").addEventListener("click", () => {
    currentQuestion = 0;
    score = 0;
    incorrectAnswer = [];
    switchView("quiz");
  });
}

function checkAnswer(timeranout = false) {
  const selectedOption = document.querySelector('input[name = "quiz"]:checked');
  const question = quizData[currentQuestion];
  const feedback = document.getElementById("feedback");

  if (!selectedOption || timeranout) {
    feedback.textContent = "no answer selected";
    feedback.style.color = "red";
    incorrectAnswer.push({
      question: question.question,
      incorrectAnswer: "no answer selected",
      correctAnswer: question.answer,
    });
    return;
  }
  const answer = selectedOption.value;
  if (answer === question.answer) {
    feedback.textContent = "correct answer";
    feedback.style.color = "green";
    score++;
  } else {
    feedback.textContent = "wrong answer";
    feedback.style.color = "red";
    incorrectAnswer.push({
      question: question.question,
      incorrectAnswer: answer,
      correctAnswer: question.answer,
    });
  }
}
