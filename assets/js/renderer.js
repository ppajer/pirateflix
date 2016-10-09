// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const ThePirateBay 		= require('thepiratebay');
const PeerFlix			= require('peerflix');
const MovieDB 			= require('moviedb')('bca1b28150defdd6e20032c1cfcb36ae');
const MediaController 	= require('./media-controls.js');

const smallImageBaseUrl = 'https://image.tmdb.org/t/p/w300_and_h450_bestv2';
const largeImageBaseUrl = 'https://image.tmdb.org/t/p/w600_and_h900_bestv2';

var $navToggle			= $('#btn-nav-toggle'),
	$sidebarNav			= $('#sidebar-nav'),
	$navSearch			= $('#sidebar-nav #btn-search'),
	$navTop				= $('#sidebar-nav #btn-top'),
	$navLatest			= $('#sidebar-nav #btn-latest'),
	$navGenres			= $('#sidebar-nav #btn-genres'),
	$navActors			= $('#sidebar-nav #btn-actors'),
	$navFavourites		= $('#sidebar-nav #btn-favourites'),
	$navPlayer 			= $('#sidebar-nav #btn-player'),
	$navSettings		= $('#sidebar-nav #btn-settings'),
	$searchForm 		= $('#main-search-form'),
	$searchSubmit 		= $('#main-search-submit'),
	$search 			= $('#main-search'),
	$top 				= $('#top-rated-movies'),
	$latest 			= $('#latest-movies'),
	$random 			= $('#random-movie'),
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

/***************** NAV  ***********************/

$navSearch.on('click', function(e) {
	jumpToPage($homeSection);
	$navToggle.trigger('click');
});

$navTop.on('click', function(e) {
	getTopMovies();
	$navToggle.trigger('click');
});

$navLatest.on('click', function(e) {
	getLatestMovies();
	$navToggle.trigger('click');
});

$navGenres.on('click', function(e) {
	getMovieGenres();
	$navToggle.trigger('click');
});

$navActors.on('click', function(e) {
	getActorSearch();
	$navToggle.trigger('click');
});

$navFavourites.on('click', function(e) {
	getFavourites();
	$navToggle.trigger('click');
});

$navPlayer.on('click', function(e) {
	jumpToPage($playerSection);
	$navToggle.trigger('click');
});

$navSettings.on('click', function(e) {
	openSettings();
	$navToggle.trigger('click');
});

/***************** HOME ***********************/

$searchForm.on('submit', function(e) {
	e.preventDefault();

	var $toClone 	= $('#movies .movie'),
		movieToSearch = $search.val();
	
	setLoadingState(true);

	MovieDB.searchMulti({query:movieToSearch}, function(err, res) {
		if (err) {
			console.log(err);
		} else{
			buildMediaList(res.results, $toClone.first().clone(), false, 'Results for "'+movieToSearch+'"', $homeSection);
		};
	})
});

$random.on('click', getRandomMovie);
$top.on('click', getTopMovies);
$latest.on('click', getLatestMovies);

/******************* MEDIA INFO *******************/

