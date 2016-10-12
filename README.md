# PirateFlix - 

PirateFlix is a torrent streaming client for the desktop. It acts as a region-independent and free alternative to NetFlix for those who want to binge watch their favourite movies without being born in the right country or forking over precious cash.

PirateFlix is built on the following libraries:
- **moviedb**: a node API for accessing TMDB data. Media information is fetched from here.
- **thepiratebay**: a node API for thepiratebay.org. Torrents are fetched from here.
- **peerflix**: a torrent streaming engine for node. 

## Features

### Browse the latest and most popular movies

PirateFlix allows you to conveniently check the most recently released movies right from the dashboard. You can also query the most popular movies around the world, or if you just want to watch something, watch a random movie - It's a great way to discover new things you didn't even think you like!

### Search movies and series

Simply type the name of the movie or series you want to watch and PirateFlix will fetch all media related to your search. Searches are powered by TMDB's open media database through an API in real time, so what you see on your screen is always up-to-date. Data returned includes the media's title, release year, director, writers, cast, genres and plot. You can also search for different movies and series by the following parameters:

- top movies
- latest movies
- movies by actor
- movies by director
- movies by genre

### Stream media

Once you have found the movie or series episode of your choice, PirateFlix automatically searches torrents for your media and starts streaming them right away. If you wish, you can select a different torrent for the given search if you don't like the first one for any reson. *Playback start may take from a few seconds up to a minute depending on your internet connection, media quality and availability.*

## Roadmap

PirateFlix will be updated with more features in the following weeks, including:

- season playlists
- AVI playback
- stream transcoding
- a better player
- sexy looks