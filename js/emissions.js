ctx_em = {
	all_scenarios: [
		"A1AIM",
		"A1GMINICAM",
		"A1TMESSAGE",
		"A2ASF",
		"B1IMAGE",
		"B2MESSAGE",
	],
	all_gases: ["CH4", "CO", "NMVOC", "NOx"],
	gas: "CO",
	sce: "A2ASF",
	year: "2020",
	rad_scale: 4,
	scale_factor: 1,
	year_gdp: "2020",
	highlightCountry: true,
};

scenario_descriptions = {
	A1AIM: "Rapid economic growth, urbanization, industrialization, balanced use of fossil fuels, biomass affecting economy, climate, land use.",
	A2ASF: "Rapid economic growth, urbanization, industrialization, strong emphasis on fossil fuels affecting economy, energy, environment.",
	B1IMAGE:
		"Moderate economic growth, urbanization industrialization, shift to clean energy sources and greater emphasis on sustainable development affecting atmosphere, ocean, land, human activities.",
	B2MESSAGE:
		"Moderate economic growth, urbanization, industrialization, focus on sustainable development affecting energy, climate, economy.",
	A1GMINICAM:
		"Low rate of population growth, heavy reliance on fossil fuels affecting atmosphere, ocean, land, ice.",
	A1TMESSAGE:
		"Rapid economic and technological advancement, strong focus on sustainable development affecting energy, climate, economy.",
};

triangle = d3.symbol().type(d3.symbolTriangle).size(80);

let margin = { top: 50, right: 20, bottom: 20, left: 20 };

function updateColourScale() {
	gdp_year = Math.min(ctx_em.year_gdp, 2022);

	let minGDP = d3.min(ctx_em.gdp_pc, (d) => parseFloat(d[`${gdp_year}`]));
	let maxGDP = d3.max(ctx_em.gdp_pc, (d) => parseFloat(d[`${gdp_year}`]));

	ctx_em.gdpLogScale = d3.scaleLog([minGDP, maxGDP]);

	ctx_em.gdpcolour = d3
		.scaleSequential(d3.interpolateViridis)
		.domain([ctx_em.gdpLogScale(minGDP), ctx_em.gdpLogScale(maxGDP)]);
}

function gdpToColour(gdp) {
	return ctx_em.gdpcolour(ctx_em.gdpLogScale(gdp));
}

