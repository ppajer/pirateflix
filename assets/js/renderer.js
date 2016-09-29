// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const ThePirateBay 	= require('thepiratebay');
const PeerFlix		= require('peerflix');
const oMDB 			= require('omdb');
const IMDB 			= require('imdb-api');
const MovieDB 		= require('moviedb')('bca1b28150defdd6e20032c1cfcb36ae');

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
	$loadingInfo		= $('#loading-info'),
	movieToSearch;

// Ugly code for a beautiful init
setTimeout(function() {
	$controlSection.addClass('active');
	$homeSection.addClass('active');
	$search.focus();
}, 200);

$searchForm.on('submit', function(e) {
	e.preventDefault();

	var $toClone 	= $('#movies .movie');
	
	//Global
	movieToSearch = $search.val()
	
	setLoadingState(true);

	oMDB.search(movieToSearch, function(err, response) {
		if (err) {console.log(err);}

		if (response.length > 1) {
			buildMoviesList(response, $toClone.clone());	
		} else {
			IMDB.getReq({id: response[0].imdb}, function(err, res) {
				if (err) console.log(err);

				displayMovieInfo(false, res);
			})
		}
	});

});

$searchTorrents.on('click', function(e) {

	setLoadingState(true);

	var $toClone = $('#torrents .torrent'),
		toSearch = $searchTorrents.attr('data-movietitle');

	ThePirateBay.search(toSearch, {
		category: 'video',
		page: 0,
		orderBy: 'seeds',
		order: 'desc'
	}).then(function(results) {
		buildResultsList(results, $toClone.clone());
	}).catch(function(err){
		console.log('first try:',err);

		$loadingInfo.html('There seems to be a problem with The Pirate Bay, retrying...');
		setTimeout(function(){

			ThePirateBay.search(toSearch, {
				category: 'video',
				page: 0,
				orderBy: 'seeds',
				order: 'desc'
			}).then(function(results) {
				buildResultsList(results, $toClone.clone());
			}).catch(function(err){
				console.log('retry:', err);

				$loadingInfo.html('The server seems to be down, try again in a few!<br>Cancelling search...');
				setTimeout(function(){
					setLoadingState(false, $homeSection);
					$loadingInfo.html('This may take a few seconds');
				}, 2000);
			});
		}, 3000);
	});
});

/*

	HELPERS

*/

function setLoadingState(loading, $pageToLoad) {
	if (loading) {
		$('.active').not('#controls').removeClass('active');
		$loadingSection.addClass('active');
	} else {
		$loadingSection.removeClass('active');
		$pageToLoad.addClass('active');
	}
}

function cloneAndFill($element, data, className) {
	var $clone = $element.clone();

	for (key in data) {
		var selector = className+'-'+key;
		$clone.find(selector).html(data[key]);
	}

	return $clone;
}

/*

	MOVIE SELECT

*/

function buildMoviesList(movies, $toClone) {

	$moviesList.empty();

	for (var i = 0; i < movies.length; i++) {

		if (movies[i].imdb) {

			IMDB.getReq({id: movies[i].imdb}, function(err, res) {
				if (err) {console.log(err);}

				$moviesList.append(fillMovieCard(res, $toClone));
			})
		}
	}

	setLoadingState(false, $moviesSection);
}

function fillMovieCard(movie, $cloneElement) {
	if ((!movie.poster || movie.poster.indexOf('http') === -1) || !movie.title || !movie._year_data || !movie.plot) {
		return;
	}
	var cloneData = {
		'title' : movie.title,
		'year' : movie._year_data
	},
	$clone = cloneAndFill($cloneElement, cloneData, '.movie');
	$clone.find('.movie-poster').attr('src', movie.poster);
	$clone.attr('data-imdbid', movie.imdbid);
	$clone.on('click', function(e) {
		displayMovieInfo($(this).attr('data-imdbid'));
	});

	return $clone;
}

/*

	MOVIE INFO

*/

function displayMovieInfo(imdbid, movieData) {
	var $movieInfo 	= $('#movie-info');

	setLoadingState(true);

	// We already have the data
	if ((!imdbid) && movieData) {

		fillMovieInfo($movieInfo, movieData);
		setLoadingState(false, $movieInfoSection);

	// We need to query the data
	} else {
		
		IMDB.getReq({id: imdbid}, function(err, movie) {
			if (err) {
				console.log('error: ', err);
				oMDB.get({imdb: imdbid}, {fullPlot: true}, function(err, res) {
					if (err) console.log(err);
					console.log('res:', res);
					fillMovieInfo($movieInfo, res[0]);
					setLoadingState(false, $movieInfoSection);
				});
			} else {
				console.log('res:' ,movie)
				fillMovieInfo($movieInfo, movie);
				setLoadingState(false, $movieInfoSection);
			}
		});
	}
}

function fillMovieInfo($movieInfo, movieData) {
	console.log(movieData);
	$movieInfo.find('.movie-title').html(movieData.title+'<small class="movie-year"></small>'); // hanging by a thread here
	$movieInfo.find('.movie-year').html(movieData._year_data || movieData.year);
	$movieInfo.find('.movie-genre').html(movieData.genres);
	$movieInfo.find('.movie-director').html(movieData.director);
	$movieInfo.find('.movie-writer').html(movieData.writer);
	$movieInfo.find('.movie-actors').html(movieData.actors);
	$movieInfo.find('.movie-plot').html(movieData.plot);
	$movieInfo.find('.movie-runtime').html(movieData.runtime);
	$movieInfo.find('.movie-rating').html(movieData.rating || movieData.imdb.rating);
	$movieInfo.find('.movie-poster').attr('src', movieData.poster);
	$searchTorrents.attr('data-movietitle', movieData.title);
}

/*
	
	SERIES INFO

*/

function displaySeriesInfo($seriesInfo, seriesData) {

}

function fillSeriesInfo($seriesInfo, seriesData) {

}

function displaySeasonInfo($seasonInfo, seasonData) {}

/*

	TORRENT SELECT

*/

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

/*

	STREAMING

*/

function streamResult(magnetLink) {

	var torrentStream 	= PeerFlix(magnetLink),
		streamServer 	= torrentStream.server;

	streamServer.on('listening', function() {

		setLoadingState(false, $playerSection);

		var mediaUrl = 'http://localhost:'+streamServer.address().port+'/';

		$mediaPlayer.attr('src', mediaUrl);
	})
}