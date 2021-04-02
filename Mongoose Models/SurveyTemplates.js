const mongoose = require("mongoose");

const SurveyTemplate = mongoose.Schema({
    __id: mongoose.Schema.Types.ObjectId,
    type: String,
    answers:Number,

})

module.exports = mongoose.model("SurveyTemplate", SurveyTemplate);