function createTimeline(svgEl) {
	let yearScale = d3
		.scaleLinear()
		.domain([1990, 2100])
		.range([margin.left, ctx_em.width])
		.clamp(true);

	let yearScale_small = d3
		.scaleLinear()
		.domain([1995, 2020])
		.range([yearScale(1995), yearScale(2020)])
		.clamp(true);

	svgEl
		.append("text")
		.attr("x", margin.left)
		.attr("y", margin.top - 30)
		.attr("class", "timeline_label")
		.attr("text-anchor", "left")
		.attr("fill", "white")
		.text(`Year : Per Capita GDP`);

	svgEl
		.append("text")
		.attr("x", ctx_em.width * 0.9)
		.attr("y", margin.top + 30)
		.attr("class", "timeline_label")
		.attr("text-anchor", "right")
		.attr("fill", "white")
		.text(`Year : Emissions`);

	let handle_year_em = svgEl
		.append("path")
		.attr("d", triangle)
		.attr("class", "handle_year_em")
		.attr("transform", `translate(${yearScale(ctx_em.year)}, 67.5)`)
		.attr("fill", "white")
		.attr("opacity", 0.8);

	let handle_year_gdp = svgEl
		.append("path")
		.attr("d", triangle)
		.attr("class", "handle_year_em")
		.attr(
			"transform",
			`translate(${yearScale(ctx_em.year)}, ${
				margin.top - 25
			}) rotate(180)`
		)
		.attr("fill", "white")
		.attr("opacity", 0.8);

	let xAxis = d3
		.axisBottom(yearScale)
		.ticks((2100 - 1990) / 10)
		.tickFormat(d3.format("d"))
		.tickSizeInner(-6) // point up
		.tickSizeOuter(-6);

	svgEl
		.append("g")
		.attr("class", "xaxis2")
		.attr("transform", `translate(0,${40})`)
		.attr("fill", "white")
		.call(xAxis);

	let xAxis_small = d3
		.axisBottom(yearScale_small)
		.ticks((2020 - 1995) / 1)
		.tickFormat("")
		.tickSizeInner(-6) 
		.tickSizeOuter(-6);

	svgEl
		.append("g")
		.attr("class", "xaxis2")
		.attr("transform", `translate(0,${40})`)
		.attr("fill", "white")
		.call(xAxis_small);

	let xAxis2 = d3
		.axisBottom(yearScale)
		.ticks((2100 - 1990) / 10)
		.tickFormat("")
		.tickSizeInner(6)
		.tickSizeOuter(6);

	svgEl
		.append("g")
		.attr("class", "xaxis")
		.attr("transform", `translate(0,${52})`)
		.attr("fill", "white")
		.call(xAxis2);

	svgEl.selectAll(".xaxis path, .xaxis line").attr("stroke", "white");
	svgEl.selectAll(".xaxis2 path, .xaxis2 line").attr("stroke", "white");

	let drag_year_em = d3.drag().on("drag", function (event) {
		let newX = Math.max(margin.left, Math.min(ctx_em.width, event.x));

		ctx_em.year = Math.round(yearScale.invert(newX));
		ctx_em.year -= ctx_em.year % 10;
		newX = yearScale(ctx_em.year);
		handle_year_em.attr("transform", `translate(${newX}, 67.5)`);

		gdp_year = Math.min(ctx_em.year, 2022);

		// Update the map
		updateColourScale();
		updateEmissionsData();

		ctx_em.svg.selectAll("path").attr("fill", function (d) {
			country = ctx_em.gdp_pc.find(
				(x) => x.CountryName === d.properties.name
			);

			try {
				c = parseFloat(country[`${gdp_year}`]);
				if (!isNaN(c)) return gdpToColour(c);
				else {
					return "lightgrey";
				}
			} catch {
				return "lightgrey	";
			}
		});
	});

	let drag_year_gdp = d3.drag().on("drag", function (event) {
		let newX = Math.max(margin.left, Math.min(ctx_em.width, event.x));

		ctx_em.year_gdp = Math.max(
			Math.min(2020, Math.round(yearScale.invert(newX))),
			1995
		);
		
		newX = yearScale(ctx_em.year_gdp);
		handle_year_gdp.attr(
			"transform",
			`translate(${newX}, ${margin.top - 25}) rotate(180)`
		);

		gdp_year = ctx_em.year_gdp;
		
		updateColourScale();

		// Update EPI
		updateEPIViz();

		updateColorBar(ctx_em.svg_colorbar);

		ctx_em.svg.selectAll("path").attr("fill", function (d) {
			country = ctx_em.gdp_pc.find(
				(x) => x.CountryName === d.properties.name
			);

			try {
				c = parseFloat(country[`${gdp_year}`]);
				if (!isNaN(c)) return gdpToColour(c);
				else {
					return "lightgrey";
				}
			} catch {
				return "lightgrey";
			}
		});
	});

	handle_year_em.call(drag_year_em);
	handle_year_gdp.call(drag_year_gdp);
}

function setScenarioOptions() {
	let select = document.getElementById("scenario-select");

	// Populate the select options with scenarios
	ctx_em.all_scenarios.forEach((scenario) => {
		let option = document.createElement("option");
		option.value = scenario;
		option.text = scenario;
		option.className = "sceOptions";
		select.appendChild(option);
	});

	select.value = ctx_em.sce;
	
	select.addEventListener("change", (event) => {
		ctx_em.sce = event.target.value;
		updateEmissionsData();
		updateScenarioDescription();
	});
	
	ctx_em.svgConfig
		.append("text")
		.attr("id", "scenario-title")
		.attr("x", margin.left)
		.attr("y", 0.43 * ctx_em.height)
		.text("Emissions Scenario")
		.attr("fill", "white");

	ctx_em.svgConfig
		.append("text")
		.attr("id", "scenario-description")
		.attr("x", margin.left)
		.attr("y", 0.5 * ctx_em.height)
		.text(scenario_descriptions[ctx_em.sce])
		.attr("fill", "white")
		.call(wrapText, (3 * ctx.width) / 6);
}

function updateScenarioDescription() {
	console.log("Chaning desc");
	d3.select("#scenario-description")
		.text(scenario_descriptions[ctx_em.sce])
		.call(wrapText, (3 * ctx.width) / 6);
}

