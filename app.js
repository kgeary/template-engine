const fs = require("fs");
const util = require("util");
const inquirer = require("inquirer");
const Engineer = require("./lib/engineer");
const Intern = require("./lib/intern");
const Manager = require("./lib/manager");
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

const debug = true;

const ADD_MEMBER_STR = "ADD Member";
const GENERATE_REPORT_STR = "Generate Report";
const QUIT_STR = "Quit";

// Main Menu Prompt
const shellPrompt = [
  {
    type: "list",
    message: "What would you like to do?",
    name: "cmd",
    choices: [ADD_MEMBER_STR, GENERATE_REPORT_STR, QUIT_STR],
  }
];

// Questions for ALL employees
const employeePrompt = [
  {
    type: "list",
    message: "Select an employee type",
    name: "type",
    choices: ["Engineer", "Intern", "Manager"],
  },
  {
    type: "input",
    message: "Employee Name",
    name: "name",
  },
  {
    type: "input",
    message: "Employee ID",
    name: "id",
    validate: validateNumber,
  },
  {
    type: "input",
    message: "Employee Email",
    name: "email",
    validate: validateEmail,
  },
];

// For specifying the special role
const specialRoles = [
  {
    name: "Engineer",
    role: "Github Name",
    field: "github",
    validate: validateGithub,
  },
  {
    name: "Manager",
    role: "Office Number",
    field: "officeNumber",
    validate: validateNumber,
  },
  {
    name: "Intern",
    role: "School",
    field: "school",
  },
];

//=========================================
// Validate Number Input
//=========================================
function validateNumber(input) {

  if (!input.match(/^[0-9]+$/)) {
    return "Input must be a integer!";
  };

  return true;
}

//=========================================
// Validate Email Address Input
//=========================================
function validateEmail(input) {
  if (!input.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) {
    return "Input must be a valid email address!";
  };

  return true;
}

//=========================================
// Validate Github Input
//=========================================
function validateGithub(input) {
  if (!input.match(/^[A-Z0-9._%+-]{3,}$/i)) {
    return "Input must be a valid Github name!";
  }

  return true;
}

//=========================================
// Lookup the special role question based
// off the Employee Type
//=========================================
function getSpecialRoleQuestion(type) {
  const specialRole = specialRoles.find(x => x.name === type);
  const msg = specialRole.role;
  const name = specialRole.field;
  const validate = specialRole.validate;
  return [
    {
      type: "input",
      message: msg,
      name: name,
      validate: validate,
    }
  ];
}

//=========================================
// Output only if debugging
//=========================================
function debugOut(...str) {
  if (debug) {
    console.log(...str);
  }
}

//=========================================
// [async] getEmployee data via prompts
//=========================================
async function getEmployeeInfo() {
  try {
    const responses = await inquirer.prompt(employeePrompt);
    const questionsSpecial = getSpecialRoleQuestion(responses.type);
    const specialResponse = await inquirer.prompt(questionsSpecial);

    // Save the special role with the employee questions
    const specialRole = Object.keys(specialResponse)[0];
    responses[specialRole] = specialResponse[specialRole];
    return responses;
  } catch (err) {
    console.log("getEmployeeInfo Error", err);
    throw err;
  }
}

//=========================================
// Create and return a new employee object
// based on the data received from user
//=========================================
function createTeamMember(data) {
  let employee;

  switch (data.type) {
    case "Engineer":
      employee = new Engineer(data.name, data.id, data.email, data.github);
      break;
    case "Intern":
      employee = new Intern(data.name, data.id, data.email, data.school);
      break;
    case "Manager":
      employee = new Manager(data.name, data.id, data.email, data.officeNumber);
      break;
    default:
      console.log("\nUnknown Employee Type\n");
      break;
  }

  return employee;
}

//=========================================
// [async] Generate report content for a 
// single team member
//=========================================
async function generateMemberReport(employeeTemplate, member) {
  try {
    // Update the template with general employee data
    let employeeContent = updateTemplate(employeeTemplate, member);
    // Also update the template with role specific data
    let specialFile = `./template/${member.role.toLowerCase()}.html`;
    let specialTemplate = await readFileAsync(specialFile, "utf8");
    return updateTemplate(employeeContent, { special: updateTemplate(specialTemplate, member) });
  } catch (err) {
    console.log("generateMemberReport ERROR", err);
    throw err;
  }
}

//=========================================
// [async] Generate report from team array
//=========================================
async function generateTeamReport(team) {
  
  try {
    let teamHtml = "";
    let employeeTemplate = await readFileAsync(`./template/employee.html`, "utf8");
  
    // Generate the team portion of the HTML
    for (let memberIndex = 0; memberIndex < team.length; memberIndex++) {
      const member = team[memberIndex];
      member.index = memberIndex + 1;
      teamHtml += await generateMemberReport(employeeTemplate, member);
    }
  
    // Update the main template with team data
    let template = await readFileAsync(`./template/main.html`, "utf8");
    let finalHtml = updateTemplate(template,
      {
        content: teamHtml,
        teamSize: team.length,
        numEngineers: team.filter(x => x.role === "Engineer").length,
        numInterns: team.filter(x => x.role === "Intern").length,
        numManagers: team.filter(x => x.role === "Manager").length,
      }
    );
  
    // Create the final HTML
    await writeFileAsync("./output/team.html", finalHtml);
  } catch (err) {
    console.log("generateTeamReport ERROR", err);
    throw err;
  }
}

//=========================================
// Update HTML template file with fields in
// the data object
// html = html template as a string
// data = data object to get values from
// returns an updated HTML string
//=========================================
function updateTemplate(html, data) {
  let result = html;

  // Try to find each key in data in the template
  // If you find it replace it with the value from the data object
  console.log(data);

  // For each available key in the data object
  for (let key in data) {
    // Use regex to replace {{ key }} with data[key] (global search)
    const re = new RegExp(`{{ (${key}) }}`, "g");
    result = result.replace(re, data[key]);
  }

  return result;
}

//=========================================
// [async] Initialize and run the app.
// Generate a series of prompts to allow
// the user to build a team and generate
// a HTML report of the team
//=========================================
async function init() {
  const team = []; // Array to store team members
  let res;  // Hold the user reponses
  let exitWhile = false;

  try {
    // Start the main loop
    debugOut("\nStarting the shell\n");
    do {
      // Prompt the user and save responses
      res = await inquirer.prompt(shellPrompt);

      // Check which command was entered
      switch (res.cmd) {
        // cmd = Add a New Team Member
        case ADD_MEMBER_STR:
          const employeeData = await getEmployeeInfo();
          const employee = createTeamMember(employeeData);
          team.push(employee);
          break;

        // cmd = Generate a Report
        case GENERATE_REPORT_STR:
          if (team.length < 1) {
            console.log("\nYou have no team members! Add Team Members first\n");
          } else {
            await generateTeamReport(team);
            console.log("\nReport Generated\n");
          }
          break;

        // cmd = Quit
        case QUIT_STR:
          exitWhile = true; // Break the while
          break;
        // cmd = unknown command (Should not happen)
        default:
          console.log("\nUnknown Command\n");
          break;
      }
      // Remain in this loop until the user tells us to quit
    } while (!exitWhile)
    debugOut("\nEnding the shell\n");
  } catch (err) {
    // Oh shit
    console.log("ERROR", err);
  }
}

//=========================================
// Kick off the application
//=========================================
init();