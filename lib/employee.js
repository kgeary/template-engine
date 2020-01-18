class Employee {
  constructor(name, id, email) {
    this.name = name.trim();
    this.id = id.trim();
    this.email = email.trim();
    this.role = "Employee";
  }
  getName() { return this.name; };
  getId() { return this.id; };
  getEmail() { return this.email; };
  getRole() { return this.role; };
}


module.exports = Employee;