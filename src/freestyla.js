"use strict";

(function () {
	var SELF
      , freeStyla
      , NS = "freeStyla"
      , clsLoading = "cssload-hide"
      , instances = [];  // there should only really be 1 instance, but we give each public function a unique instance so we can store variables for each

    // defines browser dependent variables, so unit tests don't error
    var loadCSS, onloadCSS, $doc;
    if(typeof window !== "undefined") {
        loadCSS = window.loadCSS;
        onloadCSS = window.onloadCSS;
        $doc = $(document);
    }

    /**
     * @description Gets a unique string, with an optional prefix that can be useful for human readability.
     * @param pref (string) optional - A prefix string for the unique id.
     * @return (string) The unique id.
     */
    function getUID(pref) {
        return (pref || "") + Math.random().toString().replace(".", "");
    }

    /**
     * @description Fetches a freestyla instance, using a UID.
     * @param uid (string) - Unique Identifier for the instance.
     * @return (object/null) - The instance object or null if not found.
     */
    function getInstance(uid) {
        var instance;

        // if only 1 instance exists, you can omit the uid
        if(!uid && instances.length === 1) return instances[0];

        for(var i=0; i<instances.length; i++) {
            instance = instances[i];
            if(instance.uid === uid) return instance;
        }

        console.warn(NS, "Couldn't find an instance with UID " + uid, "instances count: " + instances.length);
        return null;
    }

    /**
     * @description Creates a new freestyla instance, with a unique id.
     * @param rtnInst (bool) - Whether or not to return the instance, rather than just the id.
     * @return (string/object) - The uid or instance object.
     */
    function createNewInstance(rtnInst) {
        var uid = getUID("instance")
          , inst = { uid: uid };

        instances.push(inst);

        if(rtnInst) return inst;
        return uid;
    }

    // just used for tests
    function clearAllInstances() {
        
        instances = [];
    }
    
    // Ensures that the temp widgets (if there are multiple) are placed in order in the DOM (same order as they are specified in the query string), as this can be inportant with all there base styles.
    function sortTempWidgetOrder(uid, useTempWg, widgetName, cssFile) {
        var inst = getInstance(uid);

        if (!inst.tempQueryList || inst.tempQueryList.length <= 1) return;

        // records the order that the widgets should be in as a data attribute
        if (useTempWg) {
            //console.log("cssFile", cssFile)
            $('[href="' + cssFile + '"]').attr('data-order', inst.tempQueryList.indexOf(widgetName));
            inst.tempWgCount++;
        }

        // once all temp widgets have loaded, reorder them
        if (inst.tempWgCount === inst.tempQueryList.length) {
            var $links = $('[href*="css/min/TEMP_"]').detach()
              , $thisLink
              , linkCount = inst.tempQueryList.length
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

    /**
     * @description Gets list of 'tempwg' widget names from the query string attached to the current url. 
     * @param href (string) optional - Use this for unit tests.
     * @return (array of strings) - The widget names fetched from the query string.
     */
    function getTempWidgetQueryList(href) {

        if(!href) href = window.location.href;

        var queryArr = href.split("?")
          , queries = queryArr.length > 1 ? queryArr[1] : null
        
        if (!queries || queries.indexOf("tempwg") === -1) return null;

        var tempQueryArr = queries.split("tempwg=")
          , tempQuery = tempQueryArr[1].split("&")[0].replace("#","");

        return tempQuery.split(",");
    }



    /**
     * @description Calls the config callback functions if all conditions pass. If config isn't marked as 'loaded = true', adds to an array to call later when it becomes visible.
     * @param uid (string) - Unique Identifier for the instance.
     *
     */
    function callConfigCBs(uid, cnf, allowAll) {
        var inst = getInstance(uid);

        // if already loaded don't do anything
        if (!allowAll && cnf.loaded === true) return false;

        // removed this condition, as the loading class should have been removed already
        // if (cnf.$el && cnf.$el.hasClass(clsLoading) ||

        // if a jQuery element is supplied, we check if it has any parents with the 'clsLoading' class and do nothing until then
        if (cnf.$el && cnf.$el.closest("."+clsLoading).length) {
            if (inst.notYetVisibleWgList.indexOf(cnf) === -1) inst.notYetVisibleWgList.push(cnf);
            return false;
        }

        var wgName = cnf.wgName;
        _.forEach(cnf.cb, function (cb) {
            cb(wgName);
        });

        return true;
    }


    /**
     * @description Checks 'notYetVisibleWgList' array, removes any widgets that are loaded already and marks them as loaded.
     * @param uid (string) - Unique Identifier for the instance.
     */
    function callNotVisibleList(uid) {
        var inst = getInstance(uid);
        
        // must be reverse array because of splice
        var cnf, loaded;
        for (var i = inst.notYetVisibleWgList.length - 1; i > -1; i--) {
            cnf = inst.notYetVisibleWgList[i];
            loaded = callConfigCBs(uid, cnf);
            if (loaded) {
                inst.notYetVisibleWgList.splice(i, 1);
                cnf.loaded = true;
            }
        }
    }

    
    /**
     * @description Triggers callbacks for config if already loaded and '*' used for widget name. If not yet loaded, checks if 'callConfigCBs' returns true and marks as loaded if so.
     * @param uid (string) - Unique Identifier for the instance.
     * @param wgName (string) - Widget name to compare the config to. Likely it will come directly from the 'freeStyla.glb.registeredWidgets' array.
     * @return (boolean) - Will be true only if 'callConfigCBs' sucesfully triggered the callbacks for the config. Used in tests.
     */    
    function triggerUnloadedCBs(uid, wgName, cnf) {
        
        var loaded;
        if (!cnf.loaded) {
            
            if (wgName === cnf.wgName || cnf.wgName === "*") {
                loaded = callConfigCBs(uid, cnf);
                if (loaded) cnf.loaded = true;
                return loaded;
            }
        } else if (cnf.wgName === "*") {
            loaded = callConfigCBs(uid, cnf, true);
            return loaded;
        }
        return false;
    }


    /**
     * @description Tries to trigger callbacks for registered widgets, checking that are visible and loaded. If passed 'wgName' has not yet been registered, 
        marks it as loaded so late registrations trigger callbacks immediately.
     * @param uid (string) - Unique Identifier for the instance.
     * @param wgName (string) - Widget name to compare the config to. Likely it will come directly from the 'freeStyla.glb.registeredWidgets' array.
     */    
    function triggerRegisteredCallbacks(uid, wgName) {
        var inst = getInstance(uid);

        // if 'notYetVisibleWgList' not yet added, adds it to instance and sets to empty
        if(!inst.notYetVisibleWgList) inst.notYetVisibleWgList = [];

        var registeredWidgets = window.freeStyla.glb.registeredWidgets;

        callNotVisibleList(uid);
        _.forEach(registeredWidgets, function (cnf) {
            // triggers callbacks if not yet loaded or using a "*" for widget name
            triggerUnloadedCBs(uid, wgName, cnf);
        });

        // If passed 'wgName' has not yet been registered, marks it as loaded so future late registrations trigger callbacks immediately.
        var matches = _.where(registeredWidgets, { wgName: wgName });
        if (matches.length === 0) {
            registeredWidgets.push({
                wgName: wgName
                , loaded: true
                , cb: []
            });
        }
    }


    // start loading the CSS
    function startCSSLoading(uid, widgetName, $thisWg, useTempWg, successCB) {
        var inst = getInstance(uid);

        var cssFile = freeStyla.glb.buildDirCSS + "widgets/" + widgetName + ".css";
        if (useTempWg) {
            cssFile = freeStyla.glb.buildDirCSS + "TEMP_" + widgetName + ".css";
        } else {

            var matches = _.where(window.freeStyla.glb.registeredWidgets, { wgName: widgetName, loaded: true });
            if (matches.length) {

                //clsLoading already removed in removeCriticalCssLoad
            
                triggerRegisteredCallbacks(uid, widgetName);
                $doc.trigger("widget-css-loaded", { wgName: widgetName });

                if (successCB) successCB(widgetName);
                return;
            }
        }

        // if already in critical css, just trigger the registered callbacks and events

        var ss = loadCSS(cssFile, document.getElementById("widgetcss"));

        onloadCSS(ss, function () {
            
            var count = 0;
            var checkWidgetStylesLoaded = function () {
                
                var wgCSSOk = !$thisWg || $thisWg.eq(0).css("visibility") === "visible"; // $('link[href*="/' + widgetName + '.css"]').length > 0;//

                if (wgCSSOk) {

                    sortTempWidgetOrder(uid, useTempWg, widgetName, cssFile);

                    // remove all instances' css hide class, so they become visible
                    $("." + widgetName).removeClass(clsLoading);

                    // tell the world what happened
                    triggerRegisteredCallbacks(uid, widgetName);
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

    freeStyla = {

        // set to true if you want warnings to not show up in console (useful for tests, as they can be a bit annoying)
        suppressWarnings: false

        // should be called before calling 'start'
        , prepare: function(registeredWidgets, buildDirCSS, widgetNames, dynamicCSS) {
            
            SELF.glb = SELF.glb || {};

            // these can probably be removed and passed in on 'start'
            SELF.glb.registeredWidgets = registeredWidgets;
            SELF.glb.buildDirCSS = buildDirCSS;
            SELF.glb.widgetNames = widgetNames;
            SELF.glb.dynamicCSS = dynamicCSS;
        }

        /**
         * @description Loads CSS by widget class name (if it exists on the page). Alternatively, you can load it with data attribute `data-load-wg="mywidgetname"` anywhere on the page for a single widget.
         * @param $ (object) - jQuery instance
         * @param _ (object) - LoDash instance
         * @param priorityWgList (array of strings) optional - list of widget names to load before others.
         * @param registeredWidgets (array of objects) optional - If you have css already loaded for certain widgets (such as critical above the fold ones), tell freeStyla they are already loaded by passing 
         *  their configs like so { wgName: "nameOfWidget", loaded:true, cb:[] }
         * @return (string) - The UID for the instance.
         */
        , start: function ($, _, priorityWgList, registeredWidgets) {

            var inst = createNewInstance(true)
              , uid = inst.uid;

            var $wrongAttr = $('[data-wg-load]');
            if ($wrongAttr.length !== 0)
                console.warn(NS, "onDemandCSS()", "Whoops! Looks like you've used 'data-wg-load' somewhere instead of 'data-load-wg' as an attribute", $wrongAttr);

            //var D_WG_LIST = "widget-list"

            inst.tempWgCount = 0;
            inst.tempQueryList = SELF.getTempWidgetQueryList();
            
            inst.registeredWidgets = registeredWidgets || [];



            var widgetsList = window.freeStyla.glb.widgetNames
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
                var useTempWg = inst.tempQueryList && inst.tempQueryList.indexOf(widgetName) !== -1;

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
                    startCSSLoading(uid, item.name, item.$wg, item.useTempWg);
                });
            }

            // if no priority widgets found on this page, load the rest
            if (priorityList.length === 0) {
                loadNonPriority();
                return;
            }

            // loads priority widgets first
            _.forEach(priorityList, function (item) {
                startCSSLoading(uid, item.name, item.$wg, item.useTempWg, function () {
                    loadedCount++;

                    // once all priority widgets loaded, load the rest
                    if (loadedCount === priorityList.length) loadNonPriority();
                });
            });

            return uid;
        },

        /**
         * @description Removes the loading state from any registered widgets that are already loaded (using class stored in 'clsLoading' variable. Call this if you've got preloaded critical CSS.
         * @param uid (string) - the UID for the instance of freeStyla, returned when calling the 'start' method.
         */
        removeCriticalCssLoad: function (uid) {
            var $thisWg, inst = getInstance(uid);

            _.forEach(inst.registeredWidgets, function (item) {

                if (item.loaded && item.wgName !== "*") {

                    $thisWg = $("." + item.wgName);
                    //console.log("removeCriticalCssLoad", $thisWg, item.wgName);

                    if ($thisWg.length) {
                        
                        // remove all instances' css hide class, so they become visible
                        $thisWg.removeClass(clsLoading);
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

            if (!window.freeStyla.glb.dynamicCSS) {
                cb();
                return;
            }

            if (!singleCB) {
                SELF.freeLoaded(ns, cb);
                return;
            }

            var total, count = 0;
            if(_.isArray(ns)) total = ns.length;
            if (typeof ns === "object" && !_.isArray(ns)) {
                if (_.isArray(ns.ns))   total = ns.ns.length;
                else                    total = 1;
            }

            
            SELF.freeLoaded(ns, function (wgName) {
                count++;
                //console.log("handleWgCSSLoad", count, total)
                if (count === total) cb(wgName);
            });
        }

        // Listen for a particular widget's CSS loaded status
        , freeLoaded: function (ns, cb) {

            if (!window.freeStyla.glb.dynamicCSS) {
                cb();
                return;
            }

            var list;
            if (typeof ns === "string") list = [ns];
            else if (_.isArray(ns))     list = ns;

            // registers the callbacks to 'window.freeStyla.glb.registeredWidgets', so they will be called when css is loaded
            var registeredWidgets = window.freeStyla.glb.registeredWidgets;

            var addNSArray = function (list, isNewCB) {
                _.forEach(list, function (wgName) {

                    // Note that "*" will also be registered
                    wgName = wgName.toLowerCase();


                    var config = _.where(registeredWidgets, { wgName: wgName });

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
                    console.warn("utils -> freeLoaded", "You tried to pass an element, but length was zero.");
                }

                var namespace = ns.ns || "*";

                addNSArray(_.isArray(namespace) ? namespace : [namespace], function (wgName) {

                    // if ns isn't a string or array we assume it is an object with a jquery element and namespace
                    registeredWidgets.push({
                        wgName: wgName
                        , loaded: false
                        , $el: $el
                        , cb: [cb]
                    });
                });

                return;
            }

            
            addNSArray(list, function (wgName) {
                registeredWidgets.push({
                    wgName: wgName
                    , loaded: false
                    , cb: [cb]
                });
            });
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
        	getUID: getUID
            , createNewInstance: createNewInstance
            , getInstance: getInstance
            , clearAllInstances: clearAllInstances
            , callConfigCBs: callConfigCBs
            , callNotVisibleList: callNotVisibleList
            , triggerUnloadedCBs: triggerUnloadedCBs
            , triggerRegisteredCallbacks: triggerRegisteredCallbacks
            , getTempWidgetQueryList: getTempWidgetQueryList
        }

        // maybe useful variables
        , vars: {
            NS: NS
            , clsLoading: clsLoading
        }
    }

    // exposes library for browser and Node-based code (such as unit tests)
    if(typeof window === "undefined")   module.exports = freeStyla;
    else                                window.freeStyla = window.freestyla = freeStyla;
    
    SELF = freeStyla;
})();