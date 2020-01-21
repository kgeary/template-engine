const report = require("../lib/report");
const Engineer = require("../lib/Engineer");
const Intern = require("../lib/Intern");
const Manager = require("../lib/Manager");


describe("Report Generator Module Tests", function() {
  it("should generate an html report of the team with templated fields replaced", async function() {
    const name1 = "Bob Smith";
    const email1 = "bob@abc.com";

    const team = [
      new Manager(name1, 1, email1, 1),
      new Engineer("Charlie Jones", 2, "chaz@abc.com", "charlieJones"),
      new Engineer("Engineer 2", 2, "eng2@abc.com", "engine_guy66"),
      new Intern("Debra Reynolds", 2, "debra@abc.com", "University of Texas"),
      new Intern("Intern2", 30, "blah@blah.com", "Texas A&M"),
      new Engineer("Engineer 3", 5, "eng3@abc.com", "engine_guy99"),
    ]

    let html = await report.generate(team);

    expect(html.includes(name1)).toBe(true);
    expect(html.includes(email1)).toBe(true);
    expect(html.includes("Charlie Jones")).toBe(true);
    expect(html.includes("chaz@abc.com")).toBe(true);
    expect(html.includes("University of Texas")).toBe(true);
    expect(html.includes("Texas A&M")).toBe(true);
    expect(html.includes("Total Team Members: 6")).toBe(true);
    expect(html.match(/["| ]card["| ]/g).length).toBe(7); // 6 member + 1 breakdown
  });
});