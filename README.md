repeat wait() until game:IsLoaded();
if game.PlaceId==394506555 or game.PlaceId==100000003 or game.PlaceId==185639929 then 
function isnil(thing)
		return (thing == nil)
	end
	local function round(n)
		return math.floor(tonumber(n) + 0.5)
	end
	Number = math.random(1, 1000000)
	function UpdateEspPlayer()
		for i,v in pairs(game:GetService'Players':GetChildren()) do
			pcall(function()
				if not isnil(v.Character) then
					if ESPPlayer then
						if not isnil(v.Character.Head) and not v.Character.Head:FindFirstChild('NameEsp'..Number) then
							local bill = Instance.new('BillboardGui',v.Character.Head)
							bill.Name = 'NameEsp'..Number
							bill.ExtentsOffset = Vector3.new(0, 1, 0)
							bill.Size = UDim2.new(1,200,1,30)
							bill.Adornee = v.Character.Head
							bill.AlwaysOnTop = true
							local name = Instance.new('TextLabel',bill)
							name.Font = "GothamBold"
							name.FontSize = "Size14"
							name.TextWrapped = true
							name.Text = (v.Name ..' \n'.. round((game:GetService('Players').LocalPlayer.Character.Head.Position - v.Character.Head.Position).Magnitude/3) ..' M')
							name.Size = UDim2.new(1,0,1,0)
							name.TextYAlignment = 'Top'
							name.BackgroundTransparency = 1
							name.TextStrokeTransparency = 0.5
							if v.Team == game.Players.LocalPlayer.Team then
								name.TextColor3 = Color3.new(0,255,0)
							else
								name.TextColor3 = Color3.new(255,0,0)
							end
						else
							v.Character.Head['NameEsp'..Number].TextLabel.Text = (v.Name ..' | '.. round((game:GetService('Players').LocalPlayer.Character.Head.Position - v.Character.Head.Position).Magnitude/3) ..' M\nHealth : ' .. round(v.Character.Humanoid.Health*100/v.Character.Humanoid.MaxHealth) .. '%')
						end
					else
						if v.Character.Head:FindFirstChild('NameEsp'..Number) then
							v.Character.Head:FindFirstChild('NameEsp'..Number):Destroy()
						end
					end
				end
			end)
		end
	end

local OrionLib = loadstring(game:HttpGet(('https://raw.githubusercontent.com/thanhdat4461/OrionMoblie/main/source')))()
local Window = OrionLib:MakeWindow({Name = "KaGa HUB || Glue Piece V6[Beta]", HidePremium = false, IntroText = "KaGa HUB",  SaveConfig = true, ConfigFolder = "KaGa HUB"})



local Tab = Window:MakeTab({
	Name = "Auto Farm",
	Icon = "rbxassetid://7733765398",
	PremiumOnly = false
})

local Tab2 = Window:MakeTab({
	Name = "Auto Stats",
	Icon = "rbxassetid://7734053495",
	PremiumOnly = false
})

local AutoFarmTab = Tab:AddSection({
	Name = "Setting"
})

local AutoStatsTab = Tab2:AddSection({
	Name = "Auto Stats"
})

MonName = {
    "Thug",
    "Evil Thug",
    "Slime",
    "Snake",
    "Elite Noob",
    "Cutie Noob" 
}

BossName = {
    "Unknown Boss",
    "King Slime",
    "King Noob",
    "Cutie Boss",
    "Runny",
    "Sword Master",
    "Duck Boss",
    "Sans",
    "Chara",
    "Nooby"
}

Wapon = {}
for i,v in pairs(game.Players.LocalPlayer.Backpack:GetChildren()) do  
    if v:IsA("Tool") then
       table.insert(Wapon ,v.Name)
    end
end
for i,v in pairs(game.Players.LocalPlayer.Character:GetChildren()) do  
    if v:IsA("Tool") then
       table.insert(Wapon, v.Name)
    end
end

Weapon_Tab = AutoFarmTab:AddDropdown({
	Name = "Select Weapon",
	Default = nil,
	Options = Wapon,
	Callback = function(Value)
		_G.Weapon = Value
	end    
})

AutoFarmTab:AddButton({
    Name = "Refresh Weapon",
    Callback = function()
    Wapon = {}
        for i,v in pairs(game.Players.LocalPlayer.Backpack:GetChildren()) do  
    if v:IsA("Tool") then
       table.insert(Wapon ,v.Name)
    end
end
for i,v in pairs(game.Players.LocalPlayer.Character:GetChildren()) do  
    if v:IsA("Tool") then
       table.insert(Wapon, v.Name)
    end
end
              Weapon_Tab:Refresh(Wapon,true)
      end    
})


AutoFarmTab:AddDropdown({
	Name = "Select Monster",
	Default = nil,
	Options = MonName,
	Callback = function(Value)
		_G.Monster = Value
	end    
})

AutoFarmTab:AddDropdown({
	Name = "Select Boss",
	Default = nil,
	Options = BossName,
	Callback = function(Value)
		_G.Boss = Value
	end    
})


function TP(CFrame)
    pcall(function()
        game.Players.LocalPlayer.Character:WaitForChild("HumanoidRootPart").CFrame = CFrame
    end)
