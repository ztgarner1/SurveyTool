
var quesSec;

var surveyQues = [];

//Type is the type of question (text answer, multiple choice, selection, etc)
//Question is the question its asking
//Answers is an array of answers, depending on type will depend on how many answers
function addQuestion(questype, question, answers) {
	var temp = new Object();
	temp.type = questype;
	temp.ques = question;
	temp.ans = answers;
	surveyQues.push(temp);
}

function genHTML() {
	var i;
	for (i = 0; i < surveyQues.length; i++) {
		
		if (surveyQues[i].type == "text") {
			var tempStr = "<h4>" + surveyQues[i].ques + "</h4>";
		}
		quesSec.innerHTML = tempStr;
	}
	
}

function checkText() {
	addQuestion("text", "THIS IS A TEST!", ["A", "B"]);
	document.getElementById("quesbutton").innerText = "TESTTJGBNDJBNFJ";
	genHTML();
}