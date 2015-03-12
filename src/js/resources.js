var images = {};
var sources = {
	car1: '../img/carSmall2.png',
	truck1: '../img/truck1Small.png',
	ringRoadOneLane: '../img/oneLanesRoadRealistic_wideBoundaries_cropped2.png'
};

/**
 * Loads all images declared in sources variable and stores them in images variable.
 * After all images are loaded the callback function is called.
 * @param {Function} callback - Called when all images are loaded.
 */
export function loadResources(callback) {
	var loadedImages = 0;
	var numImagesToLoad = Object.keys(sources).length;
	for (var src in sources) {
		images[src] = new Image();
		images[src].onload = function() {
			loadedImages++;
			if (loadedImages >= numImagesToLoad) {
				callback();
			}
		};
		images[src].src = sources[src];
	}
};

export function getImage(imgName) {
	if (images[imgName]) {
		return images[imgName];
	}
	debugger;
	throw new Error(imgName + ' image not defined in movsim.ressources');
};
