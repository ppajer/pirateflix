# PirateFlix

PirateFlix is a torrent streaming client for the desktop. It acts as a region-independent and free alternative to NetFlix for those who want to binge watch their favourite movies without being born in the right country or forking over precious cash.

PirateFlix is built on the following libraries:
- **moviedb**: a node API for accessing TMDB data. Media information is fetched from here.
- **thepiratebay**: a node API for thepiratebay.org. Torrents are fetched from here.
- **peerflix**: a torrent streaming engine for node. 

## Features

### Search movies and series

Simply type the name of the movie or series you want to watch and PirateFlix will fetch all media related to your search. Data returned includes the media's title, release year, director, writers, cast, genres and plot.

### Browse series seasons and episodes

If your search is related to a tv series, PirateFlix will fetch all of its seasons. You can then browse these seasons to find out more about them or list their episodes, including pilots, special episodes and hidden seasons.

### Stream media

Once you have found the movie or series episode of your choice, PirateFlix automatically searches torrents for your media and starts streaming them right away. *Playback start may take from a few seconds up to a minute depending on your internet connection, media quality and availability.*

## Roadmap

PirateFlix will be updated with more features in the following weeks, including:
- actor searches
- genre searches
- director searches
- top movies