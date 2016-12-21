const isProduction 		= true;

var BinPath;

if (isProduction) {

	BinPath = require('path').join(__dirname, '../../../app.asar.unpacked/node_modules/wcjs-prebuilt/bin/WebChimera.js.node');

} else {

	BinPath = 'wcjs-prebuilt';
}

const FileSystem		= require('fs');
const ElectronApp 		= require('electron').remote.app;
const ThePirateBay 		= require('thepiratebay');
const WebTorrent 		= require('webtorrent');
const WCJS_Player		= require('wcjs-player');
const WCJS_Prebuilt 	= require(BinPath);
const MovieDB 			= require('moviedb')('bca1b28150defdd6e20032c1cfcb36ae');
const Settings 			= require('./settings.js');
const Subtitles 		= require('./subtitles.js');
const Keybindings 		= require('wcjs-keybindings');

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
	$seasonPlayBtn 		= $('#season-play'),
	$genresSection		= $('#genres'),
	$actorsSection		= $('#actors'),
	$actorInfoSection 	= $('#actor-info'),
	$favouritesSection	= $('#favourites'),
	$settingsSection	= $('#settings'),
	$settingsSubmit 	= $('#settings-submit'),
	$searchTorrents 	= $('#movie-search-torrents'),
	$torrentSection 	= $('#torrents'),
	$playerSection 		= $('#player'),
	$mediaPlayer		= $('#mediaPlayer'),
	$torrentsList 		= $('#torrents-list'),
	$moviesList 		= $('#movies-list'),
	$loadingSection 	= $('#loading'),
	$loadingInfo		= $('#loading-info'),
	$_currentPage,
	WebTorrentClient,
	WebTorrentServer,
	VLCPlayer,
	ApplicationSettings;

setTimeout(function() {
	
	// Load initial UI
	$controlSection.addClass('active');
	$homeSection.addClass('active');

	// Bind initial page
	$_currentPage = $homeSection;

	// Autofocus on search field for smooth experience
	$search.focus();

	Settings.read('appSettings', function(settings) {

		if (settings) {

			ApplicationSettings = settings;

		} else {

			ApplicationSettings = {
				autosearch		: true,
				keeptorrents	: false,
				showadult 		: false
			}

			Settings.write('appSettings', ApplicationSettings, function(){/*empteh*/});
		}
	})

}, 200);

/***************** NAV  ***********************/

$navSearch.on('click', function(e) {
	jumpToPage($homeSection);
	$navToggle.trigger('click');
	$_currentPage = $homeSection;
});

$navTop.on('click', function(e) {
	getTopMovies($_currentPage);
	$navToggle.trigger('click');
	$_currentPage = $moviesSection;
});

$navLatest.on('click', function(e) {
	getLatestMovies($_currentPage);
	$navToggle.trigger('click');
	$_currentPage = $moviesSection;
});

$navGenres.on('click', function(e) {
	getMovieGenres($_currentPage);
	$navToggle.trigger('click');
	$_currentPage = $genresSection;
});

$navActors.on('click', function(e) {
	getActorSearch($_currentPage);
	$navToggle.trigger('click');
	$_currentPage = $actorsSection;
});

$navFavourites.on('click', function(e) {
	getFavourites($_currentPage);
	$navToggle.trigger('click');
	$_currentPage = $favouritesSection;
});

$navPlayer.on('click', function(e) {
	jumpToPage($playerSection);
	$navToggle.trigger('click');
	$_currentPage = $playerSection;
});

$navSettings.on('click', function(e) {
	openSettings($_currentPage);
	console.log(ApplicationSettings);
	$navToggle.trigger('click');
	$_currentPage = $settingsSection;
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
			buildMediaList(res.results, $toClone.first().clone(), false, 'Results for "'+movieToSearch+'"', $_currentPage);
		};
	})
});

$random.on('click', function(e) {
	getRandomMovie($homeSection);
});

$top.on('click', function(e) {
	getTopMovies($homeSection);
});

