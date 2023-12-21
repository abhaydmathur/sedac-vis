

function createEpiViz(cdaData, pmdData, recData, tclData, gdpdata) {

    // TODO: - REMOVE
    // ctx_globe.selectedCountry = 'France'
    ctx.selectedYear = ctx_em.year

    let divEpi = d3.select("#divEpi")

    var divCDA = divEpi
        .append("div")
        .attr("width", ctx.width / 2)
        .attr("height", ctx.height / 2)
        .attr("id", "divCDA")
        .style("position", "absolute")
        .style("top", 0 + "px")
        .style("left", 0 + "px");

    var svgCDA = divCDA.append("svg")
        .attr("width", ctx.width / 2)
        .attr("height", ctx.height / 2)
        .attr("id", "svgCDA")

    var divTCL = divEpi
        .append("div")
        .attr("width", ctx.width / 2)
        .attr("height", ctx.height / 2)
        .attr("id", "divTCL")
        .style("position", "absolute")
        .style("top", 0 + "px")
        .style("left", ctx.width / 2 + "px");

    var svgTCL = divTCL.append("svg")
        .attr("width", ctx.width / 2)
        .attr("height", ctx.height / 2)
        .attr("id", "svgTCL")

    var divPMD = divEpi
        .append("div")
        .attr("width", ctx.width / 2)
        .attr("height", ctx.height / 2)
        .attr("id", "divPMD")
        .style("position", "absolute")
        .style("top", ctx.height / 2 + "px")
        .style("left", 0 + "px");

    var svgPMD = divPMD.append("svg")
        .attr("width", ctx.width / 2)
        .attr("height", ctx.height / 2)
        .attr("id", "svgPMD")

    var divREC = divEpi
        .append("div")
        .attr("width", ctx.width / 2)
        .attr("height", ctx.height / 2)
        .attr("id", "divREC")
        .style("position", "absolute")
        .style("top", ctx.height / 2 + "px")
        .style("left", ctx.width / 2 + "px");

    var svgREC = divREC.append("svg")
        .attr("width", ctx.width / 2)
        .attr("height", ctx.height / 2)
        .attr("id", "svgREC")

    createCDAViz(cdaData, gdpdata)
    createTCLViz(tclData, gdpdata)
    createPMDViz(pmdData, gdpdata)
    createRECViz(recData, gdpdata)
}

function createCDAViz(cdaData, gdpData) {
    let svg = d3.select("#svgCDA")

    for (let i = 0; i < cdaData.length; i++) {
        for (let j = 0; j < gdpData.length; j++) {
            if (cdaData[i].iso == gdpData[j].Code) {
                cdaData[i].gdp = gdpData[j][ctx.selectedYear.toString()]
            }
        }
    }

    svg.append('text')
        .style('font-size', '12px')
        .text('GDP per capita (USD thousand)')
        .attr('x', ctx.width / 4 - ctx.width / 10)
        .attr('y', ctx.height / 2 - 5)
        .attr("fill", "white")

    svg.append('text')
        .style('font-size', '12px')
        .text('CO2 growth rate')
        .attr('transform', 'rotate(-90)')
        .attr('x', - ctx.width / 4 + ctx.width / 40)
        .attr('y', 10)
        .attr("fill", "white")

    xscale = d3.scaleLinear().domain([0, 120]).range([0, ctx.width / 2 - 60])
    yscale = d3.scaleLinear().domain([100, 0]).range([0, ctx.height / 2 - 60])

    svg.append('g')
        .attr("class", "x-axis")
        .attr("transform", "translate(" + 40 + "," + (ctx.height / 2 - 33) + ")")
        .call(d3.axisBottom(xscale));

    svg.append('g')
        .attr("class", "y-axis")
        .attr("transform", "translate(" + 40 + ", " + 27 + ")")
        .call(d3.axisLeft(yscale))

    svg.selectAll('circle')
        .data(cdaData.filter(d => {
            return d['CDA.ind.' + ctx.selectedYear] != -8888
                && d['CDA.ind.' + ctx.selectedYear] != null
                && d.gdp != ""
                && d.gdp != "0"
                && d.gdp != null
        }))
        .join(
            enter => (
                enter.append("circle")
                    .attr("cx", function (d, i) { return xscale(parseFloat(d.gdp) / 1000) + 40; })
                    .attr("cy", function (d, i) { return yscale(d['CDA.ind.' + ctx.selectedYear]) + 27 })
                    .attr("r", 3)
                    .attr("stroke", function (d, i) { return d.country == ctx_globe.selectedCountry ? "red" : "#dbb867" })
                    .attr("fill", "none")
                    .attr("stroke-width", 1)))
                    .append("title")
                    .text((d) => (d.country)),
        update => (
            update.call(update => update.transition()
                .duration((true) ? 10 : 0)))
            .attr("stroke", function (d, i) { return d.country == ctx_globe.selectedCountry ? "red" : "#dbb867" })
            .attr("cx", function (d, i) { return xscale(parseFloat(d.gdp) / 1000) + 40; })
            .attr("cy", function (d, i) { return yscale(d['CDA.ind.' + ctx.selectedYear]) + 27 }),
        exit => (exit.remove())
}

