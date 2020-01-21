const mj = require('../lib/mustache-jr');

describe("mustache-jr templating", function() {
  it("should replace data fields for templates", function() {
    const testValue = "a {{ name }} b";
    const testObj = {name: "test"};
    const result = mj.update(testValue, testObj);
    expect(result).toBe("a test b");
  });
  
  it("should not replace data fields not present in the object templates", function() {
    const testValue = "a {{ name }} b";
    const testObj = {title: "test"};
    const result = mj.update(testValue, testObj);
    expect(result).toBe("a {{ name }} b");
  });
  
  it("should replace mutiple occurences of fields in templates", function() {
    const testValue = "a {{ name }} b {{ age }} c {{ name }} d {{ age }}";
    const testObj = {name: "test", age: "21"};
    const result = mj.update(testValue, testObj);
    expect(result).toBe("a test b 21 c test d 21");
  });

  it("should replace over multiple lines", function() {
    const testValue = `
    a {{ name }} 
    b {{ age }} 
    c {{ name }} 
    d {{ age }}`;
    const testObj = {name: "test", age: "21"};
    const result = mj.update(testValue, testObj);
    expect(result.indexOf("{{")).toBe(-1);
  });

  it("should replace valid method names with parentheses (non-class)", function() {
    const testValue = "{{ getName() }} {{ getName }} {{ age }}";
    const testObj = {name: "Randy", age: "21", getName: function(){ return "Hello"; }};
    const result = mj.update(testValue, testObj);
    expect(result).toBe("Hello {{ getName }} 21");
  });

  it("should replace valid method names", function() {
    const testValue = "{{ getName() }} {{ name }}";
    class TestClass {
      constructor() {
        this.name = "test";
        this.age = "21";
      }
      getName() {
        return this.age;
      }
    }

    const testObj = new TestClass();
    const result = mj.update(testValue, testObj);
    expect(result).toBe("21 test");
  });

  it("should not replace methods with args", function() {
    const testValue = "{{ getName(false) }}";
    const testObj = {name: "test", age: "21", getName: () => "Banana"};
    const result = mj.update(testValue, testObj);
    expect(result).toBe("{{ getName(false) }}");
  });

});