end


function EquipWeapon(ToolSe)
		if game.Players.LocalPlayer.Backpack:FindFirstChild(ToolSe) then
			Tool = game.Players.LocalPlayer.Backpack:WaitForChild(ToolSe)
			wait(.1)
			game.Players.LocalPlayer.Character.Humanoid:EquipTool(Tool)
	end
end
		

local AutoFarmTab = Tab:AddSection({
	Name = "AutoFarm"
})


AutoFarmTab:AddToggle({
	Name = "Auto Farm Monster",
	Default = false,
	Callback = function(Value)
        pcall(function()
		_G.Auto_Farm_Monster = true
        _G.NOCLIP = Value
      --  _G.NOCLIPRanbow = true
if Value then
    AutoFarmMonster()
    else
        _G.Auto_Farm_Monster = false
        NoclipToFly:Destroy()
       -- _G.NOCLIPRanbow = false
       game:GetService("Players").LocalPlayer.Character.HumanoidRootPart:FindFirstChild("BodyClip"):Destroy()
end
end)
	end    
})

AutoFarmTab:AddToggle({
	Name = "Auto Farm Boss",
	Default = false,
	Callback = function(Value)
        pcall(function()
_G.Auto_Farm_Boss = true
_G.NOCLIP = Value
--_G.NOCLIPRanbow = true
if Value then
    AutoFarmBoss()
    else
        _G.Auto_Farm_Boss = false
        NoclipToFly:Destroy()
        game:GetService("Players").LocalPlayer.Character.HumanoidRootPart:FindFirstChild("BodyClip"):Destroy()
end
end)
end
})


AutoFarmTab:AddToggle({
	Name = "Tp To Fruit",
	Default = false,
	Callback = function(Value)
_G.Tp_fruit = Value
while _G.Tp_fruit do task.wait()
game.Players.LocalPlayer.Data.Stats.Current_DevilFruit.Value = "None"
wait(.1)
    for i,v in pairs(game.Workspace.Fruity:GetChildren()) do
          game:GetService("Players").LocalPlayer.Character.HumanoidRootPart.CFrame = v.CFrame
end
end
end
})

AutoFarmTab:AddToggle({
	Name = "Ken",
	Default = false,
	Callback = function(Value)
	_G.Ken = Value
while _G.Ken do wait()
   game:GetService("Players").LocalPlayer.Backpack.Kenbunshoku.Remote.Haki_Event:FireServer()
end
	end    
})



AutoFarmTab:AddToggle({
	Name = "Haki",
	Default = false,
	Callback = function(Value)
		_G.Haki = Value
while _G.Haki do wait()
   game:GetService("Players").LocalPlayer.Backpack.Busoshoku.Remote.Haki_Event:FireServer()
end
	end    
})



spawn(function()
    pcall(function()
        game:GetService("RunService").Heartbeat:Connect(function()
            if _G.NOCLIPRanbow then
                if not game:GetService("Workspace"):FindFirstChild("LOL") then
                    Paertaiteen = Instance.new("Part")
                    Paertaiteen.Name = "LOL"
                    Paertaiteen.Parent = game.Workspace
                    Paertaiteen.Anchored = true
                    Paertaiteen.Transparency = 1
                    Paertaiteen.Size = Vector3.new(15,0.5,15)
                    Paertaiteen.Material = "Neon"
                elseif game:GetService("Workspace"):FindFirstChild("LOL") then
                    pcall(function()
                    game.Workspace["LOL"].CFrame = CFrame.new(game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame.X,game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame.Y - 3.92,game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame.Z)
                    end)
                end
            else
                if game:GetService("Workspace"):FindFirstChild("LOL") then
                    game:GetService("Workspace"):FindFirstChild("LOL"):Destroy()
                end
            end
        end)
    end)
 end)

function AutoFarmMonster()

    spawn(function()

        while _G.Auto_Farm_Monster == true do wait()
            pcall(function()
                if not game:GetService("Players").LocalPlayer.Character.HumanoidRootPart:FindFirstChild("BodyClip") and _G.Auto_Farm_Monster == true then
                    NoclipToFly = Instance.new("BodyVelocity")
                    NoclipToFly.Name = "BodyClip"
                    NoclipToFly.Parent = game:GetService("Players").LocalPlayer.Character.HumanoidRootPart
                    NoclipToFly.MaxForce = Vector3.new(100000,100000,100000)
                    NoclipToFly.Velocity = Vector3.new(0,0,0)
                elseif _G.Auto_Farm_Monster == false then
                    NoclipToFly:Destroy()
                end
                EquipWeapon(tostring(_G.Weapon))
            for i,v in pairs(game:GetService("Workspace").NPCs:GetDescendants()) do
                if v:FindFirstChild("Humanoid") and v.Name ~= game.Players.LocalPlayer.Name  then
                    v.Humanoid:ChangeState(11)
                    v.Humanoid:ChangeState(14)
            if v.Name == tostring(_G.Monster) and v.Humanoid.Health >0 and v.Name ~= " " and v.Name ~= "" then
                chosenDemon = false
                if chosenDemon == false then
				TP(v.HumanoidRootPart.CFrame * CFrame.new(0,0,3))
                game.Players.LocalPlayer.Character[_G.Weapon]:Activate()
                v.Humanoid.HealthChanged:Connect(function()
                    if v.Humanoid.Health <= 0 then
                        chosenDemon = true
                    end
                end)
                end
end
end
end
end)
            end
        end)
