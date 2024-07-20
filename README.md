# Spotify+

Spotify+ is a mobile application that uses the Spotify API to do some cool
things with a user's music library. See more information below.

![GitHub Created At](https://img.shields.io/github/created-at/willemw-01/spotifyplus)
![GitHub last commit](https://img.shields.io/github/last-commit/willemw-01/spotifyplus)
![GitHub commit activity](https://img.shields.io/github/commit-activity/t/willemw-01/spotifyplus)

![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/willemw-01/spotifyplus)
![Lines of code](https://tokei.rs/b1/github/willemw-01/spotifyplus)
[![](https://tokei.rs/b1/github/XAMPPRocky/tokei?category=lines)](https://github.com/willemw-01/tokei).

## Demo

https://github.com/user-attachments/assets/c99918b1-a6c6-4784-a697-8da8cc8db15d

## Installation

These instructions will get you a copy of the project up and running on your
local machine for development and testing purposes.

1. To run this project, you'll need to have `Node.js` and `npm` installed on
   your machine. You can download Node.js and npm from the official website:
   https://nodejs.org

2. Clone the repository

```bash
$ git clone git@github.com:WillemW-01/spotifyplus.git
```

3. Install dependencies

```bash
$ cd spotify-plus
$ npm install
```

4. Start the development server (use one of the two).

```bash
$ npx expo start
$ npx expo start --tunnel
```

5. If using Expo Go, open Expo Go and select the running dev server. You are
   ready to use the application.

## Background

The Spotify API can return interesting information about every song in their
catalogue. Examples of this include how acoustic a song sounds, how much energy
it has, the key it is predicted to be in, how much spoken word is in it, etc.

The idea behind this app is to harness this information in some interesting
ways:

1. You will be able to play songs of a certain mood from _your own music_. There
   are playlists available from Spotify for different moods, but it's not all
   your music.
1. You will be able to see your songs in a graph (network) view, where tracks
   will be connected to each other based on certain metrics (e.g. artist, genre,
   etc).

These are the first two features I plan to implement in this project. It will
not play Spotify directly, but rather control Spotify playback on the device.
