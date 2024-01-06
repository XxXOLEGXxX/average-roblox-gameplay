var layoutInfo = {
    startTab: "none",
    startNavTab: "tree-tab",
	showTree: true,

    treeLayout: ""

    
}


// A "ghost" layer which offsets other layers in the tree
addNode("blank", {
    layerShown: "ghost",
}, 
)


addLayer("tree-tab", {
    update(diff){
        player.ArtificialLag[0]=player.ArtificialLag[0].add(diff)
        if(player.ArtificialLag[0].gte(fpsReal())&&new Decimal(Math.random()).lte(fpsChance())){
            player.ArtificialLag[0]=new Decimal(0)
            player.ArtificialLag[1]=false
        }
    },
    tabFormat: [["tree", function() {return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS)}]],
    previousTab: "",
    leftTab: true,
})