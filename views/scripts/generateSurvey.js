
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

//Generates a string to be written into the html page
function genHTML() {
	console.log(quesSec)
	var tempStr = "";
	
	var i;
	for (i = 0; i < surveyQues.length; i++) {
		
		var j = i + 1;
		
		if (surveyQues[i].type == "text") {
			tempStr += "<h4>" + j + ") " + surveyQues[i].ques + "</h4>";
			tempStr += "<input autocomplete='false' type=\"text\" name=\"q" + j + "\" />";
		} else if (surveyQues[i].type == "checkbox") {
			tempStr += "<h4>" + j + ") " + surveyQues[i].ques + "</h4>";
			for (x = 0; x < surveyQues[i].ans.length; x++) {
				var temp = surveyQues[i].ans[x];
				tempStr += "<input autocomplete='false' type=\"checkbox\" name=\"q" + j + "\" value=\"" + temp + "\">" + temp + "</input>";
				tempStr += "<br>"
			}
			
		} else if (surveyQues[i].type == "radio") {
			tempStr += "<h4>" + j + ") " + surveyQues[i].ques + "</h4>";
			var x;
			for (x = 0; x < surveyQues[i].ans.length; x++) {
				var temp = surveyQues[i].ans[x];
				tempStr += "<input autocomplete='false' type=\"radio\" name=\"q" + j + "\" value=\"" + temp + "\">" + temp + "</input>";
				tempStr += "<br>"
			}
			
		}
		
	}
	quesSec.innerHTML = tempStr;
}

function generateQuestion(ask,type, answers ){
	console.log("adding a question")
	addQuestion(type, ask, answers.split(/[ ]*,[ ]*/));
	genHTML();
}
function setDiv(){
	quesSec = document.getElementById("questionsSections");
}

