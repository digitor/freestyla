var freeStyla = require("./../src/freestyla")
  , testUtils = require("./test-utils")
  , getFakeJQueryEl = testUtils.getFakeJQueryEl
  , noop = function(){}

freeStyla.suppressWarnings = true;

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

	it("should return falsy if expected query string param doesn't exist", function() {
		
		expect(fun("http://someurl.com")).toBeFalsy();
		expect(fun("http://someurl.com?another=param")).toBeFalsy();
	})
})

describe("markWidgetAsPriority", function() {

	var fun = freeStyla.testable.markWidgetAsPriority

	it("should return true if widget is in list, even if list item has uppercase in it", function() {
		var inList = fun(["siteHeader"], "siteheader")
		expect(inList).toBe(true)
	})

	it("should return true if widget is in list", function() {
		var inList = fun(["siteheader"], "sitefooter")
		expect(inList).toBe(false)
	})
})

describe("validateWidgetName", function() {
	var fun = freeStyla.testable.validateWidgetName

	it("should expect widget names to be valid despite case", function() {
		expect(fun("siteheader", true)).toBe("siteheader");
		expect(fun("SiteHeader", true)).toBe("siteheader");
	})

	it("should expect widget names to be invalid", function() {
		expect(fun("site header", true)).toBe(null);
		expect(fun(".sitehea.der", true)).toBe(null);
	})

	it("should expect invalid widget name to be made valid when 'beStrict' is falsy", function() {
		expect(fun("si.te head;e'r+")).toBe("siteheader");
	})
})


describe("getPriorityConfig", function() {
	var fun = freeStyla.testable.getPriorityConfig

	it("should get a valid config object with all params supplied and valid", function() {
		var $wg = getFakeJQueryEl()
		  , result = fun("siteheader", $wg, true, true)

		expect(result.name).toBe("siteheader")
		expect(result.$wg).toBe($wg)
		expect(result.isPriority).toBe(true)
		expect(result.useTempWg).toBe(true)
	})

	it("should get a valid config object with 'isPriority' and 'isPriority' params omitted, which should default them to 'false', plus '$wg' omitted, which should default to 'null'.", function() {
		var result = fun("siteheader")

		expect(result.name).toBe("siteheader")
		expect(result.$wg).toBe(null)
		expect(result.isPriority).toBe(false)
		expect(result.useTempWg).toBe(false)
	})

	it("should expect invalid widget name to be made valid", function() {
		var result = fun(".s;it'eheader")
		expect(result.name).toBe("siteheader")
	})

	it("should '$wg' to be 'null' when an invalid jQuery object is supplied", function() {
		var result = fun("siteheader", { length: 0 })
		expect(result.$wg).toBe(null)
	})

	it("should '$wg' to be 'null' when not supplied", function() {
		var result = fun("siteheader")
		expect(result.$wg).toBe(null)
	})
})


// NOT WORKING YET
describe("getRegConfig", function() {
	var fun = freeStyla.testable.getRegConfig

	it("should get a valid config object with all params supplied and valid", function() {
		var $el = getFakeJQueryEl()
		  , result = fun("siteheader", true, $el, noop)

		 console.log(result)
		expect(result.wgName).toBe("siteheader")
		expect(result.loaded).toBe(true)
		expect(result.$el).toBe($el)
		expect(result.cb.length).toEqual(1)
	})

	it("should get a valid config object with 'loaded' param omitted, which should default it to 'false', plus '$el' omitted, which should default to 'null', and 'cb' omitted, which should default to an empty array.", function() {
		var result = fun("siteheader")

		expect(result.wgName).toBe("siteheader")
		expect(result.loaded).toBe(false)
		expect(result.$el).toBe(null)
		expect(result.cb.length).toEqual(0)
	})

	it("should expect invalid widget name to be made valid", function() {
		var result = fun(".s;it'eheader")
		expect(result.wgName).toBe("siteheader")
	})

	it("should '$el' to be 'null' when an invalid jQuery object is supplied", function() {
		var result = fun("siteheader", { length: 0 })
		expect(result.$el).toBe(null)
	})

	it("should '$el' to be 'null' when not supplied", function() {
		var result = fun("siteheader")
		expect(result.$el).toBe(null)
	})
})