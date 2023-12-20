
ctx.scenarios = ["A1F", "A2a", "A2b", "A2c", "B1a", "B2a", "B2b"]
ctx.border = 60
ctx.bheight = ctx.height / 20
ctx.bwidth = ctx.width / 20
ctx.country = 'France'

function createFoodViz(fooddata) {
    let divScenarios = d3.select("#divFood")
    let divFood = d3.select("#svgFood")
    
    // create the groups
    let wheat = divFood.append('g').attr('id', 'wheat')
    let rice = divFood.append('g').attr('id', 'rice')
    let maize = divFood.append('g').attr('id', 'maize')

    // add x and y default scales
    xscale = d3.scaleLinear().domain([1990., 2090.]).range([ 0, ctx.width*0.70])
    yscale = d3.scaleLinear().domain([d3.max(fooddata, function(d){return d.Production;}), 0])
    .range([0, (ctx.height*0.9 - ctx.border)])

    divFood.append('g')
    .attr("class", "x-axis")
    .attr("transform", "translate(" +ctx.border*1.5 + "," + ctx.height*0.9 + ")")
    .call(d3.axisBottom(xscale));
    divFood.append('g')
    .attr("class", "y-axis")
    .attr("transform", "translate(" +ctx.border*1.5 + ", " + ctx.border + ")")
    .call(d3.axisLeft(yscale))

    // Add x and y legends
    divFood.append('text')
    .attr("class", "x-axis-label")
    .text('Year')
    .attr('x', ctx.width/2 - ctx.width/20)
    .attr('y', ctx.height - ctx.border/3)
    divFood.append('text')
    .attr('class', 'y-axis-label')
    .text('Crop production ( t )')
    .attr('x', - ctx.width/2 + ctx.width/20)
    .attr('y',ctx.border/3)
    .attr('transform','rotate(-90)')

    // Add Title
    divFood.append('text')
    .attr("class", "Title")
    .text(`Crop production prediction in ${ctx.country}`)
    .attr('x', ctx.width/2 - ctx.width/20)
    .attr('y',ctx.border/2)
    .style('text-anchor', 'middle')
    .style('font-size', 20)

    divScenarios.append('text')
    .attr("class", "Title")
    .text(`IPCC Scenarios`)
    .style("position", "absolute")
    .attr('x', ctx.width - ctx.width/10)
    .attr('y',ctx.border)
    .style('text-anchor', 'middle')
    .style('font-size', 20)


    loadCountryData(ctx.country, fooddata, wheat, rice, maize, false)

    // Creates the buttons
    for (var i = 0; i < ctx.scenarios.length; i++) {
        divScenarios.append("button")
            .attr("id", ctx.scenarios[i])
            .attr("width", ctx.bwidth)
            .attr("height", ctx.bheight)
            .text(ctx.scenarios[i])
            .style("position", "absolute")
            .style("left", (ctx.width - ctx.width/10) + "px") // Set the left position
            .style("top", (ctx.bwidth * (i+2)) + "px")  // Set the top position
            .raise()
            .on("click", function () {
                showScenarios(this.id);
            });}
}

function loadCountryData(country, fooddata, wheat, rice, maize, animate){

    let divFood = d3.select("#svgFood")
    let countrydata = fooddata.filter((d) => d.Country === country)

    // update the scale
    let max = d3.max(countrydata, function(d){return parseFloat(d.Production);})
    console.log(max)
    yscale.domain([max, -max/20])
    divFood.select(".y-axis").transition().call(d3.axisLeft(yscale))

    // Creates wheat data
    wheat.selectAll('image')
        .data(countrydata.filter(d => d.Crop === 'Wheat'))
        .join(
            enter => (
                enter.append("image")
                .attr("transform", (d) =>`translate(${xscale(d.Year)+ctx.border},${yscale(d.Production)+ctx.border})`)
                .attr("id", (d) => `wheat-${d.Country}-${d.Year}`)
                .attr("width", 20)
                .attr("height", 20)
                .attr("xlink:href", "wheat_icon.png")
                .attr('scenario', (d)=> d.Scenario)),
            update => (
                update.call(update => update.transition()
                        .duration((animate) ? 10 : 0)
                        .attr((d) =>`translate(${xscale(d.Year)+ctx.border},${yscale(d.Production)+ctx.border})`))),
            exit => (exit.remove()));
    
    // Creates rice data
    rice.selectAll('image')
        .data(countrydata.filter(d => d.Crop === 'Rice'))
        .join(
            enter => (
                enter.append("image")
                .attr("transform", (d) =>`translate(${xscale(d.Year)+ctx.border},${yscale(d.Production) + ctx.border})`)
                .attr("id", (d) => `rice-${d.Country}-${d.Year}`)
                .attr("width", 20)
                .attr("height", 20)
                .attr("xlink:href", "rice_icon.png")
                .attr('scenario', (d)=> d.Scenario))),
            update => (
                update.call(update => update.transition()
                        .duration((animate) ? 10 : 0)
                        .attr((d) =>`translate(${xscale(d.Year)+ctx.border},${yscale(d.Production) + ctx.border})`))),
            exit => (exit.remove());

    // Creates maize data
    maize.selectAll('image')
        .data(countrydata.filter(d => d.Crop === 'Maize'))
        .join(
            enter => (
                enter.append("image")
                .attr("transform", (d) =>`translate(${xscale(d.Year)+ctx.border},${yscale(d.Production)+ctx.border})`)
                .attr("id", (d) => `maize-${d.Country}-${d.Year}`)
                .attr("width", 20)
                .attr("height", 20)
                .attr("xlink:href", "corn_icon.png")
                .attr('scenario', (d)=> d.Scenario)),
            update => (
                update.call(update => update.transition()
                        .duration((animate) ? 10 : 0)
                        .attr((d) =>`translate(${xscale(d.Year)+ctx.border},${yscale(d.Production)+ctx.border})`))),
            exit => (exit.remove()));
}

function showScenarios(scenario){
    wheat = d3.select('#wheat')
    rice = d3.select('#rice')
    maize = d3.select('#maize')

    // Makes other scenarios dissapear
    for (var i = 0; i < ctx.scenarios.length; i++){
        if (ctx.scenarios[i]!==scenario) {
            maize.selectAll('image[scenario="' + ctx.scenarios[i] + '"]')
            .style('opacity', 0.2).attr("width", 10).attr("height", 10)
            wheat.selectAll('image[scenario="' + ctx.scenarios[i] + '"]')
            .style('opacity', 0.2).attr("width", 10).attr("height", 10)
            rice.selectAll('image[scenario="' + ctx.scenarios[i] + '"]')
            .style('opacity', 0.2).attr("width", 10).attr("height", 10)
        }
    // Resets current scenario
        if (ctx.scenarios[i] ==scenario) {
            maize.selectAll('image[scenario="' + ctx.scenarios[i] + '"]')
            .style('opacity', 1).attr("width", 20).attr("height", 20)
            wheat.selectAll('image[scenario="' + ctx.scenarios[i] + '"]')
            .style('opacity', 1).attr("width", 20).attr("height", 20)
            rice.selectAll('image[scenario="' + ctx.scenarios[i] + '"]')
            .style('opacity', 1).attr("width", 20).attr("height", 20)}
    }
}