
var navArea;

function genNavbar() {
	
	var temp = "<a href=\"\/\">Home</a>";
	temp += "<% if(user != null) { %>";
	temp += "<a href=\"/myClasses\">My Classes</a>";
	temp += "<% } %>";
	temp += "<a href=\"/survey\">Survey</a>";
	temp += "<div class=\"login-container\">";
	temp += "<% if(user != null) { %>";
	temp += "<a href=\"/profile\">Profile</a>";
	temp += "<form action=\"/logout?_method=DELETE\" method=\"POST\">";
	temp += "<button type=\"submit\">Log Out</button>";
	temp += "</form>";
	temp += "<% } %>";
			
	navArea.innerHTML = temp
}

window.onload = function() {
    navArea = document.getElementById("navbarArea");
	genNavbar();
}