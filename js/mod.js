let modInfo = {
	name: "7 FPS Simulator",
	id: "bobux7",
	author: "oleg",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "mmmmmm amd legacy laptop",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1: mmmmmm amd legacy laptop</h3><br>
		- Added three layers in total. (four if you count FPS layer)<br>
        - Removed AFK Incremental<br>
		- idk`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return hasUpgrade("m",11)
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1).mul(tmp.m.effect).mul(tmp.m.buyables[11].effect).mul(new Decimal(2.5).pow(player.r.milestones.length)).mul(fpsValue().gt(61)?fpsValue().div(60).pow(2):1).mul(hasAchievement("a",16)?tmp.fps.maxFPSEffect:1).mul(tmp.asc.effect)
	return gain
}

function fpsThing() {
    let fps = new Decimal(60).mul(tmp.fps.buyables[11].effect)
    let lagCalc = new Decimal(1.15).pow(player.m.buyables[11].add(player.m.buyables[12]).add(player.m.upgrades.length+player.r.upgrades.length+player.r.milestones.length+player.asc.milestones.length))
    let lagRender = new Decimal(1.15).sub(1).div(tmp.fps.buyables[12].effect).add(1).pow(player.m.buyables[11].add(player.m.buyables[12]).add(player.m.upgrades.length+player.r.upgrades.length+player.r.milestones.length+player.asc.milestones.length))
    fps = fps.div(lagCalc).root(lagRender)
    return fps
}

function fpsValue() {
    return fpsThing().min(hasAchievement("a",23)?Infinity:144).add(new Decimal(Math.sin(Math.random()/2.004)).div(new Decimal(60).div(fpsThing().min(hasAchievement("a",23)?Infinity:144))))
}

function fpsReal() {
    return new Decimal(1).div(fpsValue())
}

function fpsChance() {
    return new Decimal(1).div(60).mul(fpsValue())
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
    ArtificialLag: [new Decimal(0), true]
}}

// Display extra things at the top of the page
var displayThings = [
    function(){return fpsValue().gt(61)?"You have excessive amount of FPS, boosting your point gain by x"+format(fpsValue().div(60).pow(2)):undefined}
]

// Determines when the game "ends"
function isEndgame() {
	return hasAchievement("a",24)
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}