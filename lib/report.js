const fs = require("fs");
const util = require("util");
const mustacheJr = require("./mustache-jr");
const out = require("./out");

// Promisified Functions
const readFileAsync = util.promisify(fs.readFile);

/**
 * @async Generate report content for a single team member
 *
 * @param employeeTemplate
 * Generic Employee HTML template as a string.
 *
 * @param member
 * The team member object to pull the data from for templated fields in html.
 *
 * @returns
 * HTML with data filled-in for a single team member
 */
async function generateMemberReport(employeeTemplate, member) {
  try {
    // Update the employee template with member data
    let employeeHtml = mustacheJr.update(employeeTemplate, member);

    // Get a path to the special template for the member's role
    let specialFile = `./template/${member.role.toLowerCase()}.html`;

    // Read the template into a string
    let specialTemplate = await readFileAsync(specialFile, "utf8");

    // Update the special template with member data
    let specialHtml = mustacheJr.update(specialTemplate, member);

    // Add the updated special role template into the employee template
    return mustacheJr.update(employeeHtml, { special: specialHtml });
  } catch (err) {
    out.error("generateMemberReport ERROR", err);
    throw err;
  }
}

/**
 * @async Generate the HTML of final team report with all member data
 *
 * @param team
 * Array of team members objects.
 *
 * @returns Final report HTML as a string
 *
 */
async function generateTeamReport(team) {
  if (team.length < 1) {
    out.error("\nYou have no team members! Add Team Members first\n");
    return;
  }

  try {
    let teamHtml = "";
    let employeeTemplate = await readFileAsync(
      `./template/employee.html`,
      "utf8"
    );

    // Generate the team portion of the HTML
    for (let memberIndex = 0; memberIndex < team.length; memberIndex++) {
      const member = team[memberIndex];
      member.index = memberIndex + 1;
      teamHtml += await generateMemberReport(employeeTemplate, member);
    }

    // Update the main template with team data
    let mainTemplate = await readFileAsync(`./template/main.html`, "utf8");
    let finalHtml = mustacheJr.update(mainTemplate, {
      content: teamHtml,
      teamSize: team.length,
      numEngineers: team.filter(x => x.role === "Engineer").length,
      numInterns: team.filter(x => x.role === "Intern").length,
      numManagers: team.filter(x => x.role === "Manager").length
    });

    return finalHtml;
  } catch (err) {
    out.error("generateTeamReport ERROR", err);
    throw err;
  }
}

module.exports = {
  generate: generateTeamReport
};
