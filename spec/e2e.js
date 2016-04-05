
// some warnings can be quite irritating during tests, so we can suppress them here
window.freeStyla.suppressWarnings = true;

var createEl = window.testUtils.createEl
  , cleanupElement = window.testUtils.cleanupElement
  , resetGlobals = window.testUtils.resetGlobals
  , createNewInstance = window.freeStyla.testable.createNewInstance
  , getUID = window.testUtils.getUID
  , $doc = $(document)

beforeEach(function() {
	resetGlobals();
});

describe("callRegisteredCBs", function() {

	var fun = window.freeStyla.testable.callRegisteredCBs

	it("should successfully call a single callback in a widget config", function (done) {
		
		var inst = createNewInstance(true);
		inst.notYetVisibleWgList = [];

		var wgName = "SiteHeader";

		var cb = function(_wgName) {
			expect(_wgName).toBe(wgName);
			done();
		}

		var cnf = {
			wgName: wgName // case shouldn't matter
			, $el: null
			, loaded: false
			, cb:[cb]
		}

		var isSuccess = fun(inst.uid, wgName, cnf, false);

		expect(isSuccess).toBe(true);

		if(!isSuccess) done();
	})
})