/**
  * Validate User Input for Numeric Values
  *
  * @param input
  * User Input for an Integer Value to be validated
  *
  * @returns
  * String describing failure, or true if valid
  */
function validateNumber(input) {

  if (!input.match(/^[0-9]+$/)) {
    return "Input must be a integer!";
  } else {
    return true;
  }
}

/**
  * Validate User Input for Email Address
  *
  * @param input
  * User Input for an Email Address to be validated
  * 
  * @returns
  * String describing failure, or true if valid
  */
function validateEmail(input) {
  if (!input.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) {
    return "Input must be a valid email address!";
  } else {
    return true;
  }
}

/**
  * Validate User Input for Github Profile Name
  *
  * @param input
  * User Input for an Github Profile Name to be validated
  * 
  * @returns
  * String describing failure, or true if valid
  */
function validateGithub(input) {
  if (!input.match(/^[A-Z0-9_]{3,}$/i)) {
    return "Input must be a valid Github name!";
  }

  return true;
}

/**
  * Validate User Input for Employee Name
  *
  * @param input
  * User Input for Employee Name to be validated
  * 
  * @returns
  * String describing failure, or true if valid
  */
function validateName(input) {
  if (!input.match(/^[A-Z][A-Z ]{0,}$/i)) {
    return "Name must contain at least 1 character and no invalid characters"; 
  } else {
    return true;
  }
}

module.exports = {
  int: validateNumber,
  email: validateEmail,
  github: validateGithub,
  name: validateName,
};