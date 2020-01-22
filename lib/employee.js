class Employee {
  constructor(name, id, email) {
    if (!new.target) {
      // Make sure the user creates class objects with 'new' keyword
      throw new TypeError("You must use new to construct!");
    }
    
    this.name = name;
    this.id = id;
    this.email = email;
    this.role = "Employee";
  }
  getName() {
    return this.name;
  }
  getId() {
    return this.id;
  }
  getEmail() {
    return this.email;
  }
  getRole() {
    return this.role;
  }
}

module.exports = Employee;
