# freeStyla
This library is a WIP. Will update description when it's ready.

## Description
A dynamic CSS loader that scans the page for data attributes and loads CSS modules as they are required. Suitable for large web apps that require a fast initial loading time (mainly above the fold), while loading subsequent CSS modules asynchronously and concurrently.

## Demos
To view working demos, run `gulp webserver-for-dev` and in the browser navigate to "http://localhost:8080/demos/" and open the html files.
You will need to have done an `npm install` first and have NodeJS installed.

## Browser compatibility
- IE9 has been tested and it will fail to load &lt;link&gt; elements if there are more than 30 (need to confirm number), which is a problem for this library because it loads each file in a new &lt;link&gt; element. Possible solution, if you need IE9 support, is to use IE conditional comments to load all CSS files (you should probably combine them in your build script), then, in a script tag within the same IE conditional comment, set `window.freeStyla.glb.dynamicCSS = false`. This will ensure the public funtion `handleWgCSSLoad` returns your registered callbacks immediately, as the styles will have been loaded already.

## Gotchas
- If you're using any JS that measures pixels (eg a carousel library), you've got to initialize them after the CSS has loaded. You can use the public function `handleWgCSSLoad` to hook into this.

## Dependencies
- LoadCSS: Using a fork of 'https://github.com/filamentgroup/loadCSS', located at 'https://github.com/digitor/loadCSS/tree/feature/phantomjs-onload'
- jQuery 0.2.x (tested against 2.2.1, but will likely work with ealier versions - this dependency may be removed in future)
- LoDash (2.4.1, may break in newer versions)
- ClassList polyfill (for IE9 - this can be omitted if you don't care about IE9 support)


## Tests
Tests are separated into unit tests and end to end tests. Unit tests do not require the browser (namely the window object).