import queue_frames from "./renderer.js";

var socket = io(); // Receives frames from the server
var loading = document.getElementById("loading");
var load_removed = false;

// If not loading then remove the loading screen
// (if the id url parameter is set upon loading it is assumed that the renderer is waiting for a batch of frames from roblox)
if (new URLSearchParams(window.location.search).get("id") !== null) {
	loading.classList.remove("invisible");
}

/**
 * Fires when the server sends a group of frames
 */
socket.on("render", (frames) => {
	// console.log(frames.length);
	queue_frames(frames); // Sends the frames to the renderer to be queued
	// Remove loading screen upon receiving the first batch of frames and if the loading screen is not already removed
	if (!load_removed) {
		load_removed = true;
		document.body.removeChild(loading);
	}
});

var servers = document.getElementById("servers");
async function selectServer(id) { // opens the server selecting modal
	let spinner = document.createElement("div");
	spinner.className = "d-flex justify-content-center";
	spinner.innerHTML = `<div class="spinner-border" role="status">
		<span class="visually-hidden">Loading...</span>
	</div>`;
	servers.appendChild(spinner);
	// Get a list of servers from roblox and display them in the modal
	await fetch(`http://localhost:8081/https://games.roblox.com/v1/games/${id}/servers/Public?limit=10`).then(res => res.json()).then(data => {
		servers.innerHTML = "";
		for (let i = 0; i < data.data.length; i++) {
			let server = data.data[i];
			let server_el = document.createElement("a");
			server_el.className = "list-group-item list-group-item-action";
			server_el.href = "view?id=" + server.id;
			console.log(server);
			server_el.innerHTML = `
				<div class="d-flex w-100 justify-content-between">
					<p class="mb-0">${server.id}</p>
				  <small class="text-muted">${server.playing}/${server.maxPlayers}</small>
				  <span class="badge ${server.ping <= 80 ? "bg-success" : server.ping <= 150 ? "bg-warning text-dark" : "bg-danger"}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-reception-4" viewBox="0 0 16 16">
					<path d="M0 11.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-5zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-8zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11z"/>
				  </svg> ${server.ping}ms</span>
				</div>
				`;
			servers.appendChild(server_el);
		}
		let server_el = document.createElement("a");
		server_el.className = "list-group-item list-group-item-action";
		server_el.href = "view?id=00000000-0000-0000-0000-000000000000";
		server_el.innerHTML = `
			<div class="d-flex w-100 justify-content-between">
				<p class="mb-0">${0} (Studio)</p>
				<small class="text-muted">?/?</small>
				<span class="badge ${0 <= 80 ? "bg-success" : server.ping <= 150 ? "bg-warning text-dark" : "bg-danger"}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-reception-4" viewBox="0 0 16 16">
				<path d="M0 11.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-5zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-8zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11z"/>
				</svg> ?ms</span>
			</div>
			`;
		servers.appendChild(server_el);
	});
}

var games = document.getElementById("games");
var game_list = [8747383826]; // TODO: allow user to add and remove games from website
for (let i = 0; i < game_list.length; i++) {
	let game = game_list[i];
	let game_el = document.createElement("li");
	fetch(`http://localhost:8081/https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${game}&size=50x50&format=Png&isCircular=false`).then(res => res.json()).then(data => {
		game_el.innerHTML = `
		<button data-bs-toggle="modal" data-bs-target="#server-modal" class="dropdown-item" href="#"><img style='border-radius: 2px;' src="${!data["errors"] ? data.data[0].imageUrl : "https://doy2mn9upadnk.cloudfront.net/uploads/default/original/3X/9/7/97a01634662077ed036ebce29757e76e0445b194.png"}" height="24px" width="24px">
			${game}
		</button>
		`;
		game_el.getElementsByTagName("button")[0].onclick = () => selectServer(game);
	});
	games.appendChild(game_el);
}