end

function AutoFarmBoss()
    spawn(function()
        while _G.Auto_Farm_Boss == true do wait()
            pcall(function()
                EquipWeapon(tostring(_G.Weapon))
                if not game:GetService("Players").LocalPlayer.Character.HumanoidRootPart:FindFirstChild("BodyClip") and _G.Auto_Farm_Boss == true then
                    NoclipToFly = Instance.new("BodyVelocity")
                    NoclipToFly.Name = "BodyClip"
                    NoclipToFly.Parent = game:GetService("Players").LocalPlayer.Character.HumanoidRootPart
                    NoclipToFly.MaxForce = Vector3.new(100000,100000,100000)
                    NoclipToFly.Velocity = Vector3.new(0,0,0)
                elseif _G.Auto_Farm_Boss == false then
                    NoclipToFly:Destroy()
                end
            for i,v in pairs(game:GetService("Workspace").NPCs:GetDescendants()) do
                if v:FindFirstChild("Humanoid") and v.Name ~= game.Players.LocalPlayer.Name  then
                    v.Humanoid:ChangeState(11)
                    v.Humanoid:ChangeState(14)
            if v.Name == tostring(_G.Boss) and v.Humanoid.Health >0 and v.Name ~= " " and v.Name ~= "" then
				TP(v.HumanoidRootPart.CFrame * CFrame.new(0,0,3))
game.Players.LocalPlayer.Character[_G.Weapon]:Activate()

end
end
end
end)
            end
        end)
end

spawn(function()
	pcall(function()
		game:GetService("RunService").Stepped:Connect(function()
			if _G.NOCLIP == true then
				for i,v in pairs(game:GetService("Players").LocalPlayer.Character:GetDescendants()) do
					if v:IsA("BasePart") then
						v.CanCollide = false    
					end
				end
			end
		end)
	end)
end)


AutoStatsTab:AddTextbox({
	Name = "Use Points",
	Default = tostring(_G.Point),
	TextDisappear = false,
	Callback = function(Value)
		_G.Point = Value
	OrionLib:MakeNotification({
	Name = "KaGa Hub",
	Content = "Use Points: ".. tostring(_G.Point),
	Image = "rbxassetid://7733771811",
	Time = 5
})
	end	  
})


AutoStatsTab:AddToggle({
	Name = "Strength",
	Default = false,
	Callback = function(Value)
_G.Melee = Value
while _G.Melee do wait()
local args = {
    [1] = "Add Stats",
    [2] = "Strength",
    [3] = _G.Point
}

game:GetService("ReplicatedStorage").Remote.RemoteEvent.UI_Event:FireServer(unpack(args))

    end
end
})

AutoStatsTab:AddToggle({
	Name = "Defense",
	Default = false,
	Callback = function(Value)
_G.Defense = Value
while _G.Defense do wait()
local args = {
    [1] = "Add Stats",
    [2] = "Defense",
    [3] = _G.Point
}

game:GetService("ReplicatedStorage").Remote.RemoteEvent.UI_Event:FireServer(unpack(args))
    end
end
})

AutoStatsTab:AddToggle({
	Name = "Sword",
	Default = false,
	Callback = function(Value)
_G.Sword = Value
while _G.Sword do wait()
local args = {
    [1] = "Add Stats",
    [2] = "Melee",
    [3] = _G.Point
}

game:GetService("ReplicatedStorage").Remote.RemoteEvent.UI_Event:FireServer(unpack(args))
end
end
})

AutoStatsTab:AddToggle({
	Name = "DevilFruit",
	Default = false,
	Callback = function(Value)
_G.DevilFruit = Value
while _G.DevilFruit do wait()
local args = {
    [1] = "Add Stats",
    [2] = "DevilFruit",
    [3] = _G.Point
}

game:GetService("ReplicatedStorage").Remote.RemoteEvent.UI_Event:FireServer(unpack(args))
end
end
})

Point_Tab = AutoStatsTab:AddLabel("Points : ".. game:GetService("Players").LocalPlayer.Data.Stats.SkillPoint.Value)

spawn(function()
    while wait() do
    Point_Tab:Set("Points : ".. game:GetService("Players").LocalPlayer.Data.Stats.SkillPoint.Value)
    end
    end)

--teleport//islands
local Warp = Window:MakeTab({
	Name = "Teleport",
	Icon = "rbxassetid://4483345998",
	PremiumOnly = false
})

local MainTp = Warp:AddSection({
	Name = "Teleport Islands"
})

Island =  { 
	     "เกาะสุ่มผล[SafeZone]",
	     "เกาะท้องฟ้า[Sky]",
	     "เกาะลับ[SafeZone]",
	     "เกาะกลาง[Middle]",
	     "เกาะคาร่า[Chara]",
	     "เกาะแซน[SafeZone]",
	     "เกาะโยร[Yoru]",
	     "เกาะง[Snake]",
	     "เกาะทะเลทราย[desert]",
	     "เกาะสไลม[Slime]",
	     "เกาะเป็ด[Duck]",
	     "เกาะกระต่าย[Rabbit]",
	     "เกาะหิมะ[Snow]",
	     "เกาะหลุมศพ[grave]",
	     "เกาะเริ่มต้น[Starter]"
	     
	
	     }


