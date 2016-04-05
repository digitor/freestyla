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


describe("createNewInstance and getInstance", function() {
	it("should create a new instance object with a unique id and then fetch it", function() {
		var fun = freeStyler.testable.createNewInstance
		
		var uid = fun()
		  , inst = freeStyler.testable.getInstance(uid)

		expect(inst).toBeDefined();
		expect(inst.uid).toBe(uid);
	})

	it("should create a new instance, attach a property to it, then fetch it again after a timeout and check the property exists", function(done) {
		var fun = freeStyler.testable.createNewInstance
		
		var inst = fun(true)
		  , uid = inst.uid

		inst.testProp = 10;

		setTimeout(function() {
			var fetchedInst = freeStyler.testable.getInstance(uid)
			expect(fetchedInst.testProp).toEqual(10);
			done();
		}, 100);
	})
})