const form = document.querySelector("#loginForm");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const notif = document.querySelector("#notif");
const userElement = document.querySelector("#user");
form.addEventListener("submit", async (e) => {
	e.preventDefault();
	try {
		notify("Loading...");
		const res = await fetch("/login", 
			{
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({email: email.value, password: password.value})
			}
		);
		const resBody = (await res.json());
		if (resBody.message == "Success") {
			window.location.reload();
		} else
			notify(resBody.message);
	} catch(e) {
		notify("Error: "+(await res.json()).message);
	}
});

function notify(v) {
	notif.innerText = v;
}