MainTp:AddDropdown({
	Name = "Select Island",
	Default = false,
	Options = Island,
	Callback = function(Value)
		_G.Select = Value
	end    
})

Warp:AddButton({
  Name = "Instants Teleport",
  Callback = function()
  _G.Bypass = true
if _G.Bypass == true then
  if _G.Select == "เกาะสุ่มผล[SafeZone]" then
game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame = CFrame.new(-1245.79492, -10.9387941, 675.191895, -0.02756113, -4.70774566e-08, -0.99962014, 3.2829e-08, 1, -4.80004942e-08, 0.99962014, -3.41394788e-08, -0.02756113)
elseif _G.Select == "เกาะท้องฟ้า[Sky]" then
game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame = CFrame.new(-1079.9425, 331.630798, 1628.81262, -0.632206082, 9.79971304e-08, -0.774800301, 6.27129566e-08, 1, 7.5309238e-08, 0.774800301, -9.79055281e-10, -0.632206082)
elseif _G.Select == "เกาะทะเลทราย[desert]" then
game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame = CFrame.new(-2430.08984, 41.3999977, 1549.91064, 0.388716787, -3.0506897e-10, -0.921357274, 2.67889533e-09, 1, 7.99106559e-10, 0.921357274, -2.77884604e-09, 0.388716787)
elseif _G.Select == "เกาะง[Snake]" then
game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame = CFrame.new(-2317.18921, 28.4824982, 434.750549, 0.963593781, -3.59299541e-08, 0.267370611, 6.71945273e-08, 1, -1.07783997e-07, -0.267370611, 1.21825835e-07, 0.963593781)
elseif _G.Select == "เกาะสไลม[Slime]" then
game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame = CFrame.new(-1445.47229, -18.6000061, -435.403473, 0.926985025, -2.26178507e-08, -0.375098348, 1.92278282e-09, 1, -5.55466571e-08, 0.375098348, 5.07696853e-08, 0.926985025)
elseif _G.Select == "เกาะเริ่มต้น[Starter]" then
game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame = CFrame.new(88.2164001, -14.1403589, -520.512329, 0.562535107, 4.69762504e-08, 0.826773405, 4.97275146e-08, 1, -9.06532804e-08, -0.826773405, 9.21090404e-08, 0.562535107)
elseif _G.Select == "เกาะหลุมศพ[grave]" then
game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame = CFrame.new(554.287842, -28.1200066, -630.15271, 0.535479188, 3.28198375e-08, -0.844548404, -6.56965256e-08, 1, -2.79354606e-09, 0.844548404, 5.69797827e-08, 0.535479188)
elseif _G.Select == "เกาะหิมะ[Snow]" then
game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame = CFrame.new(1979.74011, 47.1867828, -493.640411, 0.111691199, -2.41791454e-09, 0.993742943, -7.11234733e-08, 1, 1.04270237e-08, -0.993742943, -7.18430613e-08, 0.111691199)
elseif _G.Select == "เกาะกระต่าย[Rabbit]" then
  game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame = CFrame.new(700.362305, 23.3999958, 2589.89893, 0.0206456836, -5.90684444e-08, 0.999786854, -3.89816392e-08, 1, 5.98860126e-08, -0.999786854, -4.020972e-08, 0.0206456836)
elseif _G.Select == "เกาะลับ[SafeZone]" then
game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame = CFrame.new(-641.451904, 36.4000587, 2744.80664, 0.914488554, 1.8985602e-10, -0.404611707, -2.26299299e-10, 1, -4.22432436e-11, 0.404611707, 1.30194314e-10, 0.914488554)
elseif _G.Select == "เกาะกลาง[Middle]" then
game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame = CFrame.new(212.02127075195312, 44.0279541015625, 1002.7066650390625)   
elseif _G.Select == "เกาะคาร่า[Chara]" then
game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame = CFrame.new(-32.6725922, -18.9500408, -2160.72119, -0.999889314, 4.01370291e-11, 0.0148763098, -1.52812096e-09, 1, -1.05408461e-07, -0.0148763098, -1.05419531e-07, -0.999889314)
elseif _G.Select == "เกาะแซน[SafeZone]" then
game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame = CFrame.new(2371.93164, -26.4000244, -2157.64136, 0.983465731, -2.06881214e-08, -0.181094304, 1.9111047e-08, 1, -1.0453463e-08, 0.181094304, 6.81972079e-09, 0.983465731)
elseif _G.Select == "เกาะโยร[Yoru]" then
game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame = CFrame.new(1410.6051, 20.0999947, 1211.6189, -0.976183534, -2.94910103e-11, 0.216946289, -9.5987609e-09, 1, -4.30551772e-08, -0.216946289, -4.41121699e-08, -0.976183534)
elseif _G.Select == "เกาะเป็ด[Duck]" then
game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame = CFrame.new(2556.8335, -28.5000057, 1709.86328, -0.0541293919, 3.82003833e-08, 0.998533905, 6.91660862e-09, 1, -3.78815272e-08, -0.998533905, 4.85596408e-09, -0.0541293919) 
        end
     end
  end
  })