$latest.on('click', function(e) {
	getLatestMovies($homeSection);
});



/******************* SETTINGS *********************/


$settingsSubmit.on('click', saveSettings);
$settingsSection.find('input').on('change', function() {
	if ($(this).attr('type') === 'checkbox') {

		if ($(this).prop('checked')) {
		
			$(this).parent().parent().find('.setting-subsection').slideDown();
		
		} else {

			$(this).parent().parent().find('.setting-subsection').slideUp();
		}
	}
});
$settingsSection.find('#btn-keeptorrentsdir').on('click', function(){
	$settingsSection.find('#setting-keeptorrentsdirselect').trigger('click').on('change', function(){
		$settingsSection.find('#setting-keeptorrentsdir').val($(this)[0].files[0].path);
	})
})

function openSettings(returnPage) {
	setLoadingState(true);
	bindReturnPage($settingsSection.find('.back-btn'), returnPage);
	updateSettingsDisplay(ApplicationSettings);
	setLoadingState(false, $settingsSection);
}

function updateSettingsDisplay(settings) {
	for (key in settings) {
		var $input 	= $settingsSection.find('#setting-'+key),
			type 	= $input.attr('type'),
			$sub 	= (type === 'checkbox') ? $input.parent().parent().find('.setting-subsection') : false;

		if (type === 'checkbox') {

			$input.prop('checked', settings[key]);

			if ($sub.length) {

				if (settings[key]) {
					
					$sub.slideDown();

				} else {
					
					$sub.slideUp();
				}
			};

		} else if (type === 'text') {

			$input.val(settings[key]);
		}
	}
}

function saveSettings() {

	var $inputs = $settingsSection.find('input');
	setLoadingState(true);

	$inputs.each(function() {

		var key 	= $(this).attr('id').replace('setting-', ''),
			type 	= $(this).attr('type'),
			value 	= (type === 'checkbox') ? $(this).prop('checked') : $(this).val();

		ApplicationSettings[key] = value;

		Settings.write('appSettings', ApplicationSettings, function(r) {
			updateSettingsDisplay(ApplicationSettings);
			setLoadingState(false, $settingsSection);
		})
	})
}



/******************* MEDIA INFO *******************/


$searchTorrents.on('click', doTorrentSearch);

$seasonPlayBtn.on('click', doTorrentSearch);



/*

	HELPERS

*/

function doTorrentSearch() {

	setLoadingState(true);

	var toSearch = $(this).attr('data-play');

	searchTorrents(toSearch).then(function(results) {
		
		searchOrAutoplay(results, $_currentPage);

	}).catch(function(err){
		console.log('first try:',err);

		$loadingInfo.html('There seems to be a problem with The Pirate Bay, retrying...');
		setTimeout(function(){

			searchTorrents(toSearch).then(function(results) {

				searchOrAutoplay(results, $_currentPage);
				$loadingInfo.html('This may take a few seconds'); //reset

			}).catch(function(err){
				console.log('retry:', err);

				$loadingInfo.html('The server seems to be down, try again in a few!<br>Cancelling search...');
				setTimeout(function(){
					setLoadingState(false, $_currentPage);
					$loadingInfo.html('This may take a few seconds'); //reset
				}, 2000);
			});
		}, 3000);
	});
}


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
		genreObjs 	= getMediaGenres(genres),
		alreadyUsed = [];

	for (var i = 0; i < genreObjs.length; i++) {
		var $item 		= $('<span class="genre-item">'),
			isUnique 	= (alreadyUsed.indexOf(genreObjs[i].id) === -1);

		if (isUnique) {
		
			$item.attr('data-genreid', genreObjs[i].id);
			$item.text(genreObjs[i].name);
			$item.on('click', function(e) {
				var genreId = $(this).attr('data-genreid');
				setLoadingState(true);
				MovieDB.genreMovies({id: genreId}, function(err, res) {
					if (err) {
						console.log(err);
						MovieDB.genreTv
					} else {
						buildMediaList(res.results, $('#movies .movie').first().clone(), 'movie');
					};
				})
			})

			$genreList.append($item);
			alreadyUsed.push(genreObjs[i].id);
		}
	};

	return $genreList;
}

