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

const shellPrompt = [
  {
    type: "list",
    message: "What would you like to do?",
    name: "cmd",
    choices: [ADD_MEMBER_STR, GENERATE_REPORT_STR, QUIT_STR],
  }
];

const questionsEmployee = [
  {
    type: "list",
    message: "Select an employee type",
    name: "type",
    choices: ["Manager", "Engineer", "Intern"],
  },
  {
    type: "input",
    message: "Employee Name",
    name: "name",
  },
  {
    type: "number",
    message: "Employee ID",
    name: "id",
  },
  {
    type: "input",
    message: "Employee Email",
    name: "email",
  },
];

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
  },
  {
    name: "Intern",
    role: "School",
    field: "school",
  },
];

function getSpecialRoleQuestion(type) {
  const specialRole = specialRoles.find(x => x.name === type);
  const msg = specialRole.role;
  const name = specialRole.field;
  return [
    {
      type: "input",
      message: msg,
      name: name
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

async function getEmployee() {
  const responses = await inquirer.prompt(questionsEmployee);
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
function generateEmployee(data) {
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
      console.log("Unknown Employee Type");
      break;
  }

  return employee;
}

//=========================================
// Generate report based off team array
//=========================================
async function generateReport(team) {
  let teamHtml = "";
  for (let memberIndex = 0; memberIndex < team.length; memberIndex++) {
    const member = team[memberIndex];   
    let template1 = await readFileAsync(`./template/employee.html`, "utf8");
    let template2 = await readFileAsync(`./template/${member.role.toLowerCase()}.html`, "utf8");
    let partial = updateTemplate(template1, member);
    teamHtml += updateTemplate(partial, { special: updateTemplate(template2, member) });
  }

  let template = await readFileAsync(`./template/main.html`, "utf8");
  let finalHtml = updateTemplate(template, {content: teamHtml});
  await writeFileAsync("./team.html", finalHtml);
}

function updateTemplate(html, data) {
  do {
    let match = html.match(/{{ (\w*) }}/);
    if (!match) { break; }
    let field = match[1];
    if (data[field]) {
      html = html.replace(/{{ \w* }}/, data[field]);
    } else {
      break; // TODO - fix this
    }
  } while (true);

  return html;
}

//=========================================
// initialize and run the application
//=========================================
async function init() {

  const team = [];
  let res;
  let exitWhile = false;

  debugOut("OK", "Starting the shell");
  do {
    res = await inquirer.prompt(shellPrompt);

    console.log("CMD", res.cmd);
    switch (res.cmd) {
      case ADD_MEMBER_STR:
        const employeeData = await getEmployee();
        const employee = generateEmployee(employeeData);
        team.push(employee);
        break;

      case GENERATE_REPORT_STR:
        if (team.length < 1) {
          console.log("You have no team members! Add Team Members first");
        }
        await generateReport(team);
        console.log("Report Generated");
        break;

      case QUIT_STR:
        exitWhile = true; // Break the while
        break;

      default:
        console.log("Unknown Command");
        break;
    }
  } while (!exitWhile)
  debugOut("Ending the shell");
}

//=========================================
// Kick off the application
//=========================================
init();