function createTCLViz(tclData, gdpData) {
    let svg = d3.select("#svgTCL")

    for (let i = 0; i < tclData.length; i++) {
        for (let j = 0; j < gdpData.length; j++) {
            if (tclData[i].iso == gdpData[j].Code) {
                tclData[i].gdp = gdpData[j][ctx.selectedYear.toString()]
            }
        }
    }

    svg.append('text')
        .style('font-size', '12px')
        .text('GDP per capita (USD thousand)')
        .attr('x', ctx.width / 4 - ctx.width / 10)
        .attr('y', ctx.height / 2 - 5)
        .attr("fill", "white")

    svg.append('text')
        .style('font-size', '12px')
        .text('Tree Cover Loss')
        .attr('x', - ctx.width / 4 + ctx.width / 40)
        .attr('y', 10)
        .attr('transform', 'rotate(-90)')
        .attr("fill", "white")

    xscale = d3.scaleLinear().domain([0, 120]).range([0, ctx.width / 2 - 60])
    yscale = d3.scaleLinear().domain([100, 0]).range([0, ctx.height / 2 - 60])

    svg.append('g')
        .attr("class", "x-axis")
        .attr("transform", "translate(" + 40 + "," + (ctx.height / 2 - 33) + ")")
        .call(d3.axisBottom(xscale));

    svg.append('g')
        .attr("class", "y-axis")
        .attr("transform", "translate(" + 40 + ", " + 27 + ")")
        .call(d3.axisLeft(yscale))

    svg.selectAll('circle')
        .data(tclData.filter(d => {
            return d['TCL.ind.' + ctx.selectedYear] != -8888
                && d['TCL.ind.' + ctx.selectedYear] != null
                && d.gdp != ""
                && d.gdp != "0"
                && d.gdp != null
        }))
        .join(
            enter => (
                enter.append("circle")
                    .attr("cx", function (d, i) { return xscale(parseFloat(d.gdp) / 1000) + 40; })
                    .attr("cy", function (d, i) { return yscale(d['TCL.ind.' + ctx.selectedYear]) + 27 })
                    .attr("r", 3)
                    .attr("stroke", function (d, i) { return d.country == ctx_globe.selectedCountry ? "red" : "green" })
                    .attr("fill", "none")
                    .attr("stroke-width", 1)))
                    .append("title")
                    .text((d) => (d.country)),
        update => (
            update.call(update => update.transition()
                .duration((true) ? 10 : 0)))
            .attr("stroke", function (d, i) { return d.country == ctx_globe.selectedCountry ? "red" : "green" })
            .attr("cx", function (d, i) { return xscale(parseFloat(d.gdp) / 1000) + 40; })
            .attr("cy", function (d, i) { return yscale(d['TCL.ind.' + ctx.selectedYear]) + 27 }),
        exit => (exit.remove())
}

