"use strict";

(function () {
	var SELF
      , nimbleCSS
      , NS = "nimbleCSS";

    nimbleCSS = {

        // set to true if you want warnings to not show up in console (useful for tests, as they can be a bit annoying)
        suppressWarnings: false

        }

        , testable: {
        	
        }

        // maybe useful variables
        , vars: {
            NS: NS
        }
    }

    // exposes library for browser and Node-based code (such as unit tests)
    if(typeof window === "undefined")   module.exports = nimbleCSS;
    else                                window.nimbleCSS = window.nimblecss = window.nimcss = window.nipplecss = window.nippleCSS = nimbleCSS;
    
    SELF = nimblePic;
})();

