addLayer("m", {
    name: "multiplier", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "❌", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "rgb(255, 100, 100)",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "multipliers", // Name of prestige currency
    effect(){return player.m.points.add(1)},
    effectDescription(){return `boosting your point gain by x${format(this.effect())}`},
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1).mul(hasUpgrade("m",12)?3:1).mul(hasUpgrade("m",14)?tmp.m.upgrades[14].effect:1).mul(player.r.points.add(1)).mul(hasUpgrade("m",15)?tmp.m.upgrades[15].effect:1).mul(tmp.asc.effect).mul(tmp.m.buyables[12].effect)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for multipliers", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
	upgrades: {
		11: { 
			title: "The Beginning", 
			description: "Enable point generation",
			cost: new Decimal(1),
		},
		12: { 
			title: "2nd Prime Multiplier", 
			description: "3x Multiplier gain",
			cost: new Decimal(10),
            unlocked(){return hasUpgrade("m",11)}
		},
		13: { 
			title: "Extraordinary Buyable", 
			description: "Unlocks a Multiplier Buyable",
			cost: new Decimal(100),
            unlocked(){return hasUpgrade("m",12)}
		},
		14: { 
			title: "Multiplicational Shenanigans", 
			description: "Points boost Multiplier gain",
            effect(){return player.points.add(1).log(10).add(1)},
            effectDisplay(){return "x"+format(this.effect())},
			cost: new Decimal(10000),
            unlocked(){return hasUpgrade("m",13)}
		},
		15: { 
			title: "Counter-frame Measurement", 
			description: "You gain more multipliers based on your FPS",
            effect(){return new Decimal(60).div(fpsValue().min(60)).sqrt()},
            effectDisplay(){return "x"+format(this.effect())},
			cost: new Decimal(100000000),
            unlocked(){return hasUpgrade("m",14)}
		},
	},
    passiveGeneration(){
        return new Decimal(hasMilestone("r",1)?player.r.milestones.length/10:0)
    },
    buyables: {
        11: {
            title(){return "Point Booster<h5>(You have "+formatWhole(player.m.buyables[11])+" of them)"},
            effect(){return new Decimal(5).add(hasUpgrade("r",13)?1/9*5:0).pow(player.m.buyables[11])},
            cost(){return new Decimal(hasUpgrade("r",11)?1:10).mul(new Decimal(10).mul(player.m.buyables[11].add(1)).pow(player.m.buyables[11]))},
            canAfford(){return player.m.points.gte(this.cost())},
            buy(){
                player.m.points = player.m.points.sub(this.cost())
                player.m.buyables[11] = player.m.buyables[11].add(1)
            },
            display(){return "Boosts your point gain by x"+format(5+(hasUpgrade("r",13)?1/9*5:0))+" each<br>Total effect: x"+format(this.effect())+"<br>Cost: "+format(this.cost())+" multipliers"},
            unlocked(){return hasUpgrade("m",13)}
        },
        12: {
            title(){return "Multiplier Booster<h5>(You have "+formatWhole(player.m.buyables[12])+" of them)"},
            effect(){return hasUpgrade("r",14)?new Decimal(10).pow(player.m.buyables[12]):1},
            cost(){return new Decimal("1e10").pow(new Decimal(player.m.buyables[12].add(1)).pow(new Decimal(1.5).sub(hasMilestone("r",3)?new Decimal(player.r.milestones.length).div(100).mul(3):0)))}, 
            canAfford(){return player.m.points.gte(this.cost())},
            buy(){
                player.m.points = player.m.points.sub(this.cost())
                player.m.buyables[12] = player.m.buyables[12].add(1)
            },
            display(){return "Boosts your multiplier gain by x10 each<br>Total effect: x"+format(this.effect())+"<br>Cost: "+format(this.cost())+" multipliers"},
            unlocked(){return hasUpgrade("r",14)}
        },
    },
    layerShown(){return true},
    doReset(resettingLayer){
        let keepBuyables = player.m.buyables[11]
        let keepBuyables2 = player.m.buyables[12]
        let keepUpgrades = player.m.upgrades
        if(tmp[resettingLayer].row > this.row) layerDataReset("m")
        if(tmp[resettingLayer].layer=="asc"){
            player.m.upgrades = keepUpgrades
            player.m.buyables[11] = keepBuyables
            player.m.buyables[12] = keepBuyables2
        }
    }
})