$searchTorrents.on('click', function(e) {

	setLoadingState(true);

	var $toClone = $('#torrents .torrent'),
		toSearch = $searchTorrents.attr('data-movietitle');

	searchTorrents(toSearch).then(function(results) {
		buildResultsList(results, $toClone.first().clone(), $movieInfoSection);
	}).catch(function(err){
		console.log('first try:',err);

		$loadingInfo.html('There seems to be a problem with The Pirate Bay, retrying...');
		setTimeout(function(){

			searchTorrents(toSearch).then(function(results) {
				buildResultsList(results, $toClone.first().clone(), $movieInfoSection);
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

function fillCard($cloneElement, name, year, id, poster, selector, onclick, returnPage) {
	if (parseInt(year) > new Date().getFullYear()) return;
	var cloneData = {
		'title': name,
		'year': year
	},
	$clone = cloneAndFill($cloneElement, cloneData, selector);
	$clone.find(selector+'-poster').attr('src', smallImageBaseUrl+poster);
	$clone.attr('data-id', id);
	$clone.on('click', function(e) {
		onclick($(this).attr('data-id'), returnPage);
	});
	return $clone;
}

function getMediaGenres(genres) {
	var genreList = [];
	genres.forEach(function(genre) {
		genreList.push({name: genre.name, id: genre.id});
	});
	return genreList;
}

function listMediaGenres(genres) {
	var $genreList 	= $('<div class="genre-list">'),
		genreObjs 	= getMediaGenres(genres);

	for (var i = 0; i < genreObjs.length; i++) {
		var $item = $('<span class="genre-item">');
		
		$item.attr('data-genreid', genreObjs[i].id);
		$item.text(genreObjs[i].name);
		$item.on('click', function(e) {
			var genreId = $(this).attr('data-genreid');
			setLoadingState(true);
			MovieDB.genreMovies({id: genreId}, function(err, res) {
				if (err) {
					console.log(err);
				} else {
					console.log(res);
					buildMediaList(res.results, $('#movies .movie').first().clone(), 'movie');
				};
			})
		})

		$genreList.append($item);
	};

	return $genreList;
}

function getMediaCredits(credits) {
	var creditsList = {
		'director': [],
		'writer': [],
		'cast': []
	};
	if (credits.crew.length) {
		credits.crew.forEach(function(c){
			if (c.job === 'Director') creditsList.director.push(c.name);
			if (c.job === 'Writer') creditsList.writer.push(c.name);
		});
	}
	if (credits.cast.length) {
		for (var i = 0; i < 5; i++) {
			if (credits.cast[i] && credits.cast[i].name) creditsList.cast.push(credits.cast[i].name);
		};
	}

	return creditsList;
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function jumpToPage($page) {
	$('.active').not('#controls').removeClass('active');
	setLoadingState(false, $page);
}

function bindReturnPage($btn, $page) {
	var $page = $page ? $page : $homeSection;
	$btn.off('click');
	$btn.on('click', function(e) {
		jumpToPage($page);
	});
}

function setPageTitle($page, title) {
	$page.find('h1').text(title);
}

/*

	LISTINGS

*/

function getRandomMovie() {
	var randomId;
	setLoadingState(true);
	// FYI: in case you ever want to extend, real max for series ids is 48988 (+1)
	randomId = Math.round(Math.random() * (419770 - 1) + 1); //max incremented to include real max.
	console.log(randomId)
	while (!displayMovieInfo(randomId, $homeSection, true)) {
		//recalc and hope for the best
		randomId = Math.round(Math.random() * (419770 - 1) + 1);
	}
}

function getTopMovies() {
	setLoadingState(true);
	MovieDB.miscPopularMovies(function(err, res) {
		if (err) {
			console.log(err);
		} else {
			console.log(res);
			buildMediaList(res.results, $('#movies .movie').first().clone(), 'movie', 'Most Popular Movies', $homeSection);
		}
	})
}

function getLatestMovies() {
	setLoadingState(true);
	MovieDB.miscNowPlayingMovies(function(err, res) {
		if (err) {
			console.log(err);
		} else {
			console.log(res);
			buildMediaList(res.results, $('#movies .movie').first().clone(), 'movie', 'Latest Movies', $homeSection);
		}
	})
}

/*

	MOVIE SELECT

*/

function buildMediaList(media, $toClone, forceType, title, returnPage) {

	var title = title ? title : 'Choose media';

	$moviesList.empty();

	for (var i = 0; i < media.length; i++) {

		if ((media[i].media_type === 'movie') || (forceType === 'movie')) {
			$moviesList.append(fillMovieCard(media[i], $toClone, $moviesSection));
		} else if ((media[i].media_type === "tv") || (forceType === 'tv')) {
			$moviesList.append(fillSeriesCard(media[i], $toClone, $moviesSection));
		} 
	}

	setPageTitle($moviesSection, title);
	bindReturnPage($moviesSection.find('.back-btn'), returnPage);

	setLoadingState(false, $moviesSection);
}

function fillMovieCard(movie, $cloneElement, returnPage) {
	if (!movie.poster_path || (movie.poster_path === null)) return;
	return fillCard($cloneElement, movie.title, movie.release_date.split('-')[0], movie.id, movie.poster_path, '.movie', displayMovieInfo, returnPage);
}

function fillSeriesCard(series, $cloneElement, returnPage) {
	if (!series.poster_path || (series.poster_path === null)) return;
	return fillCard($cloneElement, series.name, series.first_air_date.split('-')[0], series.id, series.poster_path, '.movie', displaySeriesInfo, returnPage);
}

/*

	MOVIE INFO

*/

function displayMovieInfo(id, returnPage, randomId) {
	var failed = false,
		random = randomId ? randomId : false;

	setLoadingState(true);
	MovieDB.movieInfo({id: id}, function(err, movie) {
		if (err) {
			console.log(err);
			failed = true;
			if (random) {
				$random.trigger('click');
			};
		} else {

			MovieDB.movieCredits({id: movie.id}, function(err, credits) {
				if (err) {
					console.log(err);
					failed = true;
				} else {
					fillMovieInfo(movie, credits, returnPage);
					setLoadingState(false, $movieInfoSection);
				}
			})
		}
	});

	return !failed;
}

function fillMovieInfo(movieData, creditsData, returnPage) {
	var genres 		= listMediaGenres(movieData.genres),
		credits 	= getMediaCredits(creditsData),
		$returnBtn 	= $movieInfoSection.find('.back-btn');

	bindReturnPage($returnBtn, returnPage);

	$movieInfoSection.find('.movie-title').html(movieData.title);
	$movieInfoSection.find('.movie-year').html(movieData.release_date.split('-')[0]);
	$movieInfoSection.find('.movie-genre').html(genres);
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

function displaySeriesInfo(id, returnPage) {

	setLoadingState(true);
	MovieDB.tvInfo({id: id}, function(err, series) {
		if (err) {
			console.log(err);
		} else {
			MovieDB.tvCredits({id: id}, function(err, credits) {
				if (err) {
					console.log(err);
				} else {
					fillSeriesInfo(series, credits, returnPage);
					setLoadingState(false, $seriesInfoSection);
				};
			})
		};
	})
}

function fillSeriesInfo(seriesData, creditsData, returnPage) {
	var genres 		= listMediaGenres(seriesData.genres),
		credits 	= getMediaCredits(creditsData),
		$toClone 	= $seriesInfoSection.find('.series-season').first().clone();

	bindReturnPage($seriesInfoSection.find('.back-btn'), returnPage);

	$seriesInfoSection.find('#series-seasons').empty();
	$seriesInfoSection.find('.series-title').html(seriesData.name);
	$seriesInfoSection.find('.series-year').html(seriesData.first_air_date.split('-')[0]);
	$seriesInfoSection.find('.series-genre').html(genres);
	$seriesInfoSection.find('.series-director').html(credits.director.join(', '));
	$seriesInfoSection.find('.series-writer').html(credits.writer.join(', '));
	$seriesInfoSection.find('.series-actors').html(credits.cast.join(', '));
	$seriesInfoSection.find('.series-plot').html(seriesData.overview);
	$seriesInfoSection.find('.series-rating').html(seriesData.vote_average);
	$seriesInfoSection.find('.series-poster').attr('src', largeImageBaseUrl+seriesData.poster_path);
	seriesData.seasons.forEach(function(season) {
		$seriesInfoSection.find('#series-seasons').append(fillSeasonCard(seriesData.name, seriesData.id, season, $toClone, $seriesInfoSection));
	})
}

function fillSeasonCard(series, seriesId, season, $cloneElement, returnPage) {
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
		displaySeasonInfo($(this).attr('data-series'), $(this).attr('data-seriesid'), $(this).attr('data-seasonnumber'), returnPage);
	});
	return $clone;
}

/*

	SEASON INFO

*/

function displaySeasonInfo(seriesName, id, number, returnPage) {
	setLoadingState(true);
	MovieDB.tvSeasonInfo({id:id, season_number: number}, function(err, season) {
		if (err) {
			console.log(err);
		} else {
			fillSeasonInfo(season, seriesName, returnPage);
			setLoadingState(false, $seasonInfoSection);
		};
	})
}

function fillSeasonInfo(seasonData, seriesName, returnPage) {
	var $episodesList 	= $seasonInfoSection.find('#season-episodes'),
		$toClone 		= $episodesList.find('.season-episode').first().clone();
	
	bindReturnPage($seasonInfoSection.find('.back-btn'), returnPage);

	$seasonInfoSection.find('.season-title').html(seasonData.name);
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
			buildResultsList(results, $toClone.clone(), $seasonInfoSection);
		}).catch(function(err){
			console.log('first try:',err);

			$loadingInfo.html('There seems to be a problem with The Pirate Bay, retrying...');
			setTimeout(function(){

				searchTorrents(toSearch).then(function(results) {
					buildResultsList(results, $toClone.clone(), $seasonInfoSection);
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

function buildResultsList(results, $toClone, returnPage) {
	
	var displayLength = 10,
		loopLength;

	$torrentsList.empty();
	$torrentSection.find('.torrent-header').show();

	bindReturnPage($torrentSection.find('.back-btn'), returnPage);
	
	if (results && results.length) {
		loopLength = (results.length < displayLength) ? results.length : displayLength;
		for (var i = 0; i < loopLength; i++) {
			$torrentsList.append(fillResultsRow(results[i], $toClone));
		}
	} else {
		$torrentSection.find('.torrent-header').hide();
		$torrentsList.html('<h1>No torrents found.<br>Sorry <3</h1>');
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
		streamResult($(this).data('magnet'), $(this).parent().parent().find('.torrent-name').text()); //something more elegant? Please
	});

	return $clone;
}

/*

	STREAMING

*/

function streamResult(magnetLink, torrentName, nextInSeries) {

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

function awaitNextEpisode() {
	
}