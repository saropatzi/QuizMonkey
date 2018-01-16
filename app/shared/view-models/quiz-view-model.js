var observableModule = require("data/observable");
var mockQuestionsData = require("../../mockData/mockQuestionsData.json");
var config = require("../../shared/config");
var utilities = require("../../shared/utilities");

function quizViewModel(quiz) {
    var viewModel = new observableModule.fromObject(quiz)
    viewModel.currentScore = 0;

    loadBackEndDataQuestions = function () {
        return fetch(config.apiUrl + 'quizzes/' + quiz.id + '/questions')
            .then(handleErrors)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                viewModel.questions = data;
            })
    };

    loadMockDataQuestions = function () {
        var quizRelatedQuestions = mockQuestionsData.filter(q => q.quiz_id === quiz.id)
        viewModel.questions = quizRelatedQuestions;
    }

    viewModel.loadQuestions = function () {
        if (config.useLocalData) {
            return new Promise(resolve =>
                setTimeout(resolve, 2000)
            ).then(loadMockDataQuestions);
        }
        else {
            return new Promise(resolve =>
                setTimeout(resolve, 2000)
            ).then(loadBackEndDataQuestions);
        }
    }

    viewModel.incrementScore = function () {
        var newScore = viewModel.currentScore + 1;
        viewModel.currentScore = newScore;
    }

viewModel.postScore = function () {
    var correctAnswers = viewModel.currentScore;
    var quizLength = viewModel.questions.length;
    var finalScore = correctAnswers / quizLength;
    viewModel.set("finalScore", finalScore);
    var presentableScore = utilities.convertFractionToPercentageString(finalScore);
    viewModel.set("presentableScore", presentableScore);

    if (!config.useLocalData) {
        return fetch(config.apiUrl + 'quizzes/' + quiz.id, {
            method: "PATCH",
            body: JSON.stringify({
                score: finalScore,
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(handleErrors);
    }
};

    return viewModel;
}
function handleErrors(response) {
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}
module.exports = quizViewModel;
