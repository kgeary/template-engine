const fs = require("fs");
const inquirer = require("inquirer");
const Engineer = require("./lib/engineer");
const Intern = require("./lib/intern");
const Manager = require("./lib/manager");
const validate = require("./lib/validate");
const out = require("./lib/out");
const report = require("./lib/report");

// Output Path
const outputPath = "./output/team.html";
// MAIN MENU COMMAND OPTIONS
const ADD_MEMBER_STR = "ADD Member";
const GENERATE_REPORT_STR = "Generate Report";
const QUIT_STR = "Quit";

// Main Menu Prompt
const shellPrompt = [
  {
    type: "list",
    message: "What would you like to do?",
    name: "cmd",
    choices: [ADD_MEMBER_STR, GENERATE_REPORT_STR, QUIT_STR]
  }
];

// Questions for ALL employees
const employeePrompt = [
  {
    type: "list",
    message: "Select an employee type",
    name: "role",
    choices: ["Engineer", "Intern"]
  },
  {
    type: "input",
    message: "Employee Name",
    name: "name",
    validate: validate.name
  },
  {
    type: "input",
    message: "Employee ID",
    name: "id",
    validate: validate.int
  },
  {
    type: "input",
    message: "Employee Email",
    name: "email",
    validate: validate.email
  }
];

// Manager Prompt (Skip the select employee role question)
const managerPrompt = employeePrompt.slice(1);

// For specifying the special role
const specialRoles = {
  Engineer: {
    role: "Engineer",
    special: "Github Name",
    field: "github",
    validate: validate.github
  },
  Manager: {
    role: "Manager",
    special: "Office Number",
    field: "officeNumber",
    validate: validate.int
  },
  Intern: {
    role: "Intern",
    special: "School",
    field: "school"
  }
};

/**
 * Lookup the special role question from the Employee Role
 *
 * @param role
 * Employee Role (string)
 *
 * @returns
 * 1 question array for Prompts with a special for that role question
 */
function getSpecialRoleQuestion(role) {
  const specialRole = specialRoles[role];
  const msg = specialRole.special;
  const name = specialRole.field;
  const val = specialRole.validate;
  return [
    {
      type: "input",
      message: msg,
      name: name,
      validate: val
    }
  ];
}

/**
 * @async Get Employee Info via prompts
 *
 * @param isManager
 * true if employee is a Manager
 *
 * @returns User input responses for a single employee
 */
async function getEmployeeInfo(isManager) {
  // Select the prompts to used based on Manager or non-Manager
  let initialPrompt = isManager ? managerPrompt : employeePrompt;

  if (isManager) {
    out.heading("\n Project Manager Details \n");
  }

  try {
    const responses = await inquirer.prompt(initialPrompt);

    // Don't prompt for role if we know it is a Manager
    if (isManager) {
      responses.role = "Manager";
    }

    // Get the special question specific to the reole
    const questionsSpecial = getSpecialRoleQuestion(responses.role);
    const specialResponse = await inquirer.prompt(questionsSpecial);

    // Save the special role with the employee questions
    const specialRole = Object.keys(specialResponse)[0];
    // Add the special response to our initial responses object
    responses[specialRole] = specialResponse[specialRole];
    return responses;
  } catch (err) {
    out.error("getEmployeeInfo Error", err);
    throw err;
  }
}

/**
 * Create and return a new team member object
 *
 * @param input
 * User Input response object with Employee Info responses
 *
 * @returns a new Employee object (Engineer, Intern, or Manager)
 */
function createTeamMember(input) {
  let employee;

  switch (input.role) {
    case "Engineer":
      employee = new Engineer(input.name, input.id, input.email, input.github);
      break;
    case "Intern":
      employee = new Intern(input.name, input.id, input.email, input.school);
      break;
    case "Manager":
      employee = new Manager(
        input.name,
        input.id,
        input.email,
        input.officeNumber
      );
      break;
    default:
      out.error("\nUnknown Employee Role\n");
      break;
  }

  return employee;
}

/**
 * @async Add a team member to team array
 *
 * @param team
 * Team member object array
 *
 * @param isManager
 * true if adding a Manager, false otherwise
 */
async function addTeamMember(team, isManager) {
  try {
    // Prompt the user for employee info
    const employeeData = await getEmployeeInfo(isManager);
    // Create an object to represent the employee
    const employee = createTeamMember(employeeData);
    // Add the new object to team array
    team.push(employee);
    out.success("\nTeam Member Added\n");
  } catch (err) {
    out.error("addMember ERROR", err);
    throw err;
  }
}

/**
 * @async Initialize the application and run it. Generate a series of prompts
 * to allow the user to construct a team and then generate an HTML report of
 * the team.
 */
async function init() {
  const team = []; // Array to store team members
  let res; // Hold the user reponses
  let exitWhile = false; // Flag to tell us when to exit

  try {
    // Start the main loop
    out.debug("\nStarting the shell\n");

    // Get the Manager Details
    await addTeamMember(team, true);

    do {
      // Prompt the user and save responses
      res = await inquirer.prompt(shellPrompt);

      // Check which command was entered
      switch (res.cmd) {
        // cmd = Add a New Team Member
        case ADD_MEMBER_STR:
          await addTeamMember(team, false);
          break;

        // cmd = Generate a Report
        case GENERATE_REPORT_STR:
          let html = await report.generate(team);
          fs.writeFileSync(outputPath, html, "utf8");
          out.success("\nReport Generated\n");
          break;

        // cmd = Quit
        case QUIT_STR:
          exitWhile = true; // Break the while
          break;

        // cmd = unknown command (Should not happen)
        default:
          out.error("\nUnknown Command\n");
          break;
      }
      // Remain in this loop until the user tells us to quit
    } while (!exitWhile);
    // Out of main loop - exit
    out.debug("\nEnding the shell\n");
  } catch (err) {
    // Oh shit
    out.error("ERROR", err);
  }
}

//============================================================
// Kick off the application
//============================================================
init();
