const Employee = require("./employee.js");

class Manager extends Employee {
  constructor(name, id, email, office) {
    super(name, id, email);
    this.role = "Manager";
    this.officeNumber = office;
  }
  
  getOfficeNumber() { return this.officeNumber; }

}

module.exports = Manager;