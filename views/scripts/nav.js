document.write('\
	<header>\
		<div class="navbar">\
			<a href="/">Home</a>\
			<div class="login-container">\
				<% if(user != null) { %>\
					<a href="/profile">Profile</a>\
					<form action="/logout?_method=DELETE" method="POST">\
						<button type="submit">Log Out</button>\
					</form>\
				<% } %>\
			</div>\
        </div>\
    </header>\
');