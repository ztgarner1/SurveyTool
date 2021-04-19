const mongoose = require("mongoose");

const SurveyTemplate = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title:String,
    questions:Array,
    course_id:String,
})

module.exports = mongoose.model("SurveyTemplate", SurveyTemplate);