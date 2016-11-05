const OS_API = require('opensubtitles-api');
const OpenSubtitles = new OS_API({
	useragent: 'PirateFlix v1'
});

function getSubtitles(mediaUrl, mediaByteSize, languages, callback) {

	OpenSubtitles.search({
		path: mediaUrl,
		filesize: mediaByteSize,
		sublanguageid: languages
	}).then(function(subtitles) {
		
		var subtitlesLibrary = buildSubtitlesLibrary(subtitles);

		console.log(subtitles, subtitlesLibrary);

		callback(subtitlesLibrary);

	}).catch(function(error) {
		
		console.log(error);
		callback(false);
	
	})
}

function buildSubtitlesLibrary(subtitles) {

	var subtitlesLibrary = {},
		languageName,
		subtitleUrl;

	for (language in subtitles) {

		languageName 	= subtitles[language].langName;
		subtitleUrl 	= subtitles[language].url;

		subtitlesLibrary[languageName] = subtitleUrl;
	}

	return subtitlesLibrary;
}

module.exports.getSubtitles = getSubtitles;