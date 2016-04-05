"use strict";

// These utility functions are just intended to help with e2e and unit tests

(function () {
	var SELF, testUtils, NS = "freeStyla";

    testUtils = {
        createEl: function(id, type, cls, skipTest, container) {

            if(!id) id = SELF.getUID();
            if(!type) type = "div";

            var el = document.createElement(type);
            el.setAttribute("id", id);

            if(!container) container = document.body;

            container.appendChild(el);

            el = document.getElementById(id);

            if(cls) el.classList.add(cls);

            // just checking element was created
            if(!skipTest) expect(el.getAttribute("id")).toBe(id);

            return el;
        }

        // el can be an ID as well as an actual DOM element
        , cleanupElement: function(el) {
            if(typeof el === "string") el = document.getElementById(el);
            el.parentElement.removeChild(el);
        }


        , getUID: function(pref) {
            var uid = (pref || "") + Math.random().toString().replace(".", "");

            // ensure starts with a letter, as CSS class names should not start with a number
            var firstChar = uid.substr(0,1);
            if( parseInt(firstChar).toString() !== "NaN" ) uid = "a-"+uid;

            return uid;
        }

        , cleanUpGlobals: function() {
            if(window.freeStyla && window.freeStyla.glb) {
                
                window.freeStyla.glb.wgCSSLoaded = [];
            }
        }

    }
	
	SELF = window.testUtils = testUtils;
})();