function wrapText(text, width) {
	text.each(function () {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.1, // ems
			y = text.attr("y"),
			dy = 0, //parseFloat(text.attr("dy")),
			tspan = text
				.text(null)
				.append("tspan")
				.attr("x", margin.left)
				.attr("y", y)
				.attr("dy", dy + "em");
		while ((word = words.pop())) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node().getComputedTextLength() > width) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text
					.append("tspan")
					.attr("x", margin.left)
					.attr("y", y)
					.attr("dy", ++lineNumber * lineHeight + dy + "em")
					.text(word);
			}
		}
	});
}

function setGasOptions() {
	let select = document.getElementById("gas-select");
	
	ctx_em.all_gases.forEach((gas) => {
		let option = document.createElement("option");
		option.value = gas;
		option.text = gas;
		select.appendChild(option);
		option.className = "gasOptions";
	});

	select.value = ctx_em.gas;
	
	select.addEventListener("change", (event) => {
		ctx_em.gas = event.target.value;
		updateEmissionsData();
	});

	ctx_em.svgConfig
		.append("text")
		.attr("id", "gas-title")
		.attr("x", margin.left)
		.attr("y", 0.755 * ctx_em.height)
		.text("Selected Reactive Gas")
		.attr("fill", "white");
}

function drawEmissions(svgEl) {
	svgEl = ctx_em.svg;
	updateColourScale();
	setScenarioOptions();
	setGasOptions();

	ctx_em.projection = d3
		.geoMercator()
		.scale(100)
		.translate([ctx_em.width / 2, ctx_em.height / 2]);

	ctx_em.path = d3.geoPath().projection(ctx_em.projection);

	gdp_year = Math.min(ctx_em.year, 2023);

	svgEl
		.selectAll("path")
		.data(ctx_em.mapdata.features)
		.enter()
		.append("path")
		.attr("d", ctx_em.path)
		.attr("stroke", "black	")
		.attr("stroke-width", function () {
			return 1 / d3.zoomTransform(svg.node()).k;
		})
		.attr("fill", function (d) {
			country = ctx_em.gdp_pc.find(
				(x) => x.CountryName === d.properties.name
			);

			try {
				c = parseFloat(country[`${gdp_year}`]);
				if (!isNaN(c)) return gdpToColour(c);
				else {
					return "lightgrey";
				}
			} catch {
				return "lightgrey	";
			}
		})
		.attr("opacity", 0.8);

	svgEl
		.selectAll("circle")
		.data(ctx_em.emissions)
		.enter()
		.append("circle")
		.attr("cx", (d) => ctx_em.projection([d.long, d.lat])[0])
		.attr("cy", (d) => ctx_em.projection([d.long, d.lat])[1])
		.attr("r", (d) => ctx_em.rad_scale * d.deg)
		.attr("fill", "red")
		.attr("class", "blobs")
		.append("title")
		.text(function (d) {
			try {
				loc =
					ctx_em.coords_to_loc[
						[parseFloat(d.long), parseFloat(d.lat)]
					];
				return `${
					loc.city
				}, ${loc.country_code}\ndeg:${parseFloat(d.deg).toFixed(3)}`;
			} catch {
				return `${parseFloat(d.deg).toFixed(3)}@[${d.long}, ${d.lat}]`;
			}
		});

	const radius = d3.scaleSqrt(
		[0, d3.max(ctx_em.emissions, (d) => ctx_em.rad_scale * d.deg)],
		[0, 40]
	);

	const blob_legend = svgEl
		.append("g")
		.attr("fill", "white")
		.attr(
			"transform",
			`translate(${ctx_em.width - 20},${ctx_em.height - 20})`
		)
		.attr("text-anchor", "middle")
		.style("font", "10px sans-serif")
		.style("text-shadow", "2px 2px")
		.selectAll()
		.data(radius.ticks(3).slice(1))
		.join("g");

	blob_legend
		.append("circle")
		.attr("fill", "none")
		.attr("stroke", "#ccc")
		.attr("cy", (d) => -radius(d))
		.attr("r", radius);

	blob_legend
		.append("text")
		.attr("y", (d) => -2 * radius(d))
		.attr("dy", "1.3em")
		.text(radius.tickFormat(3, "s"))
		.style("text-shadow", "2px 2px");

	blob_legend.append("text").attr("y", -4).text(`${ctx_em.rad_scale}*TsG`);

	createTimeline(ctx_em.svg_headtime);

	ctx_em.svg
		.append("text")
		.attr("x", ctx_em.width / 2)
		.attr("y", margin.top - 30)
		.attr("class", "emissionsTitle")
		.attr("text-anchor", "middle")
		.attr("fill", "white")
		.text(`Gridwise Emissions of ${ctx_em.gas} in ${ctx_em.year}`);

	createColorBar(ctx_em.svg_colorbar);
	checkHighlightCountry(ctx_em.svg);
	moveToCountry();
}

