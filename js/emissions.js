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
};

let margin = { top: 50, right: 20, bottom: 20, left: 20 };

function updateColourScale() {
	gdp_year = Math.min(ctx_em.year, 2022);

	let minGDP = d3.min(ctx_em.gdp_pc, (d) => parseFloat(d[`${gdp_year}`]));
	let maxGDP = d3.max(ctx_em.gdp_pc, (d) => parseFloat(d[`${gdp_year}`]));

	ctx_em.gdpLogScale = d3.scaleLog([minGDP, maxGDP]);
	console.log(minGDP, maxGDP)
	console.log([ctx_em.gdpLogScale(minGDP), ctx_em.gdpLogScale(maxGDP)])
	ctx_em.gdpcolour = d3
		.scaleSequential(d3.interpolateYlGn)
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

	svgEl
		.append("rect")
		.attr("class", "track")
		.attr("x", margin.left)
		.attr("y", margin.top - 20)
		.attr("width", ctx_em.width - margin.right)
		.attr("height", 10)
		.attr("fill", "white")
		.attr("opacity", 0.5);

	let handle = svgEl
		.append("circle")
		.attr("class", "handle")
		.attr("cx", yearScale(ctx_em.year))
		.attr("cy", margin.top - 15)
		.attr("fill", "white")
		.attr("r", 10);

	let xAxis = d3
		.axisBottom(yearScale)
		.ticks((2100 - 1990) / 10) // Add a tick for every 10 years
		.tickFormat(d3.format("d")); // Format the ticks as years

	// Add the x-axis to the SVG
	svgEl
		.append("g")
		.attr("class", "xaxis")
		.attr("transform", `translate(0,${40})`)
		.attr("stroke", "white")
		.call(xAxis);
	svgEl.selectAll(".xaxis path, .xaxis line").attr("stroke", "white");

	let drag = d3.drag().on("drag", function (event) {
		let newX = Math.max(margin.left, Math.min(ctx_em.width, event.x));

		ctx_em.year = Math.round(yearScale.invert(newX));
		ctx_em.year -= ctx_em.year % 10;
		newX = yearScale(ctx_em.year);
		handle.attr("cx", newX);

		gdp_year = Math.min(ctx_em.year, 2022);

		// Update the map
		updateColourScale();
		updateEmissionsData();
		ctx_em.svg
			.selectAll(".blobs")
			.data(ctx_em.emissions) // Bind the updated data
			.attr("r", (d) => (ctx_em.rad_scale * d.deg) / ctx_em.scale_factor);

		svgEl
			.select(".emissionsTitle")
			.text(`Gridwise Emissions of ${ctx_em.gas} in ${ctx_em.year}`);

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

	// Apply the drag behavior to the handle
	handle.call(drag);
}

function setScenarioOptions() {
	let select = document.getElementById("scenario-select");

	// Populate the select options with scenarios
	ctx_em.all_scenarios.forEach((scenario) => {
		let option = document.createElement("option");
		option.value = scenario;
		option.text = scenario;
		option.className = ".sceOptions";
		select.appendChild(option);
	});

	// Add event listener to update ctx_em.sce when a new option is selected
	select.addEventListener("change", (event) => {
		ctx_em.sce = event.target.value;
		updateEmissionsData();
		ctx_em.svg
			.selectAll(".blobs")
			.data(ctx_em.emissions) // Bind the updated data
			.attr("r", (d) => (ctx_em.rad_scale * d.deg) / ctx_em.scale_factor);

		svgEl
			.select(".emissionsTitle")
			.text(`Gridwise Emissions of ${ctx_em.gas} in ${ctx_em.year}`);
	});
}

function setGasOptions() {
	let select = document.getElementById("gas-select");

	// Populate the select options with scenarios
	ctx_em.all_gases.forEach((gas) => {
		let option = document.createElement("option");
		option.value = gas;
		option.text = gas;
		select.appendChild(option);
		option.className = ".gasOptions";
	});

	// Add event listener to update ctx_em.sce when a new option is selected
	select.addEventListener("change", (event) => {
		ctx_em.gas = event.target.value;
		updateEmissionsData();
		ctx_em.svg
			.selectAll(".blobs")
			.data(ctx_em.emissions) // Bind the updated data
			.attr("r", (d) => (ctx_em.rad_scale * d.deg) / ctx_em.scale_factor);

		svgEl
			.select(".emissionsTitle")
			.text(`Gridwise Emissions of ${ctx_em.gas} in ${ctx_em.year}`);
	});
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
				// console.log("unable", d.properties.name);
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

	createTimeline(ctx_em.svg_headtime);

	ctx_em.svg_headtime
		.append("text")
		.attr("x", ctx_em.width / 2)
		.attr("y", margin.top - 30)
		.attr("class", "emissionsTitle")
		.attr("text-anchor", "middle")
		.attr("fill", "white")
		.text(`Gridwise Emissions of ${ctx_em.gas} in ${ctx_em.year}`);

	createColorBar(ctx_em.svg_colorbar);

	moveToCountry();
}

function createColorBar(svgEl) {
	var lgd = legend({
		svgEl: svgEl,
		color: ctx_em.gdpcolour,
		title: "Per Capita GDP (Current USD)",
	});

	console.log(lgd);

	// svgEl.call(lgd);
}

function createColorBar_(svgEl) {
	let colorScale = ctx_em.gdpcolour;

	let colorBar = svgEl;

	let gradient = colorBar
		.append("defs")
		.append("linearGradient")
		.attr("id", "gradient")
		.attr("x1", "0%")
		.attr("y1", "100%")
		.attr("x2", "0%")
		.attr("y2", "0%");

	gradient
		.selectAll("stop")
		.data(
			colorScale.ticks().map((t, i, n) => ({
				offset: `${(100 * i) / n.length}%`,
				color: colorScale(t),
			}))
		)
		.enter()
		.append("stop")
		.attr("offset", (d) => d.offset)
		.attr("stop-color", (d) => d.color);

	console.log(gradient);

	colorBar
		.append("rect")
		.attr("width", 20) // Adjust the width as needed
		.attr("height", ctx_em.height) // Use the height of the map
		.attr("fill", `url(#gradient)`);

	let ticks = colorBar
		.append("g")
		.attr("class", "colorbar-ticks")
		.attr("transform", `translate(25,0)`); // Adjust the position of ticks

	ticks
		.selectAll("text")
		.data(colorScale.ticks())
		.enter()
		.append("text")
		.attr("y", function (d) {
			console.log(d);
			return parseFloat(d.offset) / 10000;
		})
		.attr("dy", "0.35em")
		.attr("fill", "white")
		.text((d) => d3.format(".2s")(d));

	// Optionally, you can add a color bar title
	colorBar
		.append("text")
		.attr("class", "colorbar-title")
		.attr("x", 0)
		.attr("y", -10)
		.attr("fill", "white")
		.text("GDP\nper\nCapita");
}

function moveToCountry() {
	const svg = ctx_em.svg;

	const selectedCountry = ctx_em.mapdata.features.find(
		(feature) => feature.properties.name === ctx_globe.selectedCountry
	);

	ctx_em.zoom = d3
		.zoom()
		.scaleExtent([1, 8])
		.on("zoom", function (event) {
			ctx_em.scale_factor = event.transform.k;
			svg.selectAll("path")
				.attr("transform", event.transform)
				.attr("stroke-width", function () {
					return 1 / event.transform.k; // Adjust stroke width based on the current scale
				});
			svg.selectAll(".blobs")
				.attr("transform", event.transform)
				.attr(
					"r",
					(d) => (ctx_em.rad_scale * d.deg) / event.transform.k
				);
		});

	// console.log(selectedCountry.properties.name);

	svg.selectAll("path").attr("opacity", function (d) {
		try {
			return d.properties.name === ctx_globe.selectedCountry ? 1 : 0.3;
		} catch {
			console.log(d);
			return 0.3;
		}
	});

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
	console.log("x, y, den : ", x, y, den);

	try{
		if (selectedCountry.properties.name === "United States of America") {
			[x, y] = [277, 100];
			den = 0.45;
		} else if (selectedCountry.properties.name === "Russia") {
			[x, y] = [700, 50];
			den = 0.45;
		} else if (selectedCountry.properties.name === "France") {
			[x, y] = [465.5, 113.81];
			den = 0.084;
		}
	}catch{
		console.log("Unable to read selectedCountry.properties.name")
		console.log(selectedCountry);
	}

	// den = Math.min(den, 0.5);
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

function updateEmissionsData() {
	filename = `data/emissions/csv/${ctx_em.gas}_${ctx_em.sce}_${ctx_em.year}.csv`;
	d3.csv(filename).then((d) => (ctx_em.emissions = d));
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
		// panToCountry();
	});
}

function createEmissionsViz() {
	svgEl = d3.select("#svgEmissions");

	ctx_em.width = svgEl.node().getBoundingClientRect().width;
	ctx_em.height = svgEl.node().getBoundingClientRect().height;

	ctx_em.width = ctx_em.width - margin.left - margin.right;
	ctx_em.height = ctx_em.height - margin.top - margin.bottom;

	// svgEl
	// 	.attr("width", ctx_em.width) //+ margin.left + margin.right)
	// 	.attr("height", ctx_em.height) //+ margin.top + margin.bottom);
	// 	.attr("transform", `translate(${margin.left}, ${margin.top * 2})`);

	ctx_em.svg = svgEl
		.append("g")
		.attr("id", "map")
		.attr("width", ctx_em.width)
		.attr("height", ctx_em.height)
		// .attr("transform", `translate(${0}, ${0})`);

	ctx_em.svg_headtime = svgEl
		.append("g")
		.attr("id", "header")
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