"use strict";

(function () {
	var SELF
      , nimbleCSS
      , NS = "nimbleCSS"

    
    nimbleCSS = {

        // need to figure out how to set these nicely
        glb: {
            wgCSSLoaded: []
            , buildDirCSS: "/dist/css/"
            , widgetNames: []
            , dynamicCSS: true
        }

        // set to true if you want warnings to not show up in console (useful for tests, as they can be a bit annoying)
        ,suppressWarnings: false

        /**
         * @description Loads CSS by widget class name (if it exists on the page). Alternatively, you can load it with data attribute `data-load-wg="mywidgetname"` anywhere on the page for a single widget.
         * $ (object) - jQuery
         * _ (object) - LoDash
         * priorityWgList (array of strings) optional - list of widget names to load before others.
         */
        , onDemandCSS: function ($, _, priorityWgList) {

            var $wrongAttr = $('[data-wg-load]');
            if ($wrongAttr.length !== 0)
                console.warn(NS, "onDemandCSS()", "Whoops! Looks like you've used 'data-wg-load' somewhere instead of 'data-load-wg' as an attribute", $wrongAttr);

            //var D_WG_LIST = "widget-list"
            var $doc = $(document)
              , $wgCss = $("#widgetcss")[0]
              , tempQueryList = SELF.getTempWidgetQueryList()
              , tempWgCount = 0;

            
            // Ensures that the temp widgets (if there are multiple) are placed in order in the DOM (same order as they are specified in the query string), as this can be inportant with all there base styles.
            var sortTempWidgetOrder = function (useTempWg, widgetName, cssFile) {
                //console.log("tempQueryList", tempQueryList, useTempWg);

                if (!tempQueryList || tempQueryList.length <= 1) return;

                // records the order that the widgets should be in as a data attribute
                if (useTempWg) {
                    //console.log("cssFile", cssFile)
                    $('[href="' + cssFile + '"]').attr('data-order', tempQueryList.indexOf(widgetName));
                    tempWgCount++;
                }

                // once all temp widgets have loaded, reorder them
                if (tempWgCount === tempQueryList.length) {
                    var $links = $('[href*="css/min/TEMP_"]').detach()
                      , $thisLink
                      , linkCount = tempQueryList.length
                      , dataInd;
                    
                    while (linkCount > 0) {

                        $links.each(function () {
                            $thisLink = $(this);
                            dataInd = parseInt($thisLink.attr("data-order"));

                            if (dataInd === linkCount-1) {
                                $("body").prepend($thisLink);
                                linkCount--;
                            }
                        });
                    }
                }
            }


            var notYetVisibleWgList = [];

            // check if any widgets have registered callbacks from calling 'utils.wgCssLoaded'
            var triggerRegisteredCallbacks = function (wgName) {
                //console.log("triggerRegisteredCallbacks test", wgName)

                var wgCSSLoaded = window.nimbleCSS.glb.wgCSSLoaded;

                var loopCB = function (cnf, allowAll) {

                    // if already loaded don't do anything
                    if (!allowAll && cnf.loaded === true) return false;

                    // if a jQuery element is supplied, we check if it has any parents with the 'cssload-hide' class and do nothing until then
                    if (cnf.$el && cnf.$el.hasClass("cssload-hide") ||
                        cnf.$el && cnf.$el.closest(".cssload-hide").length) {
                        if (notYetVisibleWgList.indexOf(cnf) === -1) notYetVisibleWgList.push(cnf);
                        return false;
                    }

                    
                    _.forEach(cnf.cb, function (cb) {
                        //_.throttle(cb, 300);
                        cb(wgName);
                    });

                    return true;
                }

                _.forEach(wgCSSLoaded, function (cnf) {

                    //if (notYetVisibleWgList.length > 1)
                        //console.log("notYetVisibleWgList.length", notYetVisibleWgList)

                    // must be reverse array because of splice
                    var cnf2;
                    for (var i = notYetVisibleWgList.length - 1; i > -1; i--) {
                        cnf2 = notYetVisibleWgList[i];
                        var loaded = loopCB(cnf2);
                        if (loaded) {
                            notYetVisibleWgList.splice(i, 1);
                            cnf2.loaded = true;
                        }
                    }

                    if (!cnf.loaded) {
                        if (wgName === cnf.wgName || cnf.wgName === "*") {
                            var loaded = loopCB(cnf);
                            if (loaded) cnf.loaded = true;
                        }
                    } else if (cnf.wgName === "*") {
                        loopCB(cnf, true);
                    }
                });

                // add loaded widgets to the list, so late subscriptions can still return callbacks immediately
                var matches = _.where(wgCSSLoaded, { wgName: wgName });
                if (matches.length === 0) {
                    //console.log("late", wgName);
                    wgCSSLoaded.push({
                        wgName: wgName
                        , loaded: true
                        , cb: []
                    });
                }
            }

            // start loading the CSS
            var startCSSLoading = function (widgetName, $thisWg, useTempWg, successCB) {
                

                var cssFile = nimbleCSS.glb.buildDirCSS + "widgets/" + widgetName + ".css";
                if (useTempWg) {
                    cssFile = nimbleCSS.glb.buildDirCSS + "TEMP_" + widgetName + ".css";
                } else {

                    var matches = _.where(window.nimbleCSS.glb.wgCSSLoaded, { wgName: widgetName, loaded: true });
                    if (matches.length) {

                        //cssload-hide already removed in removeCriticalCssLoad
                    
                        triggerRegisteredCallbacks(widgetName);
                        $doc.trigger("widget-css-loaded", { wgName: widgetName });

                        if (successCB) successCB(widgetName);
                        return;
                    }
                }

                // if already in critical css, just trigger the registered callbacks and events

                var ss = loadCSS(cssFile, $wgCss);

                onloadCSS(ss, function () {
                    
                    var count = 0;
                    var checkWidgetStylesLoaded = function () {
                        
                        var wgCSSOk = !$thisWg || $thisWg.eq(0).css("visibility") === "visible"; // $('link[href*="/' + widgetName + '.css"]').length > 0;//

                        if (wgCSSOk) {

                            sortTempWidgetOrder(useTempWg, widgetName, cssFile);

                            // remove all instances' css hide class, so they become visible
                            $("." + widgetName).removeClass("cssload-hide");

                            // tell the world what happened
                            triggerRegisteredCallbacks(widgetName);
                            $doc.trigger("widget-css-loaded", { wgName: widgetName });
                            if (successCB) successCB(widgetName);

                        } else if (count < 120) { // limit to 30 attempts (36 seconds)
                            count++;
                            setTimeout(checkWidgetStylesLoaded, 300);
                        }
                    }

                    // iterate until widget visible
                    checkWidgetStylesLoaded();
                });
            }

            
            
            var widgetsList = window.nimbleCSS.glb.widgetNames
              , $thisWg
              , sel
              , wgLoadList = [];

            _.forEach(widgetsList, function (widgetName) {

                widgetName = widgetName.toLowerCase();

                var isPriority = false;
                _.map(priorityWgList, function (item) {
                    if (item.toLowerCase() === widgetName) isPriority = true;
                });

                $thisWg = $("." + widgetName);
                var useTempWg = tempQueryList && tempQueryList.indexOf(widgetName) !== -1;

                // check if widget exists on the page first
                if ($thisWg.length !== 0) {

                    wgLoadList.push({
                        name: widgetName
                        , $wg: $thisWg
                        , useTempWg: useTempWg
                        , isPriority: isPriority
                    });

                } else {
                    // then check for data attribute matches
                    var $attrMatch = SELF.checkLoadCssAttr($, _, widgetName);

                    if ($attrMatch) { // looks for attributes that tell it to load first

                        wgLoadList.push({
                            name: widgetName
                            , $wg: $attrMatch
                            , useTempWg: useTempWg
                            , isPriority: isPriority
                        });
                    }
                }
            });

            var priorityList = _.where(wgLoadList, { isPriority: true })
              , nonPriorityList = _.where(wgLoadList, { isPriority: false })
              , loadedCount = 0;

            var loadNonPriority = function () {
                _.forEach(nonPriorityList, function (item) {
                    startCSSLoading(item.name, item.$wg, item.useTempWg);
                });
            }

            // if no priority widgets found on this page, load the rest
            if (priorityList.length === 0) {
                loadNonPriority();
                return;
            }

            // loads priority widgets first
            _.forEach(priorityList, function (item) {
                startCSSLoading(item.name, item.$wg, item.useTempWg, function () {
                    loadedCount++;

                    // once all priority widgets loaded, load the rest
                    if (loadedCount === priorityList.length) loadNonPriority();
                });
            });
        },

        removeCriticalCssLoad: function () {
            var $thisWg;

            _.forEach(window.nimbleCSS.glb.wgCSSLoaded, function (item) {

                if (item.loaded && item.wgName !== "*") {

                    $thisWg = $("." + item.wgName);
                    //console.log("removeCriticalCssLoad", $thisWg, item.wgName);

                    if ($thisWg.length) {
                        
                        // remove all instances' css hide class, so they become visible
                        $thisWg.removeClass("cssload-hide");
                    }
                }
            });
        }

        /**
         * @description Listen for when a widget's CSS has loaded and trigger a callback. 
         * @param ns (string/Array of strings/config object/jQuery element):
            - If string is passed, cb will be triggered when CSS is loaded, regardless of whether the widget is visible (as it may be nested in another hidden widget). A "*" can be used to trigger the cb on every widget load (this is discouraged though).
            - If array of strings is passed, cb will be triggered for each widget when loaded, regardless of whether the widget is visible.
            - If config object literal is passed, '$el' param will be used and cb won't trigger until it becomes visible. 'ns' should be widget name and can be a single string or an array of strings. If none given, a "*" will be used.
            - If jQuery element is passed, it is the same as using the config object literal with ns as a "*".
         * @param singleCB (boolean) - If true (and 'ns' is an array of namespaces), cb will only be called when all widgets in the ns array have neen loaded.
         */
        , handleWgCSSLoad: function (ns, singleCB, cb) {

            if(!ns || !cb) {
                console.warn("utils -> handleWgCSSLoad()", "You must supply a 'ns' and 'cb' param. Returning early.");
                return;
            }

            if (!window.nimbleCSS.glb.dynamicCSS) {
                cb();
                return;
            }

            if (!singleCB) {
                SELF.wgCssLoaded(ns, cb);
                return;
            }

            var total, count = 0;
            if(_.isArray(ns)) total = ns.length;
            if (typeof ns === "object" && !_.isArray(ns)) {
                if (_.isArray(ns.ns))   total = ns.ns.length;
                else                    total = 1;
            }

            
            SELF.wgCssLoaded(ns, function (wgName) {
                count++;
                //console.log("handleWgCSSLoad", count, total)
                if (count === total) cb(wgName);
            });
        }

        // Listen for a particular widget's CSS loaded status
        , wgCssLoaded: function (ns, cb) {

            if (!window.nimbleCSS.glb.dynamicCSS) {
                cb();
                return;
            }

            var list;
            if (typeof ns === "string") list = [ns];
            else if (_.isArray(ns))     list = ns;

            // registers the callbacks to 'window.nimbleCSS.glb.wgCSSLoaded', so they will be called when css is loaded
            var wgCSSLoaded = window.nimbleCSS.glb.wgCSSLoaded;

            var addNSArray = function (list, isNewCB) {
                _.forEach(list, function (wgName) {

                    // Note that "*" will also be registered
                    wgName = wgName.toLowerCase();


                    var config = _.where(wgCSSLoaded, { wgName: wgName });

                    // means it exists
                    if (config.length) {
                        config = config[0];

                        if (config.loaded)  cb(wgName); // if already loaded, trigger callback immediately
                        else                config.cb.push(cb); // otherwise register it
                    } else {
                        isNewCB(wgName);
                    }
                });
            }

            if (!list) {

                // allows you to pass just a jQuery element, or an object with jQuery element and namespace
                var $el = ns.$el || ns;
                if (!$el.length) {
                    console.warn("utils -> wgCssLoaded", "You tried to pass an element, but length was zero.");
                }

                var namespace = ns.ns || "*";

                addNSArray(_.isArray(namespace) ? namespace : [namespace], function (wgName) {

                    // if ns isn't a string or array we assume it is an object with a jquery element and namespace
                    wgCSSLoaded.push({
                        wgName: wgName
                        , loaded: false
                        , $el: $el
                        , cb: [cb]
                    });
                });

                return;
            }

            
            addNSArray(list, function (wgName) {
                wgCSSLoaded.push({
                    wgName: wgName
                    , loaded: false
                    , cb: [cb]
                });
            });
        }

        
        , getUID: function(pref) {
            return (pref || "") + Math.random().toString().replace(".", "");
        }

        , getTempWidgetQueryList: function () {
            var queryArr = window.location.href.split("?")
              , queries = queryArr.length > 1 ? queryArr[1] : null
            
            if (!queries || queries.indexOf("tempwg") === -1) return null;

            var tempQueryArr = queries.split("tempwg=")
              , tempQuery = tempQueryArr[1].split("&")[0].replace("#","");

            return tempQuery.split(",");
        }


        , checkLoadCssAttr: function ($, _, matchWgName) {
            var match = null
              , $loadCssList = $("[data-load-wg]")
              , $this;

            $loadCssList.each(function () {
                $this = $(this);
                _.forEach($this.attr("data-load-wg").split(" "), function (wgName) {
                    if (matchWgName === wgName) match = $this;
                });
            });

            return match;
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
    
    SELF = nimbleCSS;
})();