local PlayersTab = Window:MakeTab({

    Name = "Players",

    Icon = "rbxassetid://8997385940",
    PremiumOnly = false
})

local Section = PlayersTab:AddSection({
    Name = "ผู้เล่น[Players]"
})

Plr = {}
for i,players in pairs(game.Players:GetChildren()) do
    if players.Name ~= game.Players.LocalPlayer.Name then
        table.insert(Plr,players.Name)
    end
end

Plr_Tab = PlayersTab:AddDropdown({
    Name = "เลือก[Select]",
    Default = "1",
    Options = Plr,
    Callback = function(Value)
        SPlayer = Value
    end    
})

PlayersTab:AddButton({
    Name = "รีเซ็ต[Reset]",
    Callback = function()
        Plr = {}
for i,players in pairs(game.Players:GetChildren()) do
    if players.Name ~= game.Players.LocalPlayer.Name then
        table.insert(Plr,players.Name)
    end
end
              Plr_Tab:Refresh(Plr,true)
      end    
})

PlayersTab:AddButton({
    Name = "วาป[Tp]",
    Callback = function()
              game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame = game.Players[SPlayer].Character.HumanoidRootPart.CFrame
      end    
})

PlayersTab:AddToggle({
    Name = "วาปรัวๆ[Loop]",
    Default = false,
    Callback = function(Value)
        Tptoplayers = Value
        while Tptoplayers do wait()
            game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame = game.Players[SPlayer].Character.HumanoidRootPart.CFrame
        end
    end    
})

PlayersTab:AddToggle({
    Name = "Esp Players",
    Default = false,
    Callback = function(Value)
ESPPlayer = Value
        while ESPPlayer do wait()
            UpdateEspPlayer()
        end
end
})

--misc

local X = Window:MakeTab({

    Name = "Misc",

    Icon = "rbxassetid://7733799682",
    PremiumOnly = false
})

local Mi = X:AddSection({
	Name = "Fps "
})


Mi:AddButton({
        Name = "Unlock Fps",
        Callback = function()
         setfpscap(99999)   
        end
    })

Mi:AddButton({
        Name = "Boost Fps",
        Callback = function()
    local decalsyeeted = true
    local g = game
    local w = g.Workspace
    local l = g.Lighting
    local t = w.Terrain
    t.WaterWaveSize = 0
    t.WaterWaveSpeed = 0
    t.WaterReflectance = 0
    t.WaterTransparency = 0
    l.GlobalShadows = false
    l.FogEnd = 9e9
    l.Brightness = 0
    settings().Rendering.QualityLevel = "Level01"
    for i, v in pairs(g:GetDescendants()) do
        if v:IsA("Part") or v:IsA("Union") or v:IsA("CornerWedgePart") or v:IsA("TrussPart") then 
            v.Material = "Plastic"
            v.Reflectance = 0
        elseif v:IsA("Decal") or v:IsA("Texture") and decalsyeeted then
            v.Transparency = 1
        elseif v:IsA("ParticleEmitter") or v:IsA("Trail") then
            v.Lifetime = NumberRange.new(0)
        elseif v:IsA("Explosion") then
            v.BlastPressure = 1
            v.BlastRadius = 1
        elseif v:IsA("Fire") or v:IsA("SpotLight") or v:IsA("Smoke") or v:IsA("Sparkles") then
            v.Enabled = false
        elseif v:IsA("MeshPart") then
            v.Material = "Plastic" 
            v.Reflectance = 0
            v.TextureID = 10385902758728957
        end
    end
    for i, e in pairs(l:GetChildren()) do
        if e:IsA("BlurEffect") or e:IsA("SunRaysEffect") or e:IsA("ColorCorrectionEffect") or e:IsA("BloomEffect") or e:IsA("DepthOfFieldEffect") then
            e.Enabled = false
        end
end
        end
    })

Mi:AddButton({
	Name = "Anti AFK",
	Callback = function()
      		local vu = game:GetService("VirtualUser")
game:GetService("Players").LocalPlayer.Idled:connect(function()
vu:Button2Down(Vector2.new(0,0),workspace.CurrentCamera.CFrame)
wait(1)
vu:Button2Up(Vector2.new(0,0),workspace.CurrentCamera.CFrame)
end)
  	end    
})


--server

local Mi = X:AddSection({
	Name = "Server"
})

Mi:AddButton({
        Name = "Rejoin Server",
        Callback = function()
 game:GetService("TeleportService"):Teleport(game.PlaceId, game:GetService("Players").LocalPlayer)
end
})

