const strengthMeter = document.getElementById("strength-meter");
const passwordInput= document.getElementById("password");
const passwordInput2 = document.getElementById("password2");
const reasonsContainer = document.getElementById("reasons");
const form = document.getElementById("formToSubmit");
const submitButton = document.getElementById("submitButton");
const errors = document.getElementById("error-message")

//this is the total strength of the bar currently
var totalStrength;
passwordInput.addEventListener('focus',updateStrengthMeter)
passwordInput.addEventListener("input",updateStrengthMeter)
//Set up the event listener
submitButton.addEventListener("click",()=>{
    const weaknesses = calculatePasswordStrength(passwordInput.value)
    if(totalStrength >= 70){
        weaknesses.forEach(weakness =>{
            if(weakness == null){
                form.submit();
            }
            if(weakness.message === "Passwords do not match"){
                error.innerText = "Passwords do not match"
                return
            }
        })
    }
    else{
        console.log("Less than 70")
        errors.innerText = "Password not strong enough"
        //form.reset()
    }
})

//function to update the meter within html
function updateStrengthMeter(){
    const weaknesses = calculatePasswordStrength(passwordInput.value)
    let strength = 100;
    reasonsContainer.innerHTML = '';
    weaknesses.forEach(weakness =>{
        if(weakness == null){
            return
        }
        strength -= weakness.deduction
        const messageElement = document.createElement('div');
        messageElement.innerText = weakness.message
        reasonsContainer.appendChild(messageElement)
    })
    totalStrength = strength;
    strengthMeter.style.setProperty('--strength',strength)
}
//method to calcualte what the weakness of the password
function calculatePasswordStrength(password){
    const weaknesses = [];
    weaknesses.push(lengthWeakness(password))
    weaknesses.push(lowercaseWeakness(password))
    weaknesses.push(uppercaseWeakness(password))
    weaknesses.push(matchWeakness())
    return weaknesses;
}
//Function to find out it the length of the password is long enough
function lengthWeakness(password){

    const length = password.length;

    if(length <= 5){
        return { 
            message: "Your password is too short",
            deduction: 40
        }
    }

    if(length <= 10){
        return { 
            message: "Your password could be longer",
            deduction: 15
        }
    }

}
//Check if both password are equal
function matchWeakness(){
    if(passwordInput2 != null || passwordInput2 != undefined){
        if(passwordInput.value !== passwordInput2.value){
            return {
                message: "Passwords do not match",
                deduction: 0
            }
        }
    }
    return;
}
//helper to turn the passwords to lowercase
function lowercaseWeakness(password){
    return characterTypeWeakness(password,/[a-z]/g, "Lowercase")
}
//helper to turn the password to uppercase
function uppercaseWeakness(password){
    return characterTypeWeakness(password,/[A-Z]/g, "Uppercase")
}
//helper function to check if the password contains 'type'
function characterTypeWeakness(password, regex, type){
    var matches = password.match(regex) || []
    if(matches.length === 0){
        return {
            message: "Your password has no "+type+" characters",
            deduction: 20
        }
    }
    if(matches.length <= 2){
        return {
            message: "Your password could use more "+type+" characters",
            deduction: 5
        }
    }
}