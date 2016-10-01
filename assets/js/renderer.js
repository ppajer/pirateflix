// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const ThePirateBay 		= require('thepiratebay');
const PeerFlix			= require('peerflix');
const MovieDB 			= require('moviedb')('bca1b28150defdd6e20032c1cfcb36ae');
const MediaController 	= require('./media-controls.js');

const smallImageBaseUrl = 'https://image.tmdb.org/t/p/w300_and_h450_bestv2';
const largeImageBaseUrl = 'https://image.tmdb.org/t/p/w600_and_h900_bestv2';

var $searchForm 		= $('#main-search-form'),
	$searchSubmit 		= $('#main-search-submit'),
	$search 			= $('#main-search'),
	$sections			= $('section'),
	$controlSection 	= $('#controls'),
	$homeSection		= $('#home'),
	$moviesSection 		= $('#movies'),
	$movieInfoSection 	= $('#movie-info'),
	$seriesInfoSection 	= $('#series-info'),
	$seasonInfoSection 	= $('#season-info'),
	$searchTorrents 	= $('#movie-search-torrents'),
	$torrentSection 	= $('#torrents'),
	$playerSection 		= $('#player'),
	$mediaPlayer		= $('#mediaPlayer'),
	$torrentsList 		= $('#torrents-list'),
	$moviesList 		= $('#movies-list'),
	$loadingSection 	= $('#loading'),
	$loadingInfo		= $('#loading-info');

// Ugly code for a beautiful init
setTimeout(function() {
	$controlSection.addClass('active');
	$homeSection.addClass('active');
	$search.focus();
}, 200);

$searchForm.on('submit', function(e) {
	e.preventDefault();

	var $toClone 	= $('#movies .movie'),
		movieToSearch = $search.val();
	
	setLoadingState(true);

	MovieDB.searchMulti({query:movieToSearch}, function(err, res) {
		if (err) {
			console.log(err);
		} else{
			buildMediaList(res.results, $toClone.first().clone());
		};
	})
});

