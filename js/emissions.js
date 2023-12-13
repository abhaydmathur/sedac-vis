ctx_em = {};

function drawEmissions(svgEl) {}

function updateData(year) {}

function panToCountry() {}

function loadEmissionsData(svgEl) {
	// Load map from data/emissions/world-50m.json
	d3.json("data/emissions/world-50m.json").then(function (d) {
		ctx_em.mapdata = d;
		console.log(d);
		console.log(ctx_em.mapdata.features);
	});
}

function createEmissionsViz() {
	svgEl = d3.select("#svgEmissions");
	svgEl.attr("width", ctx_em.width);
	svgEl.attr("height", ctx_em.height);
	ctx_em.svg = svgEl;

	loadEmissionsData(svgEl);
	panToCountry();
}
