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

// Validate Number Input
function validateNumber(input) {

  if (!input.match(/^[0-9]+$/)) {
    return "Input must be a integer";
  };

  return true;
}

// Validate Email Address Input
function validateEmail(input) {
  if (!input.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) {
    return "Input must be a valid email address";
  };

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
  const responses = await inquirer.prompt(employeePrompt);
  const questionsSpecial = getSpecialRoleQuestion(responses.type);
  const specialResponse = await inquirer.prompt(questionsSpecial);

  // Save the special role with the employee questions
  const specialRole = Object.keys(specialResponse)[0];
  responses[specialRole] = specialResponse[specialRole];
  return responses;
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
  // Update the template with general employee data
  let employeeContent = updateTemplate(employeeTemplate, member);
  // Also update the template with role specific data
  let specialFile = `./template/${member.role.toLowerCase()}.html`;
  let specialTemplate = await readFileAsync(specialFile, "utf8");
  return updateTemplate(employeeContent, { special: updateTemplate(specialTemplate, member) });
}

//=========================================
// [async] Generate report from team array
//=========================================
async function generateTeamReport(team) {
  let teamHtml = "";
  let employeeTemplate = await readFileAsync(`./template/employee.html`, "utf8");
  
  for (let memberIndex = 0; memberIndex < team.length; memberIndex++) {
    const member = team[memberIndex];   
    teamHtml += await generateMemberReport(employeeTemplate, member);
  }

  let template = await readFileAsync(`./template/main.html`, "utf8");
  let finalHtml = updateTemplate(template, {content: teamHtml});
  await writeFileAsync("./output/team.html", finalHtml);
}

//=========================================
// Update HTML template file with fields in
// the data object
//=========================================
function updateTemplate(html, data) {
  let result = html;

  // Try to find each key in data in the template
  // If you find it replace it with the value from the data object
  for (let key of Object.keys(data)) {
    var re = new RegExp(`{{ (${key}) }}`);
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

  debugOut("\nStarting the shell\n");
  do {
    // Prompt the user and save responses
    res = await inquirer.prompt(shellPrompt);

    switch (res.cmd) {
      // Add a New Team Member
      case ADD_MEMBER_STR:
        const employeeData = await getEmployeeInfo();
        const employee = createTeamMember(employeeData);
        team.push(employee);
        break;
      
        // Generate a Report
      case GENERATE_REPORT_STR:
        if (team.length < 1) {
          console.log("\nYou have no team members! Add Team Members first\n");
        } else {
          await generateTeamReport(team);
          console.log("\nReport Generated\n"); 
        }
        break;

      // Quit
      case QUIT_STR:
        exitWhile = true; // Break the while
        break;

      default:
        console.log("\nUnknown Command\n");
        break;
    }
  } while (!exitWhile)
  debugOut("\nEnding the shell\n");
}

//=========================================
// Kick off the application
//=========================================
init();