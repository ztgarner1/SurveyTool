
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
	
	var tempStr = "";
	
	var i;
	for (i = 0; i < surveyQues.length; i++) {
		
		var j = i + 1;
		
		if (surveyQues[i].type == "text") {
			tempStr += "<h4>" + surveyQues[i].ques + "</h4>";
			tempStr += "<input type=\"text\" id=\"q" + j + "\" />";
		} else if (surveyQues[i].type == "checkbox") {
			tempStr += "<h4>" + surveyQues[i].ques + "</h4>";
			tempStr += "<input type=\"checkbox\" id=\"q" + j + "\" />";
		} else if (surveyQues[i].type == "radio") {
			tempStr += "<h4>" + surveyQues[i].ques + "</h4>";
			var x;
			for (x = 0; x < surveyQues[i].ans.length; x++) {
				var temp = surveyQues[i].ans[x];
				tempStr += "<input type=\"radio\" name=\"q" + j + "\" value=\"" + temp + "\">" + temp + "</input>";
			}
			
		}
		
	}
	quesSec.innerHTML = tempStr;
}

function checkText() {
	addQuestion("text", "THIS IS A TEST for text!", []);
	addQuestion("checkbox", "THIS IS A TEST for checkbox!", []);
	addQuestion("checkbox", "THIS IS A TEST for checkbox!", ["A", "B", "C"]);
	genHTML();
}

window.onload = function() {
    quesSec = document.getElementById("questionsSections");
}