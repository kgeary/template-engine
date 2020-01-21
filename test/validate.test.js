const validate = require("../lib/validate");

describe("validate email", function() {
  it("Should accept valid email addresses", function() {
    const testValue = "blah@blah.com"
    const result = validate.email(testValue);
    expect(result).toBe(true);
  })

  it("Should not accept invalid email addresses with no at symbol", function() {
    const testValue = "blah"
    const result = validate.email(testValue);
    expect(result).toBe("Input must be a valid email address!");
  })
})

describe("validate number", function() {
  it("Should accept valid positive integers", function() {
    const testValue = "5";
    const result = validate.int(testValue);
    expect(result).toBe(true);
  })

  it("Should accept positive integers", function() {
    const testValue = "1";
    const result = validate.int(testValue);
    expect(typeof result).toBe("boolean");
  })

  it("Should not accept negative integers", function() {
    const testValue = "-1";
    const result = validate.int(testValue);
    expect(typeof result).toBe("string");
  })

})

describe("validate github", function() {
  it("Should accept valid github profile", function() {
    const testValue = "chief"
    const result = validate.github(testValue);
    expect(typeof result).toBe("boolean");
    expect(result).toBe(true);
  })

  it("Should not accept invalid profiles", function() {
    const testValue = "3@";
    const result = validate.github(testValue);
    expect(typeof result).toBe("string");
  })

  it("Should not accept invalid profiles", function() {
    const testValue = "3@";
    const result = validate.github(testValue);
    expect(typeof result).toBe("string");
  })
})

describe("validate name", function() {
  it("Should accept a valid name", function() {
    const testValue = "Dan Jones"
    const result = validate.name(testValue);
    expect(typeof result).toBe("boolean");
    expect(result).toBe(true);
  })

  it("Should accept a 1 word name", function() {
    const testValue = "pete";
    const result = validate.name(testValue);
    expect(typeof result).toBe("boolean");
    expect(result).toBe(true);
  })

  it("Should not accept invalid profiles", function() {
    const testValue = "3@";
    const result = validate.name(testValue);
    expect(typeof result).toBe("string");
  })

  it("Should not accept blank names", function() {
    const testValue = "";
    const result = validate.name(testValue);
    expect(typeof result).toBe("string");
  })

  it("Should not accept only spaces for names", function() {
    const testValue = "    ";
    const result = validate.name(testValue);
    expect(typeof result).toBe("string");
  })

  it("Should not accept punctuation in names", function() {
    const testValue = "The Rick!";
    const result = validate.name(testValue);
    expect(typeof result).toBe("string");
  })

  it("Should not accept numbers in names", function() {
    const testValue = "R1CK";
    const result = validate.name(testValue);
    expect(typeof result).toBe("string");
  })
  
  it("Should not accept symbols in names", function() {
    const testValue = "R@CK";
    const result = validate.name(testValue);
    expect(typeof result).toBe("string");
  })
})