var freeStyla = require("./../src/freestyla")
  , testUtils = require("./test-utils")


beforeEach(function() {
	testUtils.reset(freeStyla);
})

describe("getUID", function() {
	
	var fun = freeStyla.testable.getUID
	  , uid1 = fun()
	  , uid2 = fun();

	it("should get a string", function() {
		expect(typeof uid1).toBe("string");
	});

	it("should not contain spaces", function() {
		expect(uid1).not.toContain(" ");
	});

	it("should get a unique value each time", function() {
		expect(uid1).not.toBe(uid2);
	});
});


describe("createNewInstance and getInstance", function() {
	it("should create a new instance object with a unique id and then fetch it", function() {
		var uid = freeStyla.testable.createNewInstance()
		  , inst = freeStyla.testable.getInstance(uid)

		expect(inst).toBeDefined();
		expect(inst.uid).toBe(uid);
	})

	it("should create a single new instance object and then fetch it WITHOUT a UID because there is only 1 instance", function() {
		var uid = freeStyla.testable.createNewInstance()
		  , inst = freeStyla.testable.getInstance() // no uid passed

		expect(inst).toBeDefined();
		expect(inst.uid).toBe(uid);
	})

	it("should create a new instance, attach a property to it, then fetch it again after a timeout and check the property exists", function(done) {
		var inst = freeStyla.testable.createNewInstance(true)
		  , uid = inst.uid

		inst.testProp = 10;

		setTimeout(function() {
			var fetchedInst = freeStyla.testable.getInstance(uid)
			expect(fetchedInst.testProp).toEqual(10);
			done();
		}, 100);
	})
})

describe("getTempWidgetQueryList", function() {
	var fun = freeStyla.testable.getTempWidgetQueryList

	it("should get a single widget name from the query string", function() {
		var list = fun("http://someurl.com?tempwg=siteheader")
		expect(list.length).toEqual(1)
		expect(list[0]).toBe("siteheader")
	})

	it("should get 3 widget names from the query string", function() {
		var list = fun("http://someurl.com?tempwg=siteheader,sitefooter,sidebar")
		expect(list.length).toEqual(3)
		expect(list).toContain("siteheader")
		expect(list).toContain("sitefooter")
		expect(list).toContain("sidebar")
	})
})