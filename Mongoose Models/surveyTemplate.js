const mongoose = require("mongoose");

const SurveyTemplate = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title:String,
    questions:Array,
	weight:int,
})

module.exports = mongoose.model("SurveyTemplate", SurveyTemplate);