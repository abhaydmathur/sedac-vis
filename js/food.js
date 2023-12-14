
ctx.scenarios = ["A1Fl", "A2a", "A2b", "A2c", "B1a", "B2a", "B2b"]
ctx.border = 60
ctx.wheat = []
ctx.rice = []
ctx.maize = []


function createFoodViz(fooddata) {
    let divScenarios = d3.select("#svgScenarios")
    let divFood = d3.select("#svgFood")
    
    // create the groups
    let wheat = divFood.append('g').attr('id', 'wheat')
    let rice = divFood.append('g').attr('id', 'rice')
    let maize = divFood.append('g').attr('id', 'maize')

    // add x and y default scales
    xscale = d3.scaleLinear().domain([1990., 2090.]).range([ 0, ctx.width*0.65])
    yscale = d3.scaleLinear().domain([d3.max(fooddata, function(d){return d.Production;}), 0])
    .range([0, (ctx.height*0.9 - ctx.border)])

    divFood.append('g')
    .attr("class", "x-axis")
    .attr("transform", "translate(" +ctx.border + "," + ctx.height*0.9 + ")")
    .call(d3.axisBottom(xscale));
    divFood.append('g')
    .attr("class", "y-axis")
    .attr("transform", "translate(" +ctx.border + ", " + ctx.border + ")")
    .call(d3.axisLeft(yscale))

    //VisualiseAll(fooddata,'', divFood)
    //loadFoodData(fooddata)

    for (var i = 0; i < ctx.scenarios.length; i++) {
        divScenarios.append("button")
            .attr("id", ctx.scenarios[i])
            .attr("width", 100)
            .attr("height",20)
            .text(ctx.scenarios[i])
            .style("left", 5) // Set the left position
            .style("top", (15*i))  // Set the top position
            .style('opacity', 1)
            .raise()
            //.style("background-color", "red")
            .on("click", function () {
                // Handle button click event if needed
                console.log("Button clicked:", this.id);
            });
    }
    loadCountryData('France', fooddata, wheat, rice, maize, false)
}

function loadFoodData(fooddata){
    ctx.wheat = []
    ctx.rice = []
    ctx.maize = []
    fooddata.forEach(function(d){
        // filter on altitude and the append to the array
        if (d.Crop == 'Wheat'){
        ctx.wheat.push({id:`wheat-${d.Country}-${d.Year}`,
                        country: d.Country,
                        year: d.Year,
                        scenario: d.Scenario,
                        production: d.Production})}
        if (d.Crop == 'Rice'){
        ctx.rice.push({id:`rice-${d.Country}-${d.Year}`,
                        country: d.Country,
                        year: d.Year,
                        scenario: d.Scenario,
                        production: d.Production})}
        if (d.Crop == 'Maize'){
        ctx.maize.push({id:`maize-${d.Country}-${d.Year}`,
                        country: d.Country,
                        year: d.Year,
                        scenario: d.Scenario,
                        production: d.Production})}
})}

function loadCountryData(country, fooddata, wheat, rice, maize, animate){
    let divFood = d3.select("#svgFood")

    let countrydata = fooddata.filter((d) => d.Country === country)
    console.log(countrydata)

    // update the scale
    yscale.domain([d3.max(countrydata, function(d){return d.Production;}), 0])
    divFood.select(".y-axis").transition().call(d3.axisLeft(yscale))

    wheat.selectAll('image')
        .data(countrydata.filter(d => d.Crop === 'Wheat'))
        .join(
            enter => (
                enter.append("image")
                .attr("transform", (d) =>`translate(${xscale(d.Year)+ctx.border},${yscale(d.Production)+ctx.border})`)
                .attr("id", (d) => `wheat-${d.Country}-${d.Year}`)
                .attr("width", 10)
                .attr("height", 10)
                .attr("xlink:href", "wheat_icon.png")),
            update => (
                update.call(update => update.transition()
                        .duration((animate) ? 10 : 0)
                        .attr((d) =>`translate(${xscale(d.Year)+ctx.border},${yscale(d.Production)+ctx.border})`))),
            exit => (exit.remove()));

    rice.selectAll('image')
        .data(countrydata.filter(d => d.Crop === 'Rice'))
        .join(
            enter => (
                enter.append("image")
                .attr("transform", (d) =>`translate(${xscale(d.Year)+ctx.border},${yscale(d.Production)+ctx.border})`)
                .attr("id", (d) => `rice-${d.Country}-${d.Year}`)
                .attr("width", 10)
                .attr("height", 10)
                .attr("xlink:href", "rice_icon.png")),
            update => (
                update.call(update => update.transition()
                        .duration((animate) ? 10 : 0)
                        .attr((d) =>`translate(${xscale(d.Year)+ctx.border},${yscale(d.Production)+ctx.border})`))),
            exit => (exit.remove()));

    maize.selectAll('image')
        .data(countrydata.filter(d => d.Crop === 'Maize'))
        .join(
            enter => (
                enter.append("image")
                .attr("transform", (d) =>`translate(${xscale(d.Year)+ctx.border},${yscale(d.Production)+ctx.border})`)
                .attr("id", (d) => `maize-${d.Country}-${d.Year}`)
                .attr("width", 10)
                .attr("height", 10)
                .attr("xlink:href", "corn_icon.png")),
            update => (
                update.call(update => update.transition()
                        .duration((animate) ? 10 : 0)
                        .attr((d) =>`translate(${xscale(d.Year)+ctx.border},${yscale(d.Production)+ctx.border})`))),
            exit => (exit.remove()));
}