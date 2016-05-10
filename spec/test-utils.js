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
            el.setAttribute("data-freestyla-el", "")

            if(!container) container = document.body;

            container.appendChild(el);

            el = document.getElementById(id);

            if(cls) el.classList.add(cls);

            // just checking element was created
            if(!skipTest) expect(el.getAttribute("id")).toBe(id);

            return el;
        }

        , createWg: function(id, cls, skipTest, container) {
            var el = SELF.createEl(id, null, cls, skipTest, container)
            el.classList.add('cssload-hide');
            el.setAttribute("data-freestyla-wg", "")
            return el;
        }

        // should satisfy 'freeStyla.validateJQueryEl'. Useful for unit tests that don't need DOM, but have a jQuery element in them
        , getFakeJQueryEl: function() {
            return {
                jquery: true,
                length: 1
            }
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

        // unit tests should pass in instance of freestyla
        , reset: function(freeStyla) {
            
            if(!freeStyla) freeStyla = window.freeStyla;
            
            freeStyla.testable.clearAllInstances();
            if(freeStyla && freeStyla.glb) {
                freeStyla.glb.widgetNames = ["SiteFooter", "SiteHeader"];
            }
            if(typeof window === "undefined") return;

            // remove elements added
            var els = document.querySelectorAll("[data-freestyla-el]");
            for(var i=0; i < els.length; i++) {
                document.body.removeChild(els[i]);
            }

            // remove widgets added
            var wgs = document.querySelectorAll("[data-freestyla-wg]");
            for(i=0; i < wgs.length; i++) {
                document.body.removeChild(wgs[i]);
            }

            // remove stylesheets added
            var styleSheets = document.querySelectorAll("[data-freestyla-ss]");
            for(i=0; i < styleSheets.length; i++) {
                document.body.removeChild(styleSheets[i]);
            }

            SELF.addFreeStylaEl();
        }

        // el can be an ID as well as an actual DOM element
        , getCompProp: function(el, prop) {
            if(typeof el === "string") el = document.getElementById(el);
            var comp = window.getComputedStyle(el);
            return comp.getPropertyValue(prop);
        }

        , getCssPath: function(file) {
            return 'http://localhost:8081/dist/' + (file || "");
        }

        // Adds freeStyla element so style sheets have an element to reference in the DOM. Make sure you add this before modifying the DOM
        , addFreeStylaEl: function() {

            if(typeof window === "undefined") return;

            var id = window.freeStyla.vars.MAIN_ID
              , oldEl = document.getElementById(id);
            if(oldEl) document.body.removeChild(oldEl);
            
            var freestylaEl = document.createElement("span");
            freestylaEl.setAttribute("id", id);
            document.body.appendChild(freestylaEl);

            // just for tests, so they can be removed easily
            freestylaEl.setAttribute("data-freestyla-el", "")

            return freestylaEl;
        }
    }
	
    // exposes library for browser and Node-based code (such as unit tests)
    if(typeof window === "undefined")   module.exports = testUtils;
    else                                window.testUtils = testUtils
	
    SELF = testUtils;
})();