function getMediaCredits(credits) {
	var creditsList = {
		'director': [],
		'writer': [],
		'cast': []
	};
	if (credits.crew && credits.crew.length) {
		credits.crew.forEach(function(c){
			if (c.job === 'Director') creditsList.director.push(c.name);
			if (c.job === 'Writer') creditsList.writer.push(c.name);
		});
	}
	if (credits.cast && credits.cast.length) {
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

	MENU ACTIONS

*/


function getRandomMovie(returnPage) {
	var randomId;
	setLoadingState(true);
	// FYI: in case you ever want to extend, real max for series ids is 48988 (+1)
	randomId = Math.round(Math.random() * (419770 - 1) + 1); //max incremented to include real max.
	
	while (!displayMovieInfo(randomId, returnPage, true)) {
		//recalc and hope for the best
		randomId = Math.round(Math.random() * (419770 - 1) + 1);
	}
}

function getTopMovies(returnPage) {
	setLoadingState(true);
	MovieDB.miscPopularMovies(function(err, res) {
		if (err) {
			console.log(err);
		} else {
			buildMediaList(res.results, $('#movies .movie').first().clone(), 'movie', 'Most Popular Movies', returnPage);
		}
	})
}

function getLatestMovies(returnPage) {
	setLoadingState(true);
	MovieDB.miscNowPlayingMovies(function(err, res) {
		if (err) {
			console.log(err);
		} else {
			buildMediaList(res.results, $('#movies .movie').first().clone(), 'movie', 'Latest Movies', returnPage);
		}
	})
}

function getMovieGenres(returnPage) {
	var combinedGenres,
		uniqueGenres;

	setLoadingState(true);
	MovieDB.genreMovieList(function(err, res) {
		if (err) {
			console.log(err);
		} else {
			$('#genres #genre-list').html(listMediaGenres(res.genres));
			setLoadingState(false, $genresSection);
		}
	})
}

function getActorSearch(returnPage) {
	setLoadingState(true);
	MovieDB.personPopular(function(err, res) {
		if (err) {
			console.log(err);
		} else {
			buildActorList(res.results, $('#actors .actor').first(), null, returnPage);
			$actorsSection.find('#actor-search').on('submit', function(e) {
				e.preventDefault();
				setLoadingState(true);
				var search = $(this).find('#actor-search-input').val();
				searchForActor(search, returnPage);
			})
		}
	})
}

function searchForActor(query, returnPage) {
	MovieDB.searchPerson({query: query}, function(err, res) {
		if (err) {
			console.log(err);
		} else {
			buildActorList(res.results, $('#actors .actor').first(), null, returnPage);
		}
	})
}



/*

	ACTOR SEARCH

*/


function buildActorList(actors, $toClone, title, returnPage) {
	
	var $list 	= $('#actors-list');
	
	$list.empty();
	bindReturnPage($actorsSection.find('.back-btn'), returnPage);
	
	for (var i = 0; i < actors.length; i++) {
		var data = {
			name: actors[i].name,
			id: actors[i].id,
			profile: actors[i].profile_path
		};
		$list.append(fillActorCard(data, $toClone.clone()));
	};

	setLoadingState(false, $actorsSection);
}

function fillActorCard(actor, $clone) {
	$clone.find('.actor-name').html(actor.name);
	$clone.find('.actor-profile').attr('src', smallImageBaseUrl+actor.profile);
	$clone.attr('data-id', actor.id);
	$clone.on('click', function(e) {
		setLoadingState(true);
		displayActorInfo($(this).attr('data-id'), $_currentPage);
	});
	return $clone;
}

function displayActorInfo(id, returnPage) {
	MovieDB.personInfo({id: id}, function (err, res) {
		if (err) {
			console.log(err);
		} else {
			fillActorInfo(res, returnPage);
		}
	})

	setLoadingState(false, $actorInfoSection);
}

function fillActorInfo(actor, returnPage) {
	bindReturnPage($actorInfoSection.find('.back-btn'), returnPage);
	$_currentPage = $actorInfoSection;
	$actorInfoSection.find('.actor-profile').attr('src', largeImageBaseUrl+actor.profile_path);
	$actorInfoSection.find('.actor-name').html(actor.name);
	$actorInfoSection.find('.actor-biography').html(actor.biography);
	$actorInfoSection.find('.actor-born').html(actor.birthday ? actor.birthday.split('-')[0] : '');
	$actorInfoSection.find('.actor-dead').html(actor.deathday ? actor.deathday.split('-')[0] : '');
	$actorInfoSection.find('#actor-credits-find').on('click', function(e) {
		var combinedCredits = [];

		e.preventDefault();
		setLoadingState(true);
		MovieDB.personCombinedCredits({id: actor.id}, function(err, res) {
			if (err) {
				console.log(err);
			} else {
				if (res.cast.length) {
					combinedCredits = combinedCredits.concat(res.cast);
				}
				if (res.crew.length) {
					combinedCredits = combinedCredits.concat(res.crew);
				}
				buildMediaList(combinedCredits, $('#movies .movie').first().clone(), false, 'Results for '+actor.name, $actorInfoSection);
			}
		})
	})
}



/*

	MOVIE SELECT

*/


function buildMediaList(media, $toClone, forceType, title, returnPage) {

	var title = title ? title : 'Choose media';

	$moviesList.empty();
	$_currentPage = $moviesSection;

	for (var i = 0; i < media.length; i++) {

		if ((media[i].media_type === 'movie') || (forceType === 'movie')) {
			$moviesList.append(fillMovieCard(media[i], $toClone, $_currentPage));
		} else if ((media[i].media_type === "tv") || (forceType === 'tv')) {
			$moviesList.append(fillSeriesCard(media[i], $toClone, $_currentPage));
		} 
	}

	setPageTitle($moviesSection, title);
	bindReturnPage($moviesSection.find('.back-btn'), returnPage);

	setLoadingState(false, $moviesSection);
}

function fillMovieCard(movie, $cloneElement, returnPage) {
	if (!movie.poster_path || (movie.poster_path === null) || !movie.release_date) return;
	return fillCard($cloneElement, movie.title, movie.release_date.split('-')[0], movie.id, movie.poster_path, '.movie', displayMovieInfo, returnPage);
}

function fillSeriesCard(series, $cloneElement, returnPage) {
	if (!series.poster_path || (series.poster_path === null) || !series.first_air_date) return;
	return fillCard($cloneElement, series.name, series.first_air_date.split('-')[0], series.id, series.poster_path, '.movie', displaySeriesInfo, returnPage);
}



/*

	MOVIE INFO

*/


function displayMovieInfo(id, returnPage, randomId) {
	var failed = false,
		random = randomId ? randomId : false;

	setLoadingState(true);
	$_currentPage = $movieInfoSection;
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
	$_currentPage = $movieInfoSection;

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
	$searchTorrents.attr('data-play', movieData.title+' '+movieData.release_date.split('-')[0]); // Identify by title+year for easy torrent search
}



/*
	
	SERIES INFO

*/


function displaySeriesInfo(id, returnPage) {

	setLoadingState(true);
	$_currentPage = $seriesInfoSection;
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
	$_currentPage = $seasonInfoSection;
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
		$toClone 		= $episodesList.find('.season-episode').first().clone(),
		name 			= seriesName + ' Season ' + seasonData.season_number;
	
	bindReturnPage($seasonInfoSection.find('.back-btn'), returnPage);
	$seasonInfoSection.find('#season-play').attr('data-play', name);
	$seasonInfoSection.find('.season-title').html(name);
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

function buildResultsList(results, returnPage) {
	
	var $toClone = $('#torrents .torrent').first().clone(),
		displayLength = 10,
		loopLength;

	$_currentPage = $torrentSection;
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
		$torrentsList.html('<h1>No torrents found.</h1>');
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

		webTorrentStream($(this).data('magnet'));
	});

	return $clone;
}

function searchOrAutoplay(results, returnPage) {

	if (ApplicationSettings.autosearch) {

		autoPlay(results);
	
	} else {

		buildResultsList(results, returnPage);
	}
}



/*

	STREAMING

*/

function getSizeInMBs(filesize) {

	var conversionTable = {
		'MiB' : 1,
		'GiB' : 1024
	};

	for (unit in conversionTable) {

		if (filesize.indexOf(unit) !== -1) {

			filesize.replace(unit, '');
			filesize = parseInt(filesize);
			filesize = filesize * conversionTable[unit];
			
			return filesize;
		}
	}
}

function autoPlay(results) {

	var maxFileSize = ApplicationSettings.autosearchmaxsize || 0,
		finalResult;

	if ((!maxFileSize) || (maxFileSize === 0)) {

		finalResult = results[0].magnetLink;
	
	} else {

		for (var i = 0; i < results.length; i++) {
			
			if (getSizeInMBs(results[i].size) <= maxFileSize) {

				finalResult = results[i].magnetLink;
				break;
			}
		}
	}

	webTorrentStream(finalResult);
}


function findMediaIDs(files) {

	var mediaIDs = [];

	for (var i = 0; i < files.length; i++) {
		
		var fileSize 		= files[i].length,
			fileNameParts 	= files[i].name.split('.'),
			lastPart 		= fileNameParts.length - 1,
			fileExtension 	= fileNameParts[lastPart],
			mediaExtensions = ['avi', 'mp4', 'm4a', 'wmv', 'webm', 'ogg', 'mkv'],
			fileIsMedia		= (mediaExtensions.indexOf(fileExtension) !== -1);

		if (fileIsMedia) {

			mediaIDs.push({
				index: i,
				name: files[i].name,
				size: fileSize
			});
		}
	};

	return mediaIDs;
}

function webTorrentStream(magnetLink, torrentName, nextInSeries) {

	WebTorrentClient = null;
	
	if (WebTorrentServer && WebTorrentServer.close) {

		WebTorrentServer.close();
	}

	WebTorrentServer = null;
	
	setLoadingState(true);

	WebTorrentClient = new WebTorrent({maxConns: 1000});
	
	WebTorrentClient.add(magnetLink, function(torrent) {

		var files 	= torrent.files,
			media 	= findMediaIDs(files),
			port 	= '1337',
			address = 'http://localhost:'+port+'/';

		WebTorrentServer = torrent.createServer();
		WebTorrentServer.listen(port);

		VLCPlayer = injectVLC('#player');

		media.sort(function(a,b) {
			if (a.name > b.name) return 1;
			if (a.name < b.name) return -1;
			return 0;
		}).forEach(function(mediaElement) {

			var mediaUrl 	= address+mediaElement.index,
				fileSize 	= mediaElement.size;

			var subtitlesWorkingProbably = false;

			if (!subtitlesWorkingProbably) {

				VLCPlayer.addPlaylist({
					url: address+mediaElement.index,
					title: mediaElement.name
				});

			} else {

				Subtitles.getSubtitles(mediaElement.name, fileSize, languages.join(','), function(subtitlesLibrary) {

					console.log(subtitlesLibrary)

					if (!subtitlesLibrary) {

					} else {

						VLCPlayer.addPlaylist({
							url: address+mediaElement.index,
							title: mediaElement.name,
							subtitles: subtitlesLibrary
						});
						VLCPlayer.subtitles(true);
					}
				})
			}
		});

		setLoadingState(false, $playerSection);
	})
}

function injectVLC(container) {
	var config = {
			wcjs: WCJS_Prebuilt,
			autoplay: true,
			titleBar: "none"
		},
		WCJS = new WCJS_Player(container),
		player = WCJS.addPlayer(config);
		Keybindings.getController(player);
		player.playlist(true);

	return player;
}