function createPMDViz(pmdData, gdpData) {
    let svg = d3.select("#svgPMD")

    for (let i = 0; i < pmdData.length; i++) {
        for (let j = 0; j < gdpData.length; j++) {
            if (pmdData[i].iso == gdpData[j].Code) {
                pmdData[i].gdp = gdpData[j][ctx.selectedYear.toString()]
            }
        }
    }

    svg.append('text')
        .style('font-size', '12px')
        .text('GDP per capita (USD thousand)')
        .attr('x', ctx.width / 4 - ctx.width / 10)
        .attr('y', ctx.height / 2 - 5)
        .attr("fill", "white")

    svg.append('text')
        .style('font-size', '12px')
        .text('Ambient particulate matter pollution')
        .attr('x', - ctx.width / 4 - 30)
        .attr('y', 10)
        .attr('transform', 'rotate(-90)')
        .attr("fill", "white")

    xscale = d3.scaleLinear().domain([0, 120]).range([0, ctx.width / 2 - 60])
    yscale = d3.scaleLinear().domain([100, 0]).range([0, ctx.height / 2 - 60])

    svg.append('g')
        .attr("class", "x-axis")
        .attr("transform", "translate(" + 40 + "," + (ctx.height / 2 - 33) + ")")
        .call(d3.axisBottom(xscale));

    svg.append('g')
        .attr("class", "y-axis")
        .attr("transform", "translate(" + 40 + ", " + 27 + ")")
        .call(d3.axisLeft(yscale))

    svg.selectAll('circle')
        .data(pmdData.filter(d => {
            return d['PMD.ind.' + ctx.selectedYear] != -8888
                && d['PMD.ind.' + ctx.selectedYear] != null
                && d.gdp != ""
                && d.gdp != "0"
                && d.gdp != null
        }))
        .join(
            enter => (
                enter.append("circle")
                    .attr("cx", function (d, i) { return xscale(parseFloat(d.gdp) / 1000) + 40; })
                    .attr("cy", function (d, i) { return yscale(d['PMD.ind.' + ctx.selectedYear]) + 27 })
                    .attr("r", 3)
                    .attr("stroke", function (d, i) { return d.country == ctx_globe.selectedCountry ? "red" : "#593434" })
                    .attr("fill", "none")
                    .attr("stroke-width", 1)))
                    .append("title")
                    .text((d) => (d.country)),
        update => (
            update.call(update => update.transition()
                .duration((true) ? 10 : 0)))
            .attr("stroke", function (d, i) { return d.country == ctx_globe.selectedCountry ? "red" : "#593434" })
            .attr("cx", function (d, i) { return xscale(parseFloat(d.gdp) / 1000) + 40; })
            .attr("cy", function (d, i) { return yscale(d['PMD.ind.' + ctx.selectedYear]) + 27 }),
        exit => (exit.remove())
}

function createRECViz(recData, gdpData) {
    let svg = d3.select("#svgREC")

    for (let i = 0; i < recData.length; i++) {
        for (let j = 0; j < gdpData.length; j++) {
            if (recData[i].iso == gdpData[j].Code) {
                recData[i].gdp = gdpData[j][ctx.selectedYear.toString()]
            }
        }
    }

    svg.append('text')
        .style('font-size', '12px')
        .text('GDP per capita (USD thousand)')
        .attr('x', ctx.width / 4 - ctx.width / 10)
        .attr('y', ctx.height / 2 - 5)
        .attr("fill", "white")

    svg.append('text')
        .style('font-size', '12px')
        .text('Recycling Rates')
        .attr('x', - ctx.width / 4 + ctx.width / 40)
        .attr('y', 10)
        .attr('transform', 'rotate(-90)')
        .attr("fill", "white")

    xscale = d3.scaleLinear().domain([0, 120]).range([0, ctx.width / 2 - 60])
    yscale = d3.scaleLinear().domain([100, 0]).range([0, ctx.height / 2 - 60])

    svg.append('g')
        .attr("class", "x-axis")
        .attr("transform", "translate(" + 40 + "," + (ctx.height / 2 - 33) + ")")
        .call(d3.axisBottom(xscale));

    svg.append('g')
        .attr("class", "y-axis")
        .attr("transform", "translate(" + 40 + ", " + 27 + ")")
        .call(d3.axisLeft(yscale))

    svg.selectAll('circle')
        .data(recData.filter(d => {
            return d['REC.ind.' + ctx.selectedYear] != -8888
                && d['REC.ind.' + ctx.selectedYear] != null
                && d.gdp != ""
                && d.gdp != "0"
                && d.gdp != null
        }))
        .join(
            enter => (
                enter.append("circle")
                    .attr("cx", function (d, i) { return xscale(parseFloat(d.gdp) / 1000) + 40; })
                    .attr("cy", function (d, i) { return yscale(d['REC.ind.' + ctx.selectedYear]) + 27 })
                    .attr("r", 3)
                    .attr("stroke", function (d, i) { return d.country == ctx_globe.selectedCountry ? "red" : "gray" })
                    .attr("fill", "none")
                    .attr("stroke-width", 1)))
                    .append("title")
                    .text((d) => (d.country)),
        update => (
            update.call(update => update.transition()
                .duration((true) ? 10 : 0)))
            .attr("stroke", function (d, i) { return d.country == ctx_globe.selectedCountry ? "red" : "gray" })
            .attr("cx", function (d, i) { return xscale(parseFloat(d.gdp) / 1000) + 40; })
            .attr("cy", function (d, i) { return yscale(d['REC.ind.' + ctx.selectedYear]) + 27 }),
        exit => (exit.remove())
}

