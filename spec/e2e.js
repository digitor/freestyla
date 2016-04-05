
// some warnings can be quite irritating during tests, so we can suppress them here
window.freeStyler.suppressWarnings = true;

var createEl = window.testUtils.createEl
  , cleanupElement = window.testUtils.cleanupElement
  , cleanUpGlobals = window.testUtils.cleanUpGlobals
  , getUID = window.testUtils.getUID
  , $doc = $(document)

beforeEach(function() {
	cleanUpGlobals();
});

describe("triggerRegisteredCallbacks", function() {

	it("should", function () {
		expect(true).toBeTruthy();
	})
})