$searchTorrents.on('click', function(e) {

	setLoadingState(true);

	var $toClone = $('#torrents .torrent'),
		toSearch = $searchTorrents.attr('data-movietitle');

	searchTorrents(toSearch).then(function(results) {
		buildResultsList(results, $toClone.first().clone());
	}).catch(function(err){
		console.log('first try:',err);

		$loadingInfo.html('There seems to be a problem with The Pirate Bay, retrying...');
		setTimeout(function(){

			searchTorrents(toSearch).then(function(results) {
				buildResultsList(results, $toClone.first().clone());
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

function fillCard($cloneElement, name, year, id, poster, selector, onclick) {
	if (parseInt(year) > new Date().getFullYear()) return;
	var cloneData = {
		'title': name,
		'year': year
	},
	$clone = cloneAndFill($cloneElement, cloneData, selector);
	$clone.find(selector+'-poster').attr('src', smallImageBaseUrl+poster);
	$clone.attr('data-id', id);
	$clone.on('click', function(e) {
		onclick($(this).attr('data-id'));
	});
	return $clone;
}

function getMediaGenres(genres) {
	var genreList = [];
	genres.forEach(function(genre) {
		genreList.push(genre.name);
	});
	return genreList;
}

function getMediaCredits(credits) {
	var creditsList = {
		'director': [],
		'writer': [],
		'cast': []
	};
	credits.crew.forEach(function(c){
		if (c.job === 'Director') creditsList.director.push(c.name);
		if (c.job === 'Writer') creditsList.writer.push(c.name);
	});
	for (var i = 0; i < 5; i++) {
		if (credits.cast[i].name) creditsList.cast.push(credits.cast[i].name);
	};

	return creditsList;
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

/*

	MOVIE SELECT

*/

function buildMediaList(media, $toClone) {

	$moviesList.empty();

	for (var i = 0; i < media.length; i++) {

		if (media[i].media_type === 'movie') {
			$moviesList.append(fillMovieCard(media[i], $toClone));
		} else if (media[i].media_type === "tv") {
			$moviesList.append(fillSeriesCard(media[i], $toClone));
		} 
	}

	setLoadingState(false, $moviesSection);
}

function fillMovieCard(movie, $cloneElement) {
	if (!movie.poster_path || (movie.poster_path === null)) return;
	return fillCard($cloneElement, movie.title, movie.release_date.split('-')[0], movie.id, movie.poster_path, '.movie', displayMovieInfo);
}

function fillSeriesCard(series, $cloneElement) {
	if (!series.poster_path || (series.poster_path === null)) return;
	return fillCard($cloneElement, series.name, series.first_air_date.split('-')[0], series.id, series.poster_path, '.movie', displaySeriesInfo);
}

/*

	MOVIE INFO

*/

function displayMovieInfo(id) {

	setLoadingState(true);
	MovieDB.movieInfo({id: id}, function(err, movie) {
		if (err) {
			console.log(err);
		} else {

			MovieDB.movieCredits({id: movie.id}, function(err, credits) {
				if (err) {
					console.log(err);
				} else {
					fillMovieInfo(movie, credits);
					setLoadingState(false, $movieInfoSection);
				}
			})
		}
	});
}

function fillMovieInfo(movieData, creditsData) {
	var genres 	= getMediaGenres(movieData.genres),
		credits = getMediaCredits(creditsData);

	$movieInfoSection.find('.movie-title').html(movieData.title+'<small class="movie-year"></small>'); // hanging by a thread here
	$movieInfoSection.find('.movie-year').html(movieData.release_date.split('-')[0]);
	$movieInfoSection.find('.movie-genre').html(genres.join(', '));
	$movieInfoSection.find('.movie-director').html(credits.director.join(', '));
	$movieInfoSection.find('.movie-writer').html(credits.writer.join(', '));
	$movieInfoSection.find('.movie-actors').html(credits.cast.join(', '));
	$movieInfoSection.find('.movie-plot').html(movieData.overview);
	$movieInfoSection.find('.movie-runtime').html(movieData.runtime);
	$movieInfoSection.find('.movie-rating').html(movieData.vote_average);
	$movieInfoSection.find('.movie-poster').attr('src', largeImageBaseUrl+movieData.poster_path);
	$searchTorrents.attr('data-movietitle', movieData.title+' '+movieData.release_date.split('-')[0]); // Identify by title+year for easy torrent search
}

/*
	
	SERIES INFO

*/

function displaySeriesInfo(id) {

	setLoadingState(true);
	MovieDB.tvInfo({id: id}, function(err, series) {
		if (err) {
			console.log(err);
		} else {
			MovieDB.tvCredits({id: id}, function(err, credits) {
				if (err) {
					console.log(err);
				} else {
					fillSeriesInfo(series, credits);
					setLoadingState(false, $seriesInfoSection);
				};
			})
		};
	})
}

function fillSeriesInfo(seriesData, creditsData) {
	var genres 		= getMediaGenres(seriesData.genres),
		credits 	= getMediaCredits(creditsData),
		$toClone 	= $seriesInfoSection.find('.series-season').clone();
	$seriesInfoSection.find('#series-seasons').empty();
	$seriesInfoSection.find('.series-title').html(seriesData.name+'<small class="series-year"></small>'); // hanging by a thread here
	$seriesInfoSection.find('.series-year').html(seriesData.first_air_date.split('-')[0]);
	$seriesInfoSection.find('.series-genre').html(genres.join(', '));
	$seriesInfoSection.find('.series-director').html(credits.director.join(', '));
	$seriesInfoSection.find('.series-writer').html(credits.writer.join(', '));
	$seriesInfoSection.find('.series-actors').html(credits.cast.join(', '));
	$seriesInfoSection.find('.series-plot').html(seriesData.overview);
	$seriesInfoSection.find('.series-rating').html(seriesData.vote_average);
	$seriesInfoSection.find('.series-poster').attr('src', largeImageBaseUrl+seriesData.poster_path);
	seriesData.seasons.forEach(function(season) {
		$seriesInfoSection.find('#series-seasons').append(fillSeasonCard(seriesData.name, seriesData.id, season, $toClone));
	})
}

function fillSeasonCard(series, seriesId, season, $cloneElement) {
	var cloneData = {
			'title': 'Season '+season.season_number,
			'year': season.air_date ? season.air_date.split('-')[0] : '',
		},
		$clone = cloneAndFill($cloneElement.clone(), cloneData, '.season');
	$clone.find('.season-poster').attr('src', smallImageBaseUrl+season.poster_path);
	$clone.attr('data-seriesid', seriesId);
	$clone.attr('data-seasonnumber', season.season_number);
	$clone.attr('data-series', series);
	$clone.on('click', function(e) {
		displaySeasonInfo($(this).attr('data-series'), $(this).attr('data-seriesid'), $(this).attr('data-seasonnumber'));
	});
	return $clone;
}

/*

	SEASON INFO

*/

function displaySeasonInfo(seriesName, id, number) {
	setLoadingState(true);

	MovieDB.tvSeasonInfo({id:id, season_number: number}, function(err, season) {
		if (err) {
			console.log(err);
		} else {
			fillSeasonInfo(season, seriesName);
			setLoadingState(false, $seasonInfoSection);
		};
	})
}

function fillSeasonInfo(seasonData, seriesName) {
	var $episodesList 	= $seasonInfoSection.find('#season-episodes'),
		$toClone 		= $episodesList.find('.season-episode').clone();
	console.log(seasonData)
	$seasonInfoSection.find('.season-title-big').html(seasonData.name+'<small class="season-year"></small>');
	$seasonInfoSection.find('.season-year').html(seasonData.air_date ? seasonData.air_date.split('-')[0] : '');
	$seasonInfoSection.find('.season-poster').attr('src', largeImageBaseUrl+seasonData.poster_path);
	$episodesList.empty();
	for (var i = 0; i < seasonData.episodes.length; i++) {
		
		$episodesList.append(fillEpisodeCard($toClone, seasonData.episodes[i], seasonData.season_number, seriesName));
	};
}

function fillEpisodeCard($toClone, episodeData, seasonNumber, seriesName) {
	var cloneData = {
			'number': episodeData.episode_number,
			'title': episodeData.name,
			'plot': episodeData.overview
		},
		$clone = cloneAndFill($toClone, cloneData, '.episode');

	$clone.find('.episode-play').attr('data-search', seriesName+' S'+pad(seasonNumber, 2)+'E'+pad(episodeData.episode_number, 2));
	$clone.find('.episode-play').on('click', function(e) {
		setLoadingState(true);

		var $toClone = $('#torrents .torrent').first(),
			toSearch = $(this).attr('data-search');
			console.log(toSearch);
		searchTorrents(toSearch).then(function(results) {
			buildResultsList(results, $toClone.clone());
		}).catch(function(err){
			console.log('first try:',err);

			$loadingInfo.html('There seems to be a problem with The Pirate Bay, retrying...');
			setTimeout(function(){

				searchTorrents(toSearch).then(function(results) {
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

	return $clone;
}

/*

	TORRENT SELECT

*/

function searchTorrents(toSearch) {

	return ThePirateBay.search(toSearch, {
		category: 'video',
		page: 0,
		orderBy: 'seeds',
		order: 'desc'
	})
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
		$mediaPlayer.focus();
		MediaController.getController($mediaPlayer[0]);
	})
}