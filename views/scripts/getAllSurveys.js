var allSurveys = document.getElementById("allsurveys");
var courseData = document.getElementById("courseInfo")
var groupButton = document.getElementById("groupButton")
var addGroups = document.getElementById("addGroups");

groupButton.addEventListener("click",()=>{
    console.log(courseData.innerText)
    let courseName = courseData.innerText.split(/ |-/)[1]
    let courseSection = courseData.innerText.split(/ |-/)[2]
    console.log(courseSection)
    
    //add styles to the div
    fetch('https://wcu-surveytool.herokuapp.com/group/'+courseName+"&"+courseSection)
    .then(response => response.json())
    .then(data => {
        //populate here
        //goes through the arrays to get the names out of it
        for(let i = 0; i < data.length; i++){
            for(let j = 0; j < data[i].length; j++){
                if(j == 0){
                    addGroups.innerHTML += "<br><b>Group "+(i+1)+"</b><br>";
                }
                addGroups.innerHTML += data[i][j].first + " , " + data[i][j].last+"<br>"
                
            }
        }
    })
    .catch(error=>{
        console.log(error)
    })
})

