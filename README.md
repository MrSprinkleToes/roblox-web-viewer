# roblox-web-viewer
Spectate Roblox servers from the browser.

# Todo
- [x] Server browser
- [ ] Render materials

# Instructions
Here's how you run the client & server.

## Before you start...
1. Make sure node & the npm CLI are installed. (https://nodejs.org/en/download/)

## Installing dependencies
1. Clone the repository. Either download the code through the Github website or, if you have git installed, run `git clone https://github.com/MrSprinkleToes/roblox-web-viewer` on the command line where you want the directory to go.
2. In the command line, enter the directory that was created (roblox-web-viewer) and run `npm install`. This will install all required dependencies listed in `package.json`.

## Running
1. Run `node server` and `node cors` in two command lines. Once both are started, you can visit http://localhost:8080 in a web browser!

## Seeing servers
Right now, as the web server is hosted on your computer, only test servers running in Roblox Studio can communicate with the web server.
1. Insert `WebViewer.lua` into ServerScriptService and start a test server! (play test the game)