Mi:AddButton({
        Name = "Hop Server",
        Callback = function()
  local Http = game:GetService("HttpService")

            local TPS = game:GetService("TeleportService")

            local Api = "https://games.roblox.com/v1/games/"
            local _place = game.PlaceId
            local _servers = Api .. _place .. "/servers/Public?sortOrder=Asc&limit=100"
            function ListServers(cursor)
                local Raw = game:HttpGet(_servers .. ((cursor and "&cursor=" .. cursor) or ""))
                return Http:JSONDecode(Raw)
            end
            local Server, Next
            repeat
                local Servers = ListServers(Next)
                Server = Servers.data[1]
                Next = Servers.nextPageCursor
            until Server
            TPS:TeleportToPlaceInstance(_place, Server.id, game.Players.LocalPlayer)
        end
        })
      


--item
local Tab = Window:MakeTab({
	Name = "Item",
	Icon = "rbxassetid://7733946818",
	PremiumOnly = false
})

local Tab = Tab:AddSection({
	Name = "Buy Item"
})

item =  { 
	     "Haki | 250K",
	     "Triple Sword | 125M",
	     "Geppo | 100K",
	     "Soru | 500K",
	     "Black leg | 1M",
	     "Deku | 30M",
	     "Ken | 500K",
	     "Reset Stats | 250K",
	     "Awaken Fruit | 50M",
	     "Random Fruity | 1M",
	     "Reset Fruity | 250K",
	     "Limitless | 300M and lv3000"
	     }


Tab:AddDropdown({
	Name = "Select item to buy",
	Default = false,
	Options = item,
	Callback = function(Value)
		_G.Select_tem = Value
	end    
})

Tab:AddButton({
  Name = "Buy Item",
  Callback = function()
  _G.Buyitem = true
if _G.Buyitem == true then
  if _G.Select_tem == "Haki | 250K" then
    local args = {
    [1] = "Shop",
    [2] = "Haki",
    [3] = "BusoHaki"
}

game:GetService("ReplicatedStorage").Remote.RemoteEvent.Shop_Event:FireServer(unpack(args))

elseif _G.Select_tem == "Triple Sword | 125M" then
  local args = {
    [1] = "Shop",
    [2] = "Weapon",
    [3] = "Triple Katana"
}

game:GetService("ReplicatedStorage").Remote.RemoteEvent.Shop_Event:FireServer(unpack(args))

elseif _G.Select_tem == "Geppo | 100K" then
  local args = {
    [1] = "Shop",
    [2] = "Technique",
    [3] = "Geppo"
}

game:GetService("ReplicatedStorage").Remote.RemoteEvent.Shop_Event:FireServer(unpack(args))

elseif _G.Select_tem == "Soru | 500K" then
  local args = {
    [1] = "Shop",
    [2] = "Technique",
    [3] = "Soru"
}

game:GetService("ReplicatedStorage").Remote.RemoteEvent.Shop_Event:FireServer(unpack(args))

elseif _G.Select_tem == "Black leg | 1M" then
 local args = {
    [1] = "Shop",
    [2] = "Fighting Style",
    [3] = "Black Leg"
}

game:GetService("ReplicatedStorage").Remote.RemoteEvent.Shop_Event:FireServer(unpack(args))

elseif _G.Select_tem == "Deku | 30M" then
  local args = {
    [1] = "Shop",
    [2] = "Fighting Style",
    [3] = "OFA [Deku]"
}

game:GetService("ReplicatedStorage").Remote.RemoteEvent.Shop_Event:FireServer(unpack(args))

elseif _G.Select_tem == "Ken | 500K" then
local args = {
    [1] = "Shop", 
    [2] = "Haki",
    [3] = "Observation"
}

game:GetService("ReplicatedStorage").Remote.RemoteEvent.Shop_Event:FireServer(unpack(args))

elseif _G.Select_tem == "Reset Stats | 250K" then
game:GetService("ReplicatedStorage").Remote.RemoteEvent.Shop_Event:FireServer("Shop","Reset","Stats","Money")

elseif _G.Select_tem == "Awaken Fruit | 50M" then
  game:GetService("ReplicatedStorage").Remote.RemoteEvent.Shop_Event:FireServer("Shop","Awakening")
  
  elseif _G.Select_tem == "Random Fruity | 1M" then
  game:GetService("ReplicatedStorage").Remote.RemoteEvent.Shop_Event:FireServer("Shop","Random Fruity","Money")
  
  elseif _G.Select_tem == "Reset Fruity | 250K" then
  game:GetService("ReplicatedStorage").Remote.RemoteEvent.Shop_Event:FireServer("Shop","Reset","Fruity","Money")
  
  elseif _G.Select_tem == "Limitless | 300M and lv3000" then
  local args = {
    [1] = "Shop",
    [2] = "Fighting Style",
    [3] = "Limitless"
}

game:GetService("ReplicatedStorage").Remote.RemoteEvent.Shop_Event:FireServer(unpack(args))

        end
     end
  end
  })


--newpower
local Tab = Window:MakeTab({
	Name = "New Funny [Power]",
	Icon = "rbxassetid://7733964640",
	PremiumOnly = false
})

Tab:AddLabel("Jump")

Tab:AddTextbox({
	Name = "Jump",
	Default = "",
	TextDisappear = true,
	Callback = function(Value)
		game.Players.LocalPlayer.Character.Humanoid.JumpPower = Value
	end	  
})

Tab:AddLabel("Speed")

