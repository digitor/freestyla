var freeStyler = require("./../src/freestyler")

describe("getUID", function() {
	
	var fun = freeStyler.testable.getUID
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
