-- Place this in ServerScriptService!

local HTTP = game:GetService("HttpService")
local RunService = game:GetService("RunService")
local Players = game:GetService("Players")

local changed = {}
local last = {}

-- Assign the instance a unique ID and mark it as changed
-- so that it is sent with the next update to the server.
local function add(inst)
	if inst:IsA("BasePart") or inst:IsA("MeshPart") then
		--if inst.Anchored then continue end
		local id = HTTP:GenerateGUID(false)
		inst:SetAttribute("id", id)
		changed[inst] = true
		last[inst] = {inst.Position, inst.Orientation}
	end
end

-- Add all of the instances which are parts or meshparts
-- to the instances to be sent to the server for viewing
-- through the web viewer.
for _, inst in pairs(workspace:GetDescendants()) do
	add(inst)
end

-- Same thing as above, except add the part or meshpart upon
-- it being added to the workspace.
workspace.DescendantAdded:Connect(function(inst)
	add(inst)
end)

local queued_frames = {}
local viewed = false -- is the server being viewed
local lastTick = 0 -- tracks last check of server being viewed
RunService.Heartbeat:Connect(function()
	-- Set viewed to true if this server is currently being viewed
	-- by the web server. http://localhost:8080/viewing returns the
	-- ID of the server currently being viewed by the web server.
	if tick() - lastTick >= 5 then
		lastTick = tick()
		local res = HTTP:GetAsync("http://localhost:8080/viewing")
		print(res)
		if res and res == game.JobId or (res == "00000000-0000-0000-0000-000000000000" and RunService:IsStudio()) then
			viewed = true
		end
	end
	if #queued_frames < 120 and viewed then -- every 120 frames, send a batch of 120 frames to the web server.
		local frame = {}
		for inst, c in pairs(changed) do
			if (last[inst][1] - inst.Position).Magnitude > 0.1 or (last[inst][2] - inst.Orientation).Magnitude > 0.1 then c = true end
			last[inst] = {inst.Position, inst.Orientation}
			if not c then continue end
			local rX, rY, rZ = inst.CFrame:ToEulerAnglesXYZ()
			local data = {
				id = inst:GetAttribute("id"),
				shape = if inst.ClassName == "Part" then inst.Shape.Name else "Block",
				position = {inst.Position.X, inst.Position.Y, inst.Position.Z},
				size = {inst.Size.X, inst.Size.Y, inst.Size.Z},
				rotation = {rX, rY, rZ},
				color = {inst.Color.R, inst.Color.G, inst.Color.B},
				material = inst.Material.Name
			}
			if inst:IsA("MeshPart") then
				local meshid = string.match(inst.MeshId, "?id=(%d+)")
				if not meshid then
					meshid = string.match(inst.MeshId, "://(%d+)")
				end
				local textureid = string.match(inst.TextureID, "?id=(%d+)")
				if not textureid then
					textureid = string.match(inst.TextureID, "://(%d+)")
				end
				data.mesh = {meshid, textureid}
				data.shape = "Mesh"
			else
				for _, childinst in pairs(inst:GetChildren()) do
					if childinst:IsA("Decal") then
						if not data["decals"] then
							data.decals = {}
						end
						local textureid = string.match(childinst.Texture, "?id=(%d+)")
						if not textureid then
							textureid = string.match(childinst.Texture, "://(%d+)")
						end
						table.insert(data.decals, {textureid, childinst.Face.Name})
					end
				end
			end
			table.insert(frame, data)
			changed[inst] = false
		end
		table.insert(queued_frames, frame)
	elseif viewed then
		HTTP:RequestAsync({
			Url = "http://localhost:8080/frames",
			Method = "POST",
			Headers = {
				["Content-Type"] = "application/json"
			},
			Body = HTTP:JSONEncode(queued_frames)
		})
		queued_frames = {}
	end
end)