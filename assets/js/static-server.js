const http 	= require('http');
const fs 	= require('fs');
const path 	= require('path');

function StaticServer(rootFolder) {
	
	this.server 	= false;
	this.rootFolder = rootFolder;

	this.start = function() {

		if (!this.server) {

			this.server = http.createServer(this.listenToRequests.bind(this));
		}
	}

	/*

		Serving requests

	*/

	this.listenToRequests = function(request, response) {

		var filePath 	= path.join(this.rootFolder, request.url),
			fileExt 	= this.getFileExtension(request.url),
			mimeType 	= this.getMimeType(fileExt);

		fs.readFile(filePath, function() {


		})
	}

	/*

		Moving files

	*/

	this.addLocalFile = function(filePath, callback) {

		var fileName 	= this.getFileName(filePath),
			destPath 	= path.join(this.rootFolder, fileName);

		this.copyFile(filePath, destPath, callback);
	}

	this.addRemoteFile = function(url) {

		http.get(url, function)
	}

	this.copyFile = function(source, destination, callback) {

		var readStream 	= fs.createReadStream(source),
			writeStream = fs.createWriteStream(destination);

		readStream.on('error', function() {
			callback(false);
		});

		writeStream.on('error', function() {
			callback(false);
		});

		writeStream.on('finish', function() {
			callback(destination);
		});

		readStream.pipe(writeStream);
	}

	/*

		Utility

	*/

	this.getFileName = function(fullPath, separator) {

		var separator 		= separator || '/',
			pathSegments 	= fullPath.split(separator),
			lastSegment 	= pathSegments.length - 1,
			fileName 		= pathSegments[lastSegment];

		return fileName;
	}

	this.getFileExtension = function(fileName) {

		var fileParts 	= fileName.split('.'),
			lastPart 	= fileParts.length - 1,
			fileExt 	= fileParts[lastPart];

		return fileExt;
	}

	this.getMimeType = function(extension) {

		switch (extension) {

			case 'avi':
				mimeType = 'video/x-msvideo';
				break;
			case 'mp4':
				mimeType = 'video/mp4';
				break;
			case 'mkv':
				mimeType = 'video/x-matroska';
				break;
			case 'mov':
				mimeType = 'video/quicktime';
				break;
			case 'wmv':
				mimeType = 'x-ms-wmv';
				break;
			case 'webm':
				mimeType = 'video/webm'
				break;
			case 'srt':
				mimeType = 'text/plain';
				break;
			default:
				mimeType = 'text/plain';
				break;
		}

		return mimeType;
	}
}