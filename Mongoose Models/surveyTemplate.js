const mongoose = require("mongoose");

const SurveyTemplate = mongoose.Schema({
    __id: mongoose.Schema.Types.ObjectId,
    title:String,
    questions:Array,

})

module.exports = mongoose.model("SurveyTemplate", SurveyTemplate);