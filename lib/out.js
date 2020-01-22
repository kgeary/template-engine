const chalk = require("chalk");

// Enable debugging via cmd line args
const debug = process.argv[2] === "debug";

/**
 * Debug Output. Only shows up if debug flag is enabled
 *
 * @param {any[]} str
 * What to display
 */
function debugOut(...str) {
  if (debug) {
    console.log(chalk.grey(...str));
  }
}

/**
 * Error Output. Add formatting to error messages
 *
 * @param {any[]} str
 * What to display
 */
function errorOut(...str) {
  console.log(chalk.bold.red(...str));
}

/**
 * Success Output. Add formatting to output messages
 *
 * @param {any[]} str
 * What to display
 */
function successOut(...str) {
  console.log(chalk.bold.green(...str));
}

/**
 * Heading Output. Green Background with Black Text
 *
 * @param {any[]} str
 * What to display
 */
function headingOut(...str) {
  console.log(chalk.bgGreen.black(...str));
}

module.exports = {
  error: errorOut,
  debug: debugOut,
  success: successOut,
  heading: headingOut
};
