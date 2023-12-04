let canvas = document.querySelector('canvas');
let wwd = new WorldWind.WorldWindow(canvas);

// Add layers
let layers = [
 {layer: new WorldWind.BMNGLayer(), enabled: true},
 {layer: new WorldWind.BMNGLandsatLayer(), enabled: false},
 {layer: new WorldWind.BingAerialLayer(null), enabled: false},
 {layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: false},
 {layer: new WorldWind.BingRoadsLayer(null), enabled: false},
 {layer: new WorldWind.CompassLayer(), enabled: false},
 {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
 {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}
];

layers.forEach(function (layer) {
 if (layer.enabled) {
    wwd.addLayer(layer.layer);
 }
});

// Highlight country
let highlightedItems = [];
let highlightedLayer = new WorldWind.RenderableLayer();

function highlightCountry(country) {
 // Your implementation for highlighting a country
}

function highlightPickedObject(o) {
 if (o.userObject instanceof WorldWind.SurfacePolygon) {
    highlightCountry(o.userObject.userProperties.country);
 }
}

function handlePick(o) {
 // Highlight picked object
 if (o && (o.objects || o.objects.length > 0)) {
    highlightPickedObject(o.objects[0]);
 }
}

function logPickedObject(o) {
 if (o && (o.objects || o.objects.length > 0)) {
    console.log(o.objects[0].userObject.userProperties);
 }
}

// Event listeners
let pickController = new WorldWind.PickController(wwd, handlePick);

// Add event listener for country hovering
canvas.addEventListener("mousemove", function (event) {
 pickController.doPick(event);
});

// Add event listener for country selection
canvas.addEventListener("click", function (event) {
 pickController.doPick(event);
 logPickedObject(pickController.pickObjectList);
});

// Rotate Earth's globe
wwd.viewControlLayer.viewControl.allowRotate = true;