Tab:AddTextbox({
	Name = "Speed",
	Default = "",
	TextDisappear = true,
	Callback = function(Value)
		game.Players.LocalPlayer.Character.Humanoid.WalkSpeed = Value
	end	  
})

Tab:AddTextbox({
	Name = "Fov",
	Default = "",
	TextDisappear = true,
	Callback = function(Value)
		workspace.CurrentCamera.FieldOfView = Value
	end	  
})

Tab:AddButton({
     Name = "Inf jump",
     Callback = function()
     local InfiniteJumpEnabled = true game:GetService("UserInputService").JumpRequest:connect(function()  if InfiniteJumpEnabled then   game:GetService"Players".LocalPlayer.Character:FindFirstChildOfClass'Humanoid':ChangeState("Jumping")  end end)
     
     end
})

--tools
local Tab = Window:MakeTab({
	Name = "Tools",
	Icon = "rbxassetid://7733964808",
	PremiumOnly = false
})


Tab:AddButton({
	Name = "Tools TP",
	Callback = function()
      		mouse = game.Players.LocalPlayer:GetMouse() 
 
tool = Instance.new("Tool") 
 
tool.RequiresHandle = false 
 
tool.Name = "Equip to Click TP" 
 
tool.Activated:connect(function() 
 
local pos = mouse.Hit+Vector3.new(0,2.5,0) 
 
pos = CFrame.new(pos.X,pos.Y,pos.Z) 
 
game.Players.LocalPlayer.Character.HumanoidRootPart.CFrame = pos 
 
end) 
 
tool.Parent = game.Players.LocalPlayer.Backpack
  	end    
})



Tab:AddButton({
	Name = "Btools",
	Callback = function()
	loadstring(game:GetObjects("rbxassetid://6695644299")[1].Source)()
	end
})


--EspPlayers

local Tab = Window:MakeTab({
	Name = "Esp",
	Icon = "rbxassetid://7733708692",
	PremiumOnly = false
})


Tab:AddButton({
	Name = "Esp Chams",
	Callback = function()
      		local dwEntities = game:GetService("Players")
local dwLocalPlayer = dwEntities.LocalPlayer 
local dwRunService = game:GetService("RunService")

local settings_tbl = {
    ESP_Enabled = true,
    ESP_TeamCheck = false,
    Chams = true,
    Chams_Color = Color3.fromRGB(0,0,255),
    Chams_Transparency = 0.1,
    Chams_Glow_Color = Color3.fromRGB(255,0,0)
}

function destroy_chams(char)

    for k,v in next, char:GetChildren() do 

        if v:IsA("BasePart") and v.Transparency ~= 1 then

            if v:FindFirstChild("Glow") and 
            v:FindFirstChild("Chams") then

                v.Glow:Destroy()
                v.Chams:Destroy() 

            end 

        end 

    end 

end

dwRunService.Heartbeat:Connect(function()

    if settings_tbl.ESP_Enabled then

        for k,v in next, dwEntities:GetPlayers() do 

            if v ~= dwLocalPlayer then

                if v.Character and
                v.Character:FindFirstChild("HumanoidRootPart") and 
                v.Character:FindFirstChild("Humanoid") and 
                v.Character:FindFirstChild("Humanoid").Health ~= 0 then

                    if settings_tbl.ESP_TeamCheck == false then

                        local char = v.Character 

                        for k,b in next, char:GetChildren() do 

                            if b:IsA("BasePart") and 
                            b.Transparency ~= 1 then
                                
                                if settings_tbl.Chams then

                                    if not b:FindFirstChild("Glow") and
                                    not b:FindFirstChild("Chams") then

                                        local chams_box = Instance.new("BoxHandleAdornment", b)
                                        chams_box.Name = "Chams"
                                        chams_box.AlwaysOnTop = true 
                                        chams_box.ZIndex = 4 
                                        chams_box.Adornee = b 
                                        chams_box.Color3 = settings_tbl.Chams_Color
                                        chams_box.Transparency = settings_tbl.Chams_Transparency
                                        chams_box.Size = b.Size + Vector3.new(0.02, 0.02, 0.02)

                                        local glow_box = Instance.new("BoxHandleAdornment", b)
                                        glow_box.Name = "Glow"
                                        glow_box.AlwaysOnTop = false 
                                        glow_box.ZIndex = 3 
                                        glow_box.Adornee = b 
                                        glow_box.Color3 = settings_tbl.Chams_Glow_Color
                                        glow_box.Size = chams_box.Size + Vector3.new(0.13, 0.13, 0.13)

                                    end

                                else

                                    destroy_chams(char)

                                end
                            
                            end

                        end

                    else

                        if v.Team == dwLocalPlayer.Team then
                            destroy_chams(v.Character)
                        end

                    end

                else

                    destroy_chams(v.Character)

                end

            end

        end

    else 

        for k,v in next, dwEntities:GetPlayers() do 

            if v ~= dwLocalPlayer and 
            v.Character and 
            v.Character:FindFirstChild("HumanoidRootPart") and 
            v.Character:FindFirstChild("Humanoid") and 
            v.Character:FindFirstChild("Humanoid").Health ~= 0 then
                
                destroy_chams(v.Character)

            end

        end

    end

end)
  	end    
})

