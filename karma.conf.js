var os = require("os")

module.exports = function(config) {

  var platform = os.platform()
    , isWin = platform === "win32" // checks if you're on Windows (tested on Windows 10, 8.1 & 7)
    , isTravis = platform === "linux" // Tests assume that, if linux is the platform, you are running travis-ci, so only opens in Firefox.

  var browsers = ["Firefox"]; // FF runs on Travis without any additional tools needed

  if(!isTravis) browsers.push('Chrome', (isWin ? 'IE' : "Safari"));

  config.set({
  	browsers: browsers,
    frameworks: ['jasmine'],
    files: [
      'node_modules/jquery/dist/jquery.min.js',
      'src/lib/subtrees/loadcss/onloadCSS.js',
      'src/lib/subtrees/loadcss/loadCSS.js',
      'src/*.js',
      'spec/test-utils.js',
      'spec/e2e.js'
    ]
  });
};