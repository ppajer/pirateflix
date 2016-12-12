# PirateFlix - Stream movies on your desktop!

## User notes

> ### Alpha version
> Currently, PirateFlix is in Alpha. Once a stable Beta release is available, executable files will be available for downoad. Until then, the software changes too rapidly to provide 
> installers for every minor version, so only the source files are available for download. Check the [developer notes](#development-notes) for instructions on building the app from source 
> if you want to use it before Beta.

PirateFlix is a torrent streaming client for the desktop. It acts as a region-independent and free alternative to NetFlix for those who want to binge watch their favourite movies without being born in the right country or forking over precious cash. PirateFlix is designed with an open-source philosophy from the ground up, meaning that everything in it is built, maintained and editable by the community, including the movie database behind it, the media files and the source code itself.

PirateFlix is built on the following libraries:
- **moviedb**: a node API for accessing TMDB data. Media information is fetched from here.
- **thepiratebay**: a node API for thepiratebay.org. Torrents are fetched from here.
- **webtorrent**: a node based torrent client that allows lightning-fast file streaming
- **webchimera.js**: everyone's favourite video player - VLC - in a javascript wrapper!

### Features

#### Browse the latest and most popular movies

PirateFlix allows you to conveniently check the most recently released movies right from the dashboard. You can also query the most popular movies around the world, or if you just want to watch something, watch a random movie - It's a great way to discover new things you didn't even think you like!

#### Search movies and series

Simply type the name of the movie or series you want to watch and PirateFlix will fetch all media related to your search. Searches are powered by TMDB's open media database through an API in real time, so what you see on your screen is always up-to-date. Data returned includes the media's title, release year, director, writers, cast, genres and plot. You can also search for different movies and series by the following parameters:

- top movies
- latest movies
- movies by actor
- movies by director
- movies by genre

#### Stream media

Once you have found the movie or series episode of your choice, PirateFlix automatically searches torrents for your media and starts streaming them right away. If you wish, you can select a different torrent for the given search if you don't like the first one for any reson. *Playback start may take from a few seconds up to a minute depending on your internet connection, media quality and availability.*

> #### Important
> Torrent searches are limited by the availability of ThePirateBay. If your searches fail repeatedly, check your internet connection and the online status of thepiratebay.se:
> if any of them are down, torrent searches are going to keep failing. Alternative torrent sources are currently being looked into as a fallback strategy to increase the reliability
> of torrent searches.

#### Customize the way you watch movies

Choose whether you want to decide on the torrent to use for each movie and series, or let PirateFlix handle the decision for you. You can set the maximum size of downloaded torrents, whether to keep them around after watching or not, and the display of adult content in your results.

### Roadmap

PirateFlix will be updated with more features in the following weeks, including:

- multilingual subtitles
- a fallback strategy for when torrent providers are unavailable
- keep track of your favourite shows

## Development notes

The build process is handled by NPM and the electron-builder package. To use the application, download this repository, run `npm install` against it, then `npm start` to launch in development mode. To package and compile the app into an executable, run `npm run-script pack` or `npm run-script dist` respectively. Currently only NSIS installers are supported by default, but you can add any installer support to it and make a pull request if you want.

> #### Important note for win32
> Due to the limitations of file path lengths on win32, asar packaging needs to be enabled when building for this platform. This however doesn't play well with embedded binaries, so when 
> packaging the app, the `wcjs-prebuilt` module needs to be kept in an unpacked folder, and the relative paths adjusted accordingly. To do so, set the `isProduction` flat to `true` at the 
> top of both `main.js` and `renderer.js` files.