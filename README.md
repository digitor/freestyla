# nimblecss
This library is a WIP. Will update description when it's ready.

## Description
A dynamic CSS loader that scans the page for data attributes and loads CSS modules as they are required. Suitable for large web apps that require a fast initial loading time (mainly above the fold), while loading subsequent CSS modules asynchronously and concurrently.

## Demos
To view working demos, run `gulp webserver-for-dev` and in the browser navigate to "http://localhost:8080/demos/" and open the html files.
You will need to have done an `npm install` first and have NodeJS installed.

## Dependencies
- LoadCSS: Using a fork of 'https://github.com/filamentgroup/loadCSS', located at 'https://github.com/digitor/loadCSS/tree/feature/phantomjs-onload'
- jQuery 0.2.x (tested against 2.2.1, but will likely work with ealier versions - this dependency may be removed in future)
- LoDash (2.4.1, may break in newer versions)
- ClassList polyfill (for IE9 - this can be omitted if you don't care about IE9 support)


## Tests
Tests are separated into unit tests and end to end tests. Unit tests do not require the browser (namely the window object).