function createColorBar(svgEl) {
	var lgd = legend({
		svgEl: svgEl,
		color: ctx_em.gdpcolour,
		title: `Per Capita GDP (USD) : ${ctx_em.year_gdp}`,
	});

	d3.select("#colorbar")
		.selectAll(".tick")
		.select("text")
		.text(function (d, i) {
			return Math.round(ctx_em.gdpLogScale.invert(d));
		});
}

function updateColorBar(svgEl) {
	d3.select("#colorbar").selectAll("text").remove();
	createColorBar(svgEl);
}

function moveToCountry() {
	const svg = ctx_em.svg;

	const selectedCountry = ctx_em.mapdata.features.find(
		(feature) => feature.properties.name === ctx_globe.selectedCountry
	);

	updateEPIViz();

	ctx_em.zoom = d3
		.zoom()
		.scaleExtent([1, 8])
		.on("zoom", function (event) {
			ctx_em.scale_factor = event.transform.k;
			svg.selectAll("path")
				.attr("transform", event.transform)
				.attr("stroke-width", function () {
					return 1 / event.transform.k;
				});
			svg.selectAll(".blobs")
				.attr("transform", event.transform)
				.attr(
					"r",
					(d) => (ctx_em.rad_scale * d.deg) / event.transform.k
				);
		});

	if (ctx_em.highlightCountry) {
		svg.selectAll("path").attr("opacity", function (d) {
			try {
				return d.properties.name === ctx_globe.selectedCountry
					? 1
					: 0.3;
			} catch {
				console.log(d);
				return 0.3;
			}
		});
	}

	svg.selectAll(".blobs")
		.transition()
		.duration(ctx.TRANSITION_DURATION)
		.attr("cx", (d) => ctx_em.projection([d.long, d.lat])[0])
		.attr("cy", (d) => ctx_em.projection([d.long, d.lat])[1])
		.attr("fill", function (d) {
			try {
				if (
					selectedCountry.properties.name ===
					ctx_em.coords_to_loc[
						[parseFloat(d.long), parseFloat(d.lat)]
					].country_name
				) {
					return "red";
				} else return "pink";
			} catch {
				return "pink";
			}
		});

	const bounds = ctx_em.path.bounds(selectedCountry);
	const dx = bounds[1][0] - bounds[0][0];
	const dy = bounds[1][1] - bounds[0][1];
	x = (bounds[0][0] + bounds[1][0]) / 2;
	y = (bounds[0][1] + bounds[1][1]) / 2;
	den = Math.max(dx / ctx_em.width, dy / ctx_em.height);

	console.log(x, y, den);

	try {
		if (selectedCountry.properties.name === "United States of America") {
			[x, y] = [250, 75];
			flag = 1;
			den = 0.3;
		} else if (selectedCountry.properties.name === "Russia") {
			[x, y] = [600, 30];
			flag = 1;
			den = 0.3;
		} else if (selectedCountry.properties.name === "France") {
			[x, y] = [465.5, 87.5];
			flag = 1;
			den = 0.074;
		}
		if (flag) {
		}
	} catch {
		console.log("Unable to read selectedCountry.properties.name");
		console.log(selectedCountry);
	}

	const scale = 0.9 / den;

	const translate = [
		ctx_em.width / 2 - scale * x,
		ctx_em.height / 2 - scale * y,
	];

	svg.transition()
		.duration(ctx.TRANSITION_DURATION)
		.call(
			ctx_em.zoom.transform,
			d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
		);

	svg.call(ctx_em.zoom);
}

function checkHighlightCountry(svgEl) {
	document.getElementById('highlightCountryCheckbox').addEventListener('change', function() {
		ctx_em.highlightCountry = this.checked;
	
		if(ctx_em.highlightCountry) {
			svgEl.selectAll("path").attr("opacity", function (d) {
				try {
					return d.properties.name === ctx_globe.selectedCountry ? 1 : 0.3;
				} catch {
					console.log("Couldn't read properties for : ", d);
					return 0.3;
				}
			});
		} else {	
			svgEl.selectAll("path").attr("opacity", 1);
		}
	});
}