addLayer("r", {
    name: "rebirth", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "rgb(100, 255, 255)",
    requires: new Decimal(1000000), // Can be a function that takes requirement increases into account
    resource: "rebirths", // Name of prestige currency
    effect(){return player.r.points.add(1)},
    effectDescription(){return `boosting your multiplier gain by x${format(this.effect())}`+(hasUpgrade("r", 12)?` and point gain by x${format(this.effect().root(3))}`:``)},
    baseResource: "multipliers", // Name of resource prestige is based on
    baseAmount() {return player.m.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.25, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1).mul(new Decimal(1.5).pow(hasMilestone("r",2)?player.r.milestones.length-2:0))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ["m"],
    hotkeys: [
        {key: "r", description: "R: Reset for rebirths", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
	upgrades: {
		11: { 
			title: "Third Time's A Charm", 
			description: "Point Booster is ten times cheaper",
			cost: new Decimal(3),
		},
		12: { 
			title: "The Beginning", 
			description: "Rebirths affect point gain with cube rooted effeciency",
			cost: new Decimal(90),
            unlocked(){return hasUpgrade("r",11)}
		},
		13: { 
			title: "honestly incredible", 
			description: "+0.555... Point Booster Base",
			cost: new Decimal(27000),
            unlocked(){return hasUpgrade("r",12)}
		},
		14: { 
			title: "The Beginning", 
			description: "Rebirths affect point gain with cube rooted effeciency",
			cost: new Decimal(810000000),
            unlocked(){return hasUpgrade("r",13)}
		},
		15: { 
			title: "Sacriligious Action", 
			description: "Your current Rebirths divides Ascension's requirement",
			cost: new Decimal(243000000000000000),
            unlocked(){return hasUpgrade("r",13)}
		},
	},
    milestones: {
        0: {
            requirementDescription(){return "1 Rebirth"},
            effectDescription(){return "You gain x2.5 more points per Rebirth milestone"},
            done(){return player.r.points.gte(1)}
        },
        1: {
            requirementDescription(){return "810 Rebirths"},
            effectDescription(){return "+10% multiplier gain per second per Rebirth milestone"},
            done(){return player.r.points.gte(810)}
        },
        2: {
            requirementDescription(){return "2,187,000 Rebirths"},
            effectDescription(){return "You gain x1.5 more Rebirths per Rebirth milestone, starting with this one"},
            done(){return player.r.points.gte(2187000)} 
        },
        3: {
            requirementDescription(){return "5.31 trillion Rebirths"},
            effectDescription(){return "-0.03 Multiplier Booster base cost scaling per Rebirth milestone"},
            done(){return player.r.points.gte(5314410000000)}
        },
        4: {
            requirementDescription(){return "10.46 septillion Rebirths"},
            effectDescription(){return "-0.03 Multiplier Booster base cost scaling per Rebirth milestone"},
            done(){return player.r.points.gte("1.046e25")}
        }
    },
    passiveGeneration(){
        return new Decimal(hasMilestone("asc",1)?0.01:0)
    },
    layerShown(){return hasUpgrade("m",13)||player.r.unlocked}
})

addLayer("asc", {
    name: "ascension", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "rgb(255, 255, 100)",
    requires(){return new Decimal("1e23").div(9).mul(2).div(hasUpgrade("r",15)?player.r.points.max(1):1)}, // Can be a function that takes requirement increases into account
    resource: "ascensions", // Name of prestige currency
    effect(){return new Decimal(2).pow(player.asc.points)},
    effectDescription(){return `boosting previous resources by x${format(this.effect())}`},
    baseResource: "multipliers", // Name of resource prestige is based on
    baseAmount() {return player.m.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2.82842712474619,
    base: 2.82842712474619,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ["m"],
    milestones: {
        0: {
            requirementDescription(){return "1 Ascension"},
            effectDescription(){return "You keep Multiplier upgrades and buyables on this reset and FPS doesn't reset Ascension"},
            done(){return player.asc.points.gte(1)}
        },
        1: {
            requirementDescription(){return "7 Ascension"},
            effectDescription(){return "You gain 1% of Rebirths per second"},
            done(){return player.asc.points.gte(7)}
        },
    },
    hotkeys: [
        {key: "a", description: "A: Reset for ascensions", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.m.buyables[11].gte(10)||player.asc.unlocked}
})

addLayer("fps", {
    name: "fps", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "FPS", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        bestFPS: new Decimal(0),
    }},
    canBuyMax(){return hasAchievement("a",14)},
    update(diff){
        if(fpsThing().gte(144)) player.fps.bestFPS = player.fps.bestFPS.max(player.m.buyables[11].add(player.m.buyables[12]).add(player.m.upgrades.length+player.r.upgrades.length+player.r.milestones.length+player.asc.milestones.length))
        if(fpsThing().lte(1) && player.fps.buyables[11].gte(10)&&player.fps.buyables[12].lte(0)) player.a.isItNow = true
    },
    color: "rgb(100, 255, 255)",
    requires: new Decimal(10000), // Can be a function that takes requirement increases into account
    resource: "spec perks", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.52, // Prestige currency exponent
    base: 1.52,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    maxFPSEffect() {
        return player.fps.bestFPS.add(1).pow(1.2)
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: "side", // Row the layer is in on the tree (0 is the first row)
    tabFormat: ["main-display","prestige-button","resource-display",["display-text", function(){return hasAchievement("a",16)?`You've undergone ${formatWhole(player.fps.bestFPS)} poor optimization sequences without losing a single FPS, boosting your point gain by x${format(tmp.fps.maxFPSEffect)}`:""}],"blank","buyables"],
    buyables: {
        11: {
            title(){return "Better Spec<h5>(You have "+formatWhole(player.fps.buyables[this.id])+" of them)"},
            effect(){return new Decimal(1.2).pow(player.fps.buyables[this.id])},
            cost(){return new Decimal(1)},
            canAfford(){return player.fps.points.gte(this.cost())},
            buy(){
                player.fps.points = player.fps.points.sub(1)
                player.fps.buyables[this.id] = player.fps.buyables[this.id].add(1)
            },
            canSellOne(){return player.fps.buyables[this.id].gte(1)},
            sellOne(){
                if(confirm("Are you sure you want to sell this perk? You'll lose your progress if you do so.")) {
                    player.fps.buyables[this.id] = player.fps.buyables[this.id].sub(1)
                    player.fps.points = player.fps.points.add(1)
                    layerDataReset("m")
                    layerDataReset("r")
                    player.points = new Decimal(10)
                }
            },
            display(){return "Boosts your initial FPS by 20% each<br>Total effect: "+format(this.effect().sub(1).mul(100))+"%<br>Cost: "+format(this.cost())+" spec perks"},
            unlocked(){return true},
        },
        12: {
            title(){return "Synergy Optimization<h5>(You have "+formatWhole(player.fps.buyables[this.id])+" of them)"},
            effect(){return new Decimal(1.2).pow(player.fps.buyables[this.id])},
            cost(){return new Decimal(1)},
            canAfford(){return player.fps.points.gte(this.cost())},
            buy(){
                player.fps.points = player.fps.points.sub(1)
                player.fps.buyables[this.id] = player.fps.buyables[this.id].add(1)
            },
            canSellOne(){return player.fps.buyables[this.id].gte(1)},
            sellOne(){
                if(confirm("Are you sure you want to sell this perk? You'll lose your progress if you do so.")) {
                    player.fps.buyables[this.id] = player.fps.buyables[this.id].sub(1)
                    player.fps.points = player.fps.points.add(1)
                    layerDataReset("m")
                    layerDataReset("r")
                    player.points = new Decimal(10)
                }
            },
            display(){return "Nerfs Rendering Base by 20% each<br>Total effect: /"+format(this.effect())+"<br>Cost: "+format(this.cost())+" spec perks"},
            unlocked(){return hasAchievement("a",14)}
        }
    },
    doReset(resettingLayer){
        if(tmp[resettingLayer].layer=="fps"){
            layerDataReset("m")
            layerDataReset("r")
        }
    },
    tooltip(){return formatWhole(player.fps.points)+"/"+formatWhole(player.fps.points.add(player.fps.buyables[11]).add(player.fps.buyables[12]))+" spec perks"},
    layerShown(){return fpsValue().lte(7)||player.fps.unlocked},
})

addLayer("a", {
    name: "achievements",
    symbol: "A",
    color: "yellow",
    row: "side",
    startData(){ return {
        isItNow: false
    }},
    tooltip(){return formatWhole(player.a.achievements.length)+" achievements"},
    tabFormat: ["blank","blank","achievements"],
    achievements: {
        11:{
            name: "W-What?",
            tooltip: "Start point generation",
            done(){return hasUpgrade("m",11)}
        },
        12:{
            name: "A new feature",
            tooltip: "Unlock Multiplier Buyable",
            done(){return hasUpgrade("m",13)}
        },
        13:{
            name: `"d-duh it's just you"<br><br><h5>[proceeds to get stuck mid-air]`,
            tooltip: "Reach <7 FPS<br>Reward: Unlocks FPS layer",
            done(){return fpsValue().lte(7)}
        },
        14:{
            name: "Not enough for beating Extreme Demons",
            tooltip: "Reach FPS Hardcap<br>Reward: Unlocks another spec perk and you can max buy spec perks",
            done(){return fpsValue().gte(144)}
        },
        15:{
            name: "Free... At last",
            tooltip: "Perform a Rebirth reset",
            done(){return player.r.unlocked} 
        },
        16:{
            name: "This game wasn't sponsored by MLP in any shape or form",
            tooltip: `Get a total of 12 spec perks<br>Reward: Unlocks "Best 144 FPS" boost`,
            done(){return player.fps.points.add(player.fps.buyables[11]).add(player.fps.buyables[12]).gte(12)} 
        },
        21:{
            name: "Peak Performance",
            tooltip: "Experience three lag sequences without losing a single FPS",
            done(){return player.fps.bestFPS.gte(3)} 
        },
        22:{
            name: "Divine Interference",
            tooltip: "Perform an Ascension reset",
            done(){return player.asc.points.gte(1)} 
        },
        23:{
            name: "No More.",
            tooltip: "Get a total of 60 spec perks<br>Reward: You are no longer restricted by FPS hardcap",
            done(){return player.fps.points.add(player.fps.buyables[11]).add(player.fps.buyables[12]).gte(60)} 
        },
        24:{
            name: "# ##### ####### #### ## #######",
            tooltip: "Reach 1 FPS or below with at least 10 Better Specs only<br>Reward: touching the grass",
            done(){return player.a.isItNow} 
        }
    },
    layerShown(){return true}
})