Tab:AddButton({
	Name = "Highlight Red",
	Callback = function()
	local Players = game:GetService("Players"):GetChildren()
local RunService = game:GetService("RunService")
local highlight = Instance.new("Highlight")
highlight.Name = "Highlight"

for i, v in pairs(Players) do
    repeat wait() until v.Character
    if not v.Character:FindFirstChild("HumanoidRootPart"):FindFirstChild("Highlight") then
        local highlightClone = highlight:Clone()
        highlightClone.Adornee = v.Character
        highlightClone.Parent = v.Character:FindFirstChild("HumanoidRootPart")
        highlightClone.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop
        highlightClone.Name = "Highlight"
    end
end

game.Players.PlayerAdded:Connect(function(player)
    repeat wait() until player.Character
    if not player.Character:FindFirstChild("HumanoidRootPart"):FindFirstChild("Highlight") then
        local highlightClone = highlight:Clone()
        highlightClone.Adornee = player.Character
        highlightClone.Parent = player.Character:FindFirstChild("HumanoidRootPart")
        highlightClone.Name = "Highlight"
    end
end)

game.Players.PlayerRemoving:Connect(function(playerRemoved)
    playerRemoved.Character:FindFirstChild("HumanoidRootPart").Highlight:Destroy()
end)

RunService.Heartbeat:Connect(function()
    for i, v in pairs(Players) do
        repeat wait() until v.Character
        if not v.Character:FindFirstChild("HumanoidRootPart"):FindFirstChild("Highlight") then
            local highlightClone = highlight:Clone()
            highlightClone.Adornee = v.Character
            highlightClone.Parent = v.Character:FindFirstChild("HumanoidRootPart")
            highlightClone.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop
            highlightClone.Name = "Highlight"
            task.wait()
        end
end
end)
end
})

--settings

local Tab = Window:MakeTab({
	Name = "All you want",
	Icon = "rbxassetid://7743875263",
	PremiumOnly = false
})

Tab:AddButton({
	Name = "Destroy ui [RIP]",
	Callback = function()
      		OrionLib:Destroy()
  	end    
})


Tab:AddButton({
	Name = "I hate myself [RIP]",
	Callback = function()
      		game:GetService("Players").LocalPlayer:Kick("Anti Cheat!!")
  	end    
})

Tab:AddButton({
	Name = "Fly gui",
	Callback = function()
      		loadstring(game:HttpGet(('https://raw.githubusercontent.com/Kahack999/ka/main/fly%20ui.txt'),true))()
  	end    
})

Tab:AddToggle({
	Name = "White Screen",
	Default = false,
	Callback = function(Value)
_G.White_Screen = Value
if _G.White_Screen then
    game:GetService("RunService"):Set3dRenderingEnabled(false)
else
    game:GetService("RunService"):Set3dRenderingEnabled(true)
end
end
})

Tab:AddToggle({
	Name = "Fruity No Damage When You In Water",
	Default = false,
	Callback = function(Value)
    _G.no_dmg_f = Value
    while _G.no_dmg_f do wait()
    game.Players.LocalPlayer.Data.Stats.Current_DevilFruit.Value = "None"
    end
end
})
--ออโต้สกิว
local Tab = Window:MakeTab({
	Name = "Auto Skills",
	Icon = "rbxassetid://7743875263",
	PremiumOnly = false
})


Tab:AddToggle({
	Name = "E",
	Default = false,
	Callback = function(Value)
		_G.E = Value
		while _G.E do wait()
		game:service('VirtualInputManager'):SendKeyEvent(true, "E", false, game)
		end
	end    
})

Tab:AddToggle({
	Name = "T",
	Default = false,
	Callback = function(Value)
		_G.T = Value
		while _G.T do wait()
		game:service('VirtualInputManager'):SendKeyEvent(true, "T", false, game)
		end
	end    
})

Tab:AddToggle({
	Name = "R",
	Default = false,
	Callback = function(Value)
		_G.R = Value
		while _G.R do wait()
		game:service('VirtualInputManager'):SendKeyEvent(true, "R", false, game)
		end
	end    
})

Tab:AddToggle({
	Name = "F",
	Default = false,
	Callback = function(Value)
	_G.F = Value
	while _G.F do wait()
		game:service('VirtualInputManager'):SendKeyEvent(true, "F", false, game)
		end
	end    
})

---credit//isme

local Main = Window:MakeTab({
        Name = "Credit",
        Icon = "rbxassetid://7734086558",
        PremiumOnly = false
    })
    
local Section =
    Main:AddSection(
    {
        Name = "YOUTUBE KaGa V"
    }
)

local Section =
    Main:AddSection(
    {
        Name = "Facebook ครับ ดี วัด"
    }
)

OrionLib:Init()
end### Hi there 👋

<!--
**NANORANK/NANORANK** is a ✨ _special_ ✨ repository because its `README.md` (this file) appears on your GitHub profile.

Here are some ideas to get you started:

- 🔭 I’m currently working on ...
- 🌱 I’m currently learning ...
- 👯 I’m looking to collaborate on ...
- 🤔 I’m looking for help with ...
- 💬 Ask me about ...
- 📫 How to reach me: ...
- 😄 Pronouns: ...
- ⚡ Fun fact: ...
-->