function updateEmissionsData() {
	console.log(`Loading ${ctx_em.gas}_${ctx_em.sce}_${ctx_em.year}.csv`);
	
	filename = `data/emissions/csv/${ctx_em.gas}_${ctx_em.sce}_${ctx_em.year}.csv`;
	d3.csv(filename).then(function (d) {
		ctx_em.emissions = d;

		ctx_em.svg
			.selectAll(".blobs")
			.data(d)
			.join(
				(enter) =>
					enter
						.append("circle")
						.attr(
							"cx",
							(d) => ctx_em.projection([d.long, d.lat])[0]
						)
						.attr(
							"cy",
							(d) => ctx_em.projection([d.long, d.lat])[1]
						)
						.attr(
							"r",
							(d) =>
								(ctx_em.rad_scale * d.deg) / ctx_em.scale_factor
						)
						.attr("fill", "red")
						.attr("class", "blobs")
						.append("title")
						.text(function (d) {
							try {
								loc =
									ctx_em.coords_to_loc[
										[parseFloat(d.long), parseFloat(d.lat)]
									];
								return `${
									loc.city
								}, ${loc.country_code}\ndeg:${parseFloat(d.deg).toFixed(3)}`;
							} catch {
								return `${parseFloat(d.deg).toFixed(
									3
								)}@[${d.long}, ${d.lat}]`;
							}
						}),

				(update) =>
					update.call((update) =>
						update
							.attr(
								"cx",
								(d) => ctx_em.projection([d.long, d.lat])[0]
							)
							.attr(
								"cy",
								(d) => ctx_em.projection([d.long, d.lat])[1]
							)
							.attr(
								"r",
								(d) =>
									(ctx_em.rad_scale * d.deg) /
									ctx_em.scale_factor
							)
					),
				(exit) => exit.remove()
			);

		ctx_em.svg
			.select(".emissionsTitle")
			.text(`Gridwise Emissions of ${ctx_em.gas} in ${ctx_em.year}`);
	});
}

function loadEmissionsData(svgEl) {
	Promise.all([
		d3.json("data/emissions/countries-50m.json"),
		d3.csv(
			`data/emissions/csv/${ctx_em.gas}_${ctx_em.sce}_${ctx_em.year}.csv`
		),
		d3.csv("data/emissions/gdp_per_capita_1973_2023.csv"),
		d3.csv("data/emissions/coordinates_to_location.csv"),
	]).then(function ([world, emissions, gdp_pc, ctoloc]) {
		ctx_em.mapdata = topojson.feature(world, world.objects.countries);

		ctx_em.emissions = emissions;
		ctx_em.gdp_pc = gdp_pc;

		ctx_em.coords_to_loc = {};
		ctoloc.forEach(function (d) {
			ctx_em.coords_to_loc[[parseFloat(d.long), parseFloat(d.lat)]] = {
				city: d.city,
				country_code: d.country_code,
				country_name: d.country_name,
			};
		});
		drawEmissions(svgEl);
	});
}

function createEmissionsViz() {
	svgEl = d3.select("#svgEmissions");
	ctx_em.svgConfig = d3.select("#svgConfig");

	ctx_em.width = svgEl.node().getBoundingClientRect().width;
	ctx_em.height = svgEl.node().getBoundingClientRect().height;

	ctx_em.width = ctx_em.width - margin.left - margin.right;
	ctx_em.height = ctx_em.height - margin.top - margin.bottom;

	ctx_em.svg = svgEl
		.append("g")
		.attr("id", "map")
		.attr("width", ctx_em.width)
		.attr("height", ctx_em.height - 100)
		.attr("transform", `translate(${0}, ${20})`);

	ctx_em.svg_headtime = d3
		.select("#svgTimeLine")
		.append("g")
		.attr("id", "timeline")
		.attr("transform", `translate(${0}, ${0})`);

	ctx_em.svg_colorbar = svgEl
		.append("g")
		.attr("id", "colorbar")
		.attr(
			"transform",
			`translate(${ctx_em.width / 2 - 175}, ${
				ctx_em.height - margin.bottom
			})`
		);

	ctx_em.svg_options = svgEl
		.append("g")
		.attr("id", "options")
		.attr("transform", `translate(0,0)`);

	loadEmissionsData(ctx_em.svg);
}
