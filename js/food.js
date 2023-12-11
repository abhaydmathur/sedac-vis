
ctx.scenarios = ["A1Fl", "A2a", "A2b", "A2c", "B1a", "B2a", "B2b"]

function createFoodViz(fooddata) {
    divScenarios = d3.select("#svgScenarios")

    for (var i = 0; i < scenarios.length; i++) {
        divScenarios.append("button")
            .attr("id", "button" + i)
            .text(ctx.scenarios[i])
            .on("click", function () {
                // Handle button click event if needed
                console.log("Button clicked:", this.id);
            });
    }
}