const mongoose= require("mongoose");

const SurveySchema = mongoose.Schema({
    __id:mongoose.Schema.Types.ObjectId,
    results: Array,
    course_id:String,
})

module.exports= mongoose.model("SurveyResults",SurveySchema);