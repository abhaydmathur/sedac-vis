ctx_epi = {
	TRANSITION_DURATION: 0,
};

function createEpiViz(cdaData, pmdData, recData, tclData, gdpData) {
	let divEpi = d3.select("#divEpi");

	var divCDA = divEpi
		.append("div")
		.attr("width", ctx.width / 2)
		.attr("height", ctx.height / 2)
		.attr("id", "divCDA")
		.style("position", "absolute")
		.style("top", 0 + "px")
		.style("left", 0 + "px");

	var svgCDA = divCDA
		.append("svg")
		.attr("width", ctx.width / 2)
		.attr("height", ctx.height / 2)
		.attr("id", "svgCDA");

	var divTCL = divEpi
		.append("div")
		.attr("width", ctx.width / 2)
		.attr("height", ctx.height / 2)
		.attr("id", "divTCL")
		.style("position", "absolute")
		.style("top", 0 + "px")
		.style("left", ctx.width / 2 + "px");

	var svgTCL = divTCL
		.append("svg")
		.attr("width", ctx.width / 2)
		.attr("height", ctx.height / 2)
		.attr("id", "svgTCL");

	var divPMD = divEpi
		.append("div")
		.attr("width", ctx.width / 2)
		.attr("height", ctx.height / 2)
		.attr("id", "divPMD")
		.style("position", "absolute")
		.style("top", ctx.height / 2 + "px")
		.style("left", 0 + "px");

	var svgPMD = divPMD
		.append("svg")
		.attr("width", ctx.width / 2)
		.attr("height", ctx.height / 2)
		.attr("id", "svgPMD");

	var divREC = divEpi
		.append("div")
		.attr("width", ctx.width / 2)
		.attr("height", ctx.height / 2)
		.attr("id", "divREC")
		.style("position", "absolute")
		.style("top", ctx.height / 2 + "px")
		.style("left", ctx.width / 2 + "px");

	var svgREC = divREC
		.append("svg")
		.attr("width", ctx.width / 2)
		.attr("height", ctx.height / 2)
		.attr("id", "svgREC");

	ctx_epi.gdpData = gdpData;
	ctx_epi.cdaData = cdaData;
	ctx_epi.tclData = tclData;
	ctx_epi.pmdData = pmdData;
	ctx_epi.recData = recData;
	ctx_epi.xscale = d3
		.scaleLinear()
		.domain([0, 120])
		.range([0, ctx.width / 2 - 60]);
	ctx_epi.yscale = d3
		.scaleLinear()
		.domain([100, 0])
		.range([0, ctx.height / 2 - 60]);

	createEPIPlot(d3.select("#svgCDA"), "CO2 growth rate", "cda");
	createEPIPlot(d3.select("#svgTCL"), "Tree Cover Loss", "tcl");
	createEPIPlot(d3.select("#svgPMD"), "Ambient particulate matter pollution", "pmd");
	createEPIPlot(d3.select("#svgREC"), "Recycling Rates", "rec");

	updateEPIViz();
}

function createEPIPlot(svg, title) {
	svg.append("text")
		.style("font-size", "12px")
		.text("GDP per capita (USD thousand)")
		.attr("x", ctx.width / 4 - ctx.width / 10)
		.attr("y", ctx.height / 2 - 5)
		.attr("fill", "white");

	svg.append("text")
		.style("font-size", "12px")
		.text(title)
		.attr("x", -ctx.width / 4 + ctx.width / 40)
		.attr("y", 10)
		.attr("transform", "rotate(-90)")
		.attr("fill", "white");

	svg.append("g")
		.attr("class", "x-axis")
		.attr(
			"transform",
			"translate(" + 40 + "," + (ctx.height / 2 - 33) + ")"
		)
		.call(d3.axisBottom(ctx_epi.xscale));

	svg.append("g")
		.attr("class", "y-axis")
		.attr("transform", "translate(" + 40 + ", " + 27 + ")")
		.call(d3.axisLeft(ctx_epi.yscale));

	svg.selectAll(".x-axis path, .x-axis line").attr("stroke", "white");
	svg.selectAll(".y-axis path, .y-axis line").attr("stroke", "white");
}

