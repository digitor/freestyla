
// some warnings can be quite irritating during tests, so we can suppress them here
window.freeStyla.suppressWarnings = true;

var createEl = window.testUtils.createEl
  , cleanupElement = window.testUtils.cleanupElement
  , resetGlobals = window.testUtils.resetGlobals
  , createNewInstance = window.freeStyla.testable.createNewInstance
  , getUID = window.testUtils.getUID
  , clsLoading = window.freeStyla.vars.clsLoading
  , $doc = $(document)

beforeEach(function() {
	resetGlobals();
});

describe("callRegisteredCBs", function() {

	var fun = window.freeStyla.testable.callRegisteredCBs

	function setup(returnInst) {
		var inst = createNewInstance(true);
		inst.notYetVisibleWgList = [];

		if(returnInst) return inst;
		return inst.uid;
	}

	it("should successfully call multiple callbacks in a widget config", function (done) {
		
		var uid = setup()
		  , wgName = "SiteHeader"
		  , count = 0

		var callDone = function() {
			count++;
			if(count>=2) done();
		}

		var cb1 = function(_wgName) {
			expect(_wgName).toBe(wgName);
			callDone();
		}, cb2 = function(_wgName) {
			expect(_wgName).toBe(wgName);
			callDone();
		}

		var cnf = {
			wgName: wgName // case shouldn't matter
			, $el: null
			, loaded: false
			, cb:[cb1, cb2]
		}

		var isSuccess = fun(uid, wgName, cnf, false);

		expect(isSuccess).toBe(true);

		if(!isSuccess) done();
	})

	it("should reject if widget is already loaded and 'allowAll' is false", function () {
		
		var uid = setup()
		  , wgName = "SiteHeader"

		var cnf = {
			wgName: wgName // case shouldn't matter
			, $el: null
			, loaded: true
			, cb:[]
		}

		var isSuccess = fun(uid, wgName, cnf, false);

		expect(isSuccess).toBe(false);
	})

	it("should accept if widget is already loaded, but 'allowAll' is true", function () {
		
		var uid = setup()
		  , wgName = "SiteHeader"

		var cnf = {
			wgName: wgName // case shouldn't matter
			, $el: null
			, loaded: true
			, cb:[]
		}

		var isSuccess = fun(uid, wgName, cnf, true);

		expect(isSuccess).toBe(true);
	})

	it("should reject and add the widget to the 'notYetVisibleWgList' array because a parent isn't loaded yet", function() {

		var parentEl = createEl()
		  , child = createEl(null, null, null, null, parentEl)

		// set the parent state to still loading
		parentEl.classList.add(clsLoading)

		var inst = setup(true)
		  , wgName = "SiteHeader"

		var cnf = {
			wgName: wgName // case shouldn't matter
			, $el: $(child)
			, loaded: false
			, cb:[]
		}

		var isSuccess = fun(inst.uid, wgName, cnf, false);

		expect(isSuccess).toBe(false); // checks it was rejected
		expect(inst.notYetVisibleWgList.indexOf(cnf)).toEqual(0) // checks it was added to the list of not yet visible widgets
	})
})