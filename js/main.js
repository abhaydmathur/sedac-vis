let ctx = {
    data: null,
    globew: 500,
    globeh: 500,
    width: window.innerWidth / 2,
    height: window.innerHeight / 2,
    sensitivity: 75,
    svg: null,
    dflag: 0,
};

function createViz() {
    loadData() 
    
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Globe
    var gGlobe = d3.select("#main")
        .append("div")
        .attr("width", width / 2)
        .attr("height", height / 2)
        .attr("id", "divGlobe")
        .style("position", "absolute")
        .style("top", 0 + "px")
        .style("left", 0 + "px");

    var svgGlobe = gGlobe.append("svg")
        .attr("width", width / 2)
        .attr("height", height / 2)
        .attr("id", "svgGlobe")
        .style("background-color", "#f00");

    // EPI
    var gEpi = d3.select("#main")
        .append("div")
        .attr("width", width / 2)
        .attr("height", height / 2)
        .attr("id", "gEpi")
        .style("position", "absolute")
        .style("top", 0 + "px")
        .style("left", width / 2 + "px");

    var svgEpi = gEpi.append("svg")
        .attr("width", width / 2)
        .attr("height", height / 2)
        .attr("id", "svgEpi")
        .style("background-color", "#0f0");

    // Emissions
    var gEmissions = d3.select("#main")
        .append("div")
        .attr("width", width / 2)
        .attr("height", height / 2)
        .attr("id", "gEmissions")
        .style("position", "absolute")
        .style("top", height / 2 + "px")
        .style("left", 0 + "px");

    var svgEmissions = gEmissions.append("svg")
        .attr("width", width / 2)
        .attr("height", height / 2)
        .attr("id", "svgEmissions")
        .style("background-color", "#00f");

    // Food
    var gFood = d3.select("#main")
        .append("div")
        .attr("width", width / 2)
        .attr("height", height / 2)
        .attr("id", "gFood")
        .style("position", "absolute")
        .style("top", height / 2 + "px")
        .style("left", width / 2 + "px");

    var svgFood = gFood.append("svg")
        .attr("width", width / 2)
        .attr("height", height / 2)
        .attr("id", "svgFood")
        .style("background-color", "#ff0");

    createGlobeViz()
    createEpiViz()
    createEmissionsViz()
    createFoodViz()
}

function loadData() {
    // TODO
}