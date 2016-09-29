// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const ThePirateBay 	= require('thepiratebay');
const PeerFlix		= require('peerflix');
const oMDB 			= require('omdb');

var $searchForm 		= $('#main-search-form'),
	$searchSubmit 		= $('#main-search-submit'),
	$search 			= $('#main-search'),
	$sections			= $('section'),
	$controlSection 	= $('#controls'),
	$homeSection		= $('#home'),
	$moviesSection 		= $('#movies'),
	$movieInfoSection 	= $('#movie-info'),
	$searchTorrents 	= $('#movie-search-torrents'),
	$torrentSection 	= $('#torrents'),
	$playerSection 		= $('#player'),
	$mediaPlayer		= $('#mediaPlayer'),
	$torrentsList 		= $('#torrents-list'),
	$moviesList 		= $('#movies-list'),
	$loadingSection 	= $('#loading'),
	movieToSearch;

// Ugly code for a beautiful init
setTimeout(function() {
	$controlSection.addClass('active');
	$homeSection.addClass('active');
}, 200);

$searchForm.on('submit', function(e) {
	e.preventDefault();

	var $toClone 	= $('#movies .movie');
	
	//Global
	movieToSearch = $search.val()
	
	setLoadingState(true);

	oMDB.search(movieToSearch, {fullPlot: true}, function(err, response) {
		if (err) {console.log(err);}

		if (response.length > 1) {
			buildMoviesList(response, $toClone.clone());	
		} else {
			displayMovieInfo(false, response);
		}
	});

});

$searchTorrents.on('click', function(e) {

	setLoadingState(true);

	var $toClone = $('#torrents .torrent'),
		toSearch = $(this).data('movietitle');

	ThePirateBay.search(toSearch, {
		category: 'video',
		page: 0,
		orderBy: 'seeds',
		order: 'desc'
	}).then(function(results) {
		buildResultsList(results, $toClone.clone());
	}).catch(function(err){console.log(err)});
	
});


function setLoadingState(loading, $pageToLoad) {
	if (loading) {
		$('.active').not('#controls').removeClass('active');
		$loadingSection.addClass('active');
	} else {
		$loadingSection.removeClass('active');
		$pageToLoad.addClass('active');
	}
}

function buildMoviesList(movies, $toClone) {

	$moviesList.empty();

	for (var i = 0; i < movies.length; i++) {
		$moviesList.append(fillMovieCard(movies[i], $toClone));
	}

	setLoadingState(false, $moviesSection);
}

function buildResultsList(results, $toClone) {

	$torrentsList.empty();

	for (var i = 0; i < 10; i++) {
		$torrentsList.append(fillResultsRow(results[i], $toClone));
	}

	setLoadingState(false, $torrentSection);
}

function fillResultsRow(result, $cloneElement) {
	var cloneData	= {
			'name': result.name,
			'size': result.size,
			'seeds': result.seeders,
			'leeches': result.leechers
		},
		$clone 	= cloneAndFill($cloneElement, cloneData, '.torrent'),
		$play 	= $clone.find('.torrent-play');

	$play.data('magnet', result.magnetLink);

	// Set event handler for torrent
	$play.on('click', function(e) {
		setLoadingState(true);
		streamResult($(this).data('magnet'));
	});

	return $clone;
}

function fillMovieCard(movie, $cloneElement) {
	var cloneData = {
		'poster' : movie.poster,
		'title' : movie.title,
		'year' : movie.year
	},
	$clone = cloneAndFill($cloneElement, cloneData, '.movie');
	$clone.data('imdbid', movie.imdbid);
	$clone.on('click', function(e) {
		displayMovieInfo($(this).data('imdbid'));
	});
}

function cloneAndFill($element, data, className) {
	var $clone = $element.clone();

	for (key in data) {
		var selector = className+'-'+key;
		$clone.find(selector).html(data[key]);
	}

	return $clone;
}

function displayMovieInfo(imdbid, movieData) {
	var $movieInfo 	= $('#movie-info');

	console.log(imdbid, movieData);

	setLoadingState(true);

	// We already have the data
	if ((!imdbid) && movieData) {

		fillMovieInfo($movieInfo, movieData);
		setLoadingState(false, $movieInfoSection);

	// We need to query the data
	} else {
		
		oMDB.search({imdb: imdbid}, {fullPlot: true}, function(err, movie) {
			if (err) {console.log(err);}

			fillMovieInfo($movieInfo, movie);
			setLoadingState(false, $movieInfoSection);
		});
	}
}

function fillMovieInfo($movieInfo, movieData) {
	$movieInfo.find('.movie-title').html(movieData.title+'<small class="movie-year"></small>'); // hanging by a thread here
	$movieInfo.find('.movie-year').html(movieData.year);
	$movieInfo.find('.movie-genre').html(movieData.genres);
	$movieInfo.find('.movie-director').html(movieData.director);
	$movieInfo.find('.movie-writer').html(movieData.writers);
	$movieInfo.find('.movie-actors').html(movieData.actors);
	$movieInfo.find('.movie-plot').html(movieData.plot);
	$movieInfo.find('.movie-runtime').html(movieData.runtime);
	$movieInfo.find('.movie-rating').html(movieData.imdb.rating);
	$movieInfo.find('.movie-poster').attr('src', movieData.poster);
	$searchTorrents.data('movietitle', movieData.title+' '+movieData.year);
}

function streamResult(magnetLink) {

	var torrentStream 	= PeerFlix(magnetLink),
		streamServer 	= torrentStream.server;

	streamServer.on('listening', function() {

		setLoadingState(false, $playerSection);

		var mediaUrl = 'http://localhost:'+streamServer.address().port+'/';

		$mediaPlayer.attr('src', mediaUrl);
	})
}