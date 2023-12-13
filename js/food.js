
ctx.scenarios = ["A1Fl", "A2a", "A2b", "A2c", "B1a", "B2a", "B2b"]


function createFoodViz(fooddata) {
    let divScenarios = d3.select("#svgScenarios")
    let divFood = d3.select("#svgFood")

    let wheat = divFood.selectAll('image')
                       .data(fooddata.filter(d => d.Crop == 'Wheat'))
                       .enter()
                       .append('image')
                       .attr("transform", (d) =>`translate(${d.year},${d.Production})`)
                       .attr("id", (d) => `wheat-${d.Country}-${d.year}`)
                       .attr("width", 8)
                       .attr("height", 8)
                       .attr("xlink:href", "icons.wheat_icon.png")

    for (var i = 0; i < ctx.scenarios.length; i++) {
        divScenarios.append("button")
            .attr("id", ctx.scenarios[i])
            .attr("width", 100)
            .attr("height",20)
            .text(ctx.scenarios[i])
            .style("left", 5) // Set the left position
            .style("top", (15*i))  // Set the top position
            .style('opacity', 1)
            //.style("background-color", "red")
            .on("click", function () {
                // Handle button click event if needed
                console.log("Button clicked:", this.id);
            });
    }
}