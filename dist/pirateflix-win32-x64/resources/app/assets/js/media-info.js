function buildMediaList(media, $toClone, $target, forceType) {

	$target.empty();

	for (var i = 0; i < media.length; i++) {

		if ((media[i].media_type === 'movie') || (forceType === 'movie')) {
			$target.append(fillMovieCard(media[i], $toClone));
		} else if ((media[i].media_type === "tv") || (forceType === 'tv')) {
			$target.append(fillSeriesCard(media[i], $toClone));
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

module.exports.buildMediaList 	= buildMediaList;
module.exports.getMediaCredits  = getMediaCredits;
module.exports.listMediaGenres 	= listMediaGenres;
module.exports.fillCard 		= fillCard;