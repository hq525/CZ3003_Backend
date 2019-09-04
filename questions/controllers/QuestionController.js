const { questionProcessor } = require('../processors/QuestionProcessor');

// Load error messages JSON
const { errorMessages } = require("../config/errorMessages")
// Load error codes
const { errorCodes } = require('../config/errorCodes');

class QuestionController {
    constructor() {

    }

    async getQuestion(req, res) {
        try {
            var question = await questionProcessor.getQuestionDAO(req.query._id);
            if(!question) {
                return res.status(errorCodes.notFound).send({
                    error: errorMessages.questionNotFound
                })
            }
            return res.status(200).send({
                data: {
                    question
                }
            })
        } catch (err) {
            return res.status(errorCodes.mongoDBError).send({
                    error : errorMessages.mongoDBQuestionSearchError
            });
        }
    }

    async getUserQuestions(req, res) {
        try {
            var questions = await questionProcessor.getAllUserQuestionsDAO(req.user._id);
            return res.status(200).send({
                data : {
                    questions
                }
            })
        } catch (err) {
            return res.status(errorCodes.mongoDBError).send({
                    error : errorMessages.mongoDBQuestionSearchError
            });
        }
    }

    async saveNewQuestion (req, res) {
        if(!req.body.text) {
            return res.status(errorCodes.incompleteData).send({
                error: errorMessages.noQuestionTextEntered
            })
        }
        if(!Number.isInteger(req.body.difficulty)) {
            return res.status(errorCodes.incompleteData).send({
                error: errorMessages.noQuestionDifficulty
            })
        }
        if(!req.body.choices) {
            return res.status(errorCodes.incompleteData).send({
                error: errorMessages.noQuestionChoices
            })
        }
        if(!req.body.correct && req.body.correct !== 0) {
            return res.status(errorCodes.incompleteData).send({
                error: errorMessages.noQuestionCorrectOption
            })
        }
        if(!req.body.topic){
            return res.status(errorCodes.incompleteData).send({
                error: errorMessages.noQuestionTopic
            })
        }
        if(req.body.correct < 0 | req.body.correct >= req.body.choices.length) {
            return res.status(errorCodes.invalidData).send({
                error: `Option out of bounds. Please enter a number from 0 to ${req.body.choices.length - 1}.` 
            })
        }

        try {
            var question = await questionProcessor.saveQuestionDAO({
                text: req.body.text,
                difficulty: req.body.difficulty,
                choices: req.body.choices,
                correct: req.body.correct,
                topic: req.body.topic,
                authorID: req.user._id
            })
        } catch(error) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBQuestionSaveError
            });
        }

        if(!question) {
            return res.status(errorCodes.mongoDBError).send({
                error: errorMessages.questionNotSavedProperly
            })
        }

        return res.status(200).send({
            question
        })
    }

    async updateQuestion(req, res) {
        try {
            var question = await questionProcessor.getQuestionDAO(req.body.videoID);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBQuestionSearchError
            });
        }
        if(!question) {
            return res.status(errorCodes.notFound).send({
                error: errorMessages.questionNotFound
            })
        }

        try {
            question = await questionProcessor.updateQuestionDAO(question._id, {
                text: (req.body.text) ? 
                    req.body.text : 
                    question.text,
                difficulty: (Number.isInteger(req.body.difficulty)) ?
                    req.body.difficulty :
                    question.difficulty,
                choices: (Array.isArray(req.body.choices) && req.body.choices.length > 0) ? 
                    req.body.choices : 
                    question.choices,
                correct: (Number.isInteger(req.body.correct)) ?
                    req.body.correct : 
                    question.correct,
                topic: (req.body.topic) ?
                    req.body.topic : 
                    question.topic
            })
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error: errorMessages.mongoDBQuestionSaveError
            })
        }

        return res.status(200).send({
            data: {
                question
            }
        })
    }

    async incrementCorrect(req, res) {
        try {
            var question = await questionProcessor.getQuestionDAO(req.body.videoID);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBQuestionSearchError
            });
        }
        if(!question) {
            return res.status(errorCodes.notFound).send({
                error: errorMessages.questionNotFound
            })
        }
        try {
            question = await questionProcessor.incrementQuestionCorrectAnswersDAO(question._id);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error: errorMessages.mongoDBQuestionCorrectIncrementError
            })
        }

        return res.status(200).send({
            data: {
                question
            }
        })
    }

    async incrementIncorrect(req, res) {
        try {
            var question = await questionProcessor.getQuestionDAO(req.body.videoID);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBQuestionSearchError
            });
        }
        if(!question) {
            return res.status(errorCodes.notFound).send({
                error: errorMessages.questionNotFound
            })
        }
        try {
            question = await questionProcessor.incrementQuestionIncorrectAnswersDAO(question._id);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error: errorMessages.mongoDBQuestionIncorrectIncrementError
            })
        }

        return res.status(200).send({
            data: {
                question
            }
        })
    }

    async deleteQuestion(req, res) {
        try {
            var question = await questionProcessor.getQuestionDAO(req.body.videoID);
        } catch (error) {
            return res.status(errorCodes.mongoDBError).send({
                error : errorMessages.mongoDBQuestionSearchError
            });
        }
        if(!question) {
            return res.status(errorCodes.notFound).send({
                error: errorMessages.questionNotFound
            })
        }
        try {
            await questionProcessor.deleteQuestionDAO(question._id);
        } catch(error) {
            return res.status(errorCodes.mongoDBError).send({
                error : "Something went wrong when deleting question"
            });
        }

        return res.status(204).send({})
    }
}

exports.questionController = new QuestionController();