function updateEPIViz() {
	gdpData = ctx_epi.gdpData;

	cdaData = ctx_epi.cdaData;
	for (let i = 0; i < cdaData.length; i++) {
		for (let j = 0; j < gdpData.length; j++) {
			if (cdaData[i].iso == gdpData[j].Code) {
				cdaData[i].gdp = gdpData[j][ctx_em.year_gdp.toString()];
			}
		}
	}

	d3.select("#svgCDA")
		.selectAll("circle")
		.data(
			cdaData.filter((d) => {
				return (
					d["CDA.ind." + ctx_em.year_gdp] != -8888 &&
					d["CDA.ind." + ctx_em.year_gdp] != null &&
					d.gdp != "" &&
					d.gdp != "0" &&
					d.gdp != null
				);
			})
		)
		.join(
			(enter) =>
				enter
					.append("circle")
					.attr("cx", function (d, i) {
						return ctx_epi.xscale(parseFloat(d.gdp) / 1000) + 40;
					})
					.attr("cy", function (d, i) {
						return (
							ctx_epi.yscale(d["CDA.ind." + ctx_em.year_gdp]) + 27
						);
					})
					.attr("r", 3)
					.attr("stroke", function (d, i) {
						return d.country == ctx_globe.selectedCountry
							? "red"
							: "#dbb867";
					})
					.attr("fill", "none")
					.attr("fill", function (d, i) {
						return d.country == ctx_globe.selectedCountry
							? "red"
							: "none";
					})
					.attr("stroke-width", 1)
					.append("title")
					.text((d) => d.country),
			(update) =>
				update.call((update) =>
					update
						.transition()
						.duration(ctx_epi.TRANSITION_DURATION)
						.attr("stroke", function (d, i) {
							return d.country == ctx_globe.selectedCountry
								? "red"
								: "#dbb867";
						})
						.attr("fill", function (d, i) {
							return d.country == ctx_globe.selectedCountry
								? "red"
								: "none";
						})
						.attr("cx", function (d, i) {
							return (
								ctx_epi.xscale(parseFloat(d.gdp) / 1000) + 40
							);
						})
						.attr("cy", function (d, i) {
							return (
								ctx_epi.yscale(
									d["CDA.ind." + ctx_em.year_gdp]
								) + 27
							);
						})
				),
			(exit) => exit.remove()
		);

	tclData = ctx_epi.tclData;
	for (let i = 0; i < tclData.length; i++) {
		for (let j = 0; j < gdpData.length; j++) {
			if (tclData[i].iso == gdpData[j].Code) {
				tclData[i].gdp = gdpData[j][ctx_em.year_gdp.toString()];
			}
		}
	}

	d3.select("#svgTCL")
		.selectAll("circle")
		.data(
			tclData.filter((d) => {
				return (
					d["TCL.ind." + ctx_em.year_gdp] != -8888 &&
					d["TCL.ind." + ctx_em.year_gdp] != null &&
					d.gdp != "" &&
					d.gdp != "0" &&
					d.gdp != null
				);
			})
		)
		.join(
			(enter) =>
				enter
					.append("circle")
					.attr("cx", function (d, i) {
						return ctx_epi.xscale(parseFloat(d.gdp) / 1000) + 40;
					})
					.attr("cy", function (d, i) {
						return (
							ctx_epi.yscale(d["TCL.ind." + ctx_em.year_gdp]) + 27
						);
					})
					.attr("r", 3)
					.attr("stroke", function (d, i) {
						return d.country == ctx_globe.selectedCountry
							? "red"
							: "green";
					})
					.attr("fill", "none")
					.attr("fill", function (d, i) {
						return d.country == ctx_globe.selectedCountry
							? "red"
							: "none";
					})
					.attr("stroke-width", 1)
					.append("title")
					.text((d) => d.country),
			(update) =>
				update.call((update) =>
					update
						.transition()
						.duration(ctx_epi.TRANSITION_DURATION)
						.attr("stroke", function (d, i) {
							return d.country == ctx_globe.selectedCountry
								? "red"
								: "green";
						})
						.attr("fill", function (d, i) {
							return d.country == ctx_globe.selectedCountry
								? "red"
								: "none";
						})
						.attr("cx", function (d, i) {
							return (
								ctx_epi.xscale(parseFloat(d.gdp) / 1000) + 40
							);
						})
						.attr("cy", function (d, i) {
							return (
								ctx_epi.yscale(
									d["TCL.ind." + ctx_em.year_gdp]
								) + 27
							);
						})
				),
			(exit) => exit.remove()
		);

	pmdData = ctx_epi.pmdData;
	for (let i = 0; i < pmdData.length; i++) {
		for (let j = 0; j < gdpData.length; j++) {
			if (pmdData[i].iso == gdpData[j].Code) {
				pmdData[i].gdp = gdpData[j][ctx_em.year_gdp.toString()];
			}
		}
	}

	d3.select("#svgPMD")
		.selectAll("circle")
		.data(
			pmdData.filter((d) => {
				return (
					d["PMD.ind." + ctx_em.year_gdp] != -8888 &&
					d["PMD.ind." + ctx_em.year_gdp] != null &&
					d.gdp != "" &&
					d.gdp != "0" &&
					d.gdp != null
				);
			})
		)
		.join(
			(enter) =>
				enter
					.append("circle")
					.attr("cx", function (d, i) {
						return ctx_epi.xscale(parseFloat(d.gdp) / 1000) + 40;
					})
					.attr("cy", function (d, i) {
						return (
							ctx_epi.yscale(d["PMD.ind." + ctx_em.year_gdp]) + 27
						);
					})
					.attr("r", 3)
					.attr("stroke", function (d, i) {
						return d.country == ctx_globe.selectedCountry
							? "red"
							: "#593434";
					})
					.attr("fill", "none")
					.attr("fill", function (d, i) {
						return d.country == ctx_globe.selectedCountry
							? "red"
							: "none";
					})
					.attr("stroke-width", 1)
					.append("title")
					.text((d) => d.country),
			(update) =>
				update.call((update) =>
					update
						.transition()
						.duration(ctx_epi.TRANSITION_DURATION)
						.attr("stroke", function (d, i) {
							return d.country == ctx_globe.selectedCountry
								? "red"
								: "#593434";
						})
						.attr("fill", function (d, i) {
							return d.country == ctx_globe.selectedCountry
								? "red"
								: "none";
						})
						.attr("cx", function (d, i) {
							return (
								ctx_epi.xscale(parseFloat(d.gdp) / 1000) + 40
							);
						})
						.attr("cy", function (d, i) {
							return (
								ctx_epi.yscale(
									d["PMD.ind." + ctx_em.year_gdp]
								) + 27
							);
						})
				),
			(exit) => exit.remove()
		);

	recData = ctx_epi.recData;
	for (let i = 0; i < recData.length; i++) {
		for (let j = 0; j < gdpData.length; j++) {
			if (recData[i].iso == gdpData[j].Code) {
				recData[i].gdp = gdpData[j][ctx_em.year_gdp.toString()];
			}
		}
	}

	d3.select("#svgREC")
		.selectAll("circle")
		.data(
			ctx_epi.recData.filter((d) => {
				return (
					d["REC.ind." + ctx_em.year_gdp] != -8888 &&
					d["REC.ind." + ctx_em.year_gdp] != null &&
					d.gdp != "" &&
					d.gdp != "0" &&
					d.gdp != null
				);
			})
		)
		.join(
			(enter) =>
				enter
					.append("circle")
					.attr("cx", function (d, i) {
						return ctx_epi.xscale(parseFloat(d.gdp) / 1000) + 40;
					})
					.attr("cy", function (d, i) {
						return (
							ctx_epi.yscale(d["REC.ind." + ctx_em.year_gdp]) + 27
						);
					})
					.attr("r", 3)
					.attr("stroke", function (d, i) {
						return d.country == ctx_globe.selectedCountry
							? "red"
							: "gray";
					})
					.attr("fill", "none")
					.attr("fill", function (d, i) {
						return d.country == ctx_globe.selectedCountry
							? "red"
							: "none";
					})
					.attr("stroke-width", 1)
					.append("title")
					.text((d) => d.country),
			(update) =>
				update.call((update) =>
					update
						.transition()
						.duration(ctx_epi.TRANSITION_DURATION)
						.attr("stroke", function (d, i) {
							return d.country == ctx_globe.selectedCountry
								? "red"
								: "gray";
						})
						.attr("fill", function (d, i) {
							return d.country == ctx_globe.selectedCountry
								? "red"
								: "none";
						})
						.attr("cx", function (d, i) {
							return (
								ctx_epi.xscale(parseFloat(d.gdp) / 1000) + 40
							);
						})
						.attr("cy", function (d, i) {
							return (
								ctx_epi.yscale(
									d["REC.ind." + ctx_em.year_gdp]
								) + 27
							);
						})
				),
			(exit) => exit.remove()
		);
}
