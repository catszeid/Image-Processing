function $(id) {
	return document.getElementById(id);
}

var canvas;
var ctx;
var images;
var imgData;
var currentImage;

window.onload = function() {
	canvas = $("canvas");
	// set context of the canvas
	ctx = canvas.getContext("2d");
	
	// Listeners for input and options
	$("monochrome").addEventListener("click",monochrome);
	$("darken").addEventListener("click", function() { adjust(-10) });
	$("lighten").addEventListener("click", function() { adjust(10) });
	$("nextImage").addEventListener("click",nextImage);
	$("reload").addEventListener("click",reloadImage);
	$("pixelate").addEventListener("click", function() { pixelate(5) });
	$("pixelateLarge").addEventListener("click", function() { pixelate(10) });
	
	// Canvas click listener
	$("canvas").addEventListener("click", function(e) { canvasClick(e)});
	
	// Ready images
	currentImage = 2;
	initializeImages();
}

// monochrome the image
function monochrome() {
	var avg
	// average the rgb of each pixel
	for (var i = 0; i < canvas.width; i++) {
		for (var j = 0; j < canvas.height; j++) {
			avg = (imageData(i,j,0) + imageData(i,j,1) + imageData(i,j,2))/3;
			for (var k = 0;k < 3; k++) {
				setImageData(i,j,k,avg);
			}
		}
	}
	// draw image onto canvas
	ctx.putImageData(imgData,0,0);
	console.log("Image monochromed!");
}

// adjust image brightness
function adjust(amountPercent) {
	var adjust = 255 * (amountPercent * .01);
	// apply adjust amount to each pixel r,g,b
	for (var i = 0;i < canvas.width;i++) {
		for (var j = 0; j < canvas.height; j++) {
			for (var k = 0; k < 3; k++) {
				var val = imageData(i,j,k)+adjust;
				if (val < 0) {
					setImageData(i,j,k,0);
				}
				else if (val > 255) {
					setImageData(i,j,k,255);
				}
				else {
					setImageData(i,j,k,val);
				}
			}
		}
	}
	// draw image onto canvas
	ctx.putImageData(imgData,0,0);
	console.log("Image brightness adjusted by "+amountPercent+"%");
}

// pixelate image with pixels of size passed in
function pixelate(size) {
	var avg = [0,0,0];
	var numPixels = canvas.width;
	var count = 0;
	// calculate average r,g,b of the pixels in the square
	// loop through pixelated square start positions
	// i is in terms of counting pixels, so jump number of pixels equal to size
	for (var i = 0; i < numPixels; i+=size) {
		for (var j = 0; j < numPixels; j+=size) {
			// loop through large pixel square
			for (var x = i; x < i + size; x++) {
				for (var y = j; y < j + size; y++) {
					// add the values from pixel rgb
					for (var k = 0; k < 3; k++) {
						avg[k] += imageData(x,y,k);
					}
					count++;
				}
			}
			// find the average r,g,b values
			for (var k = 0; k < 3; k++) {
				avg[k] /= count;
			}
			// set all values inside square to average
			for (var x = i; x < i + size; x++) {
				for (var y = j; y < j + size; y++) {
					for (var k = 0; k < 3; k++) {
						setImageData(x,y,k,avg[k]);
					}
				}
			}
			// reset average values and count
			avg = [0,0,0];
			count = 0;
		}
	}
	// draw image onto canvas
	ctx.putImageData(imgData,0,0);
	console.log("Pixelating with size of " + size);
}

// load the next image onto canvas
function nextImage() {
	currentImage++;
	if (currentImage >= images.length ) {
		currentImage = 0;
	}
	console.log("Drawing next image...");
	images[currentImage].onload();
}

// reload the current image
function reloadImage() {
	console.log("Reloading image...");
	images[currentImage].onload();
}

// imgData wrapper allows accessing imgData.data via pixel coords and property
function imageData(px,py,pAtt) {
	// locate the start of the pixel in the data array
	// 4*py*canvas.width + 4*px = pixel start
	var index = 4 * (py*canvas.width + px);
	if (index < imgData.data.length) {
		switch(pAtt) {
			case "r":
			case 0:
				return imgData.data[index];
				break;
			case "g":
			case 1:
				return imgData.data[index +1];
				break;
			case "b":
			case 2:
				return imgData.data[index + 2];
				break;
			case "a":
			case 3:
				return imgData.data[index + 3];
				break;
			default:
				return null;
				break;
		}
	}
	else {
		console.log("No pixel (" + px +","+ py +")");
		return null;
	}
}

// setImgData wrapper allows setting imgData.data via pixel coords and property
function setImageData(px,py,pAtt,val) {
	// locate the start of the pixel in the data array
	// 4*py*canvas.width + 4*px = pixel start
	var index = 4 * (py*canvas.width + px);
	if (index < imgData.data.length) {
		switch(pAtt) {
			case "r":
			case 0:
				imgData.data[index] = val;
				break;
			case "g":
			case 1:
				imgData.data[index +1] = val;
				break;
			case "b":
			case 2:
				imgData.data[index + 2] = val;
				break;
			case "a":
			case 3:
				imgData.data[index + 3] = val;
				break;
			default:
				return null;
				break;
		}
	}
	else {
		console.log("No pixel (" + px +","+ py +")");
		return null;
	}
}

// initalize images
function initializeImages() {
	images = [];
	images[0] = new Image();
	images[0].src = "landscape1.jpg";
	images[0].onload = function(e) {
		ctx.drawImage(images[0], 0,0);
		getImage();
	}
	images[1] = new Image();
	images[1].src = "landscape2.jpg";
	images[1].onload = function(e) {
		ctx.drawImage(images[1], 0,0);
		getImage();
	}
	images[2] = new Image();
	images[2].src = "cat.jpg";
	images[2].onload = function(e) {
		ctx.drawImage(images[2], 0,0);
		getImage();
	}
	console.log("Images initialized!");
}

// display pixel info of clicked position
function canvasClick(e) {
	var loc = windowToCanvas(canvas, e.clientX, e.clientY);
	$("info").innerHTML = "Pixel ("+loc.x+","+loc.y+")\n";
	$("info").innerHTML += "r: " + imageData(loc.x,loc.y,0) + "\n";
	$("info").innerHTML += "g: " + imageData(loc.x,loc.y,1) + "\n";
	$("info").innerHTML += "b: " + imageData(loc.x,loc.y,2) + "\n";
	$("info").innerHTML += "a: " + imageData(loc.x,loc.y,3) + "\n";
}

// get image data and store it in imgData
function getImage() {
	imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
	console.log("Saved image data!");
}

// convert window coords to canvas coords
function windowToCanvas(canvas, x, y) {
	var bbox = canvas.getBoundingClientRect();
	
	return { x: Math.floor(x - bbox.left * (canvas.width / bbox.width)),
			 y: Math.floor(y - bbox.top * (canvas.height / bbox.height))
	};
}