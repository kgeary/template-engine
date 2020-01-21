/**
 * Get the Methods associated with an object (not including Object's methods)
 *
 * @param obj
 * An object to get all methods from
 *
 * @returns
 * Array of method names
 */
function getMethods(obj) {
  let methods = [];
  let currentObj = obj;

  do {
    Object.getOwnPropertyNames(currentObj)
      .filter(i => i !== "constructor")
      .filter(i => typeof currentObj[i] === "function")
      .map(i => methods.push(i));

    // Set current Object to the prototype
    currentObj = Object.getPrototypeOf(currentObj);

    // Break the loop if the new current object's prototype is null
  } while (Object.getPrototypeOf(currentObj));

  return methods;
}

/**
 * Update HTML template file with fields in the data object
 *
 * @param html
 * HTML template as a string.
 *
 * @param obj
 * data object used to fill the templated fields
 *
 * @returns
 * Updated HTML string with data fields substituted in for templated fields
 * NOTE: No support for methods with arguments at this time
 * Examples:
 *  A templated field for obj.name would be {{ name }}
 *  A templated fidld for obj.getName() would be {{ getName() }}
 */
function updateTemplate(html, obj) {
  let result = html;

  // Replace Methods - get a list of methods on the object and prototypes
  const methods = getMethods(obj);
  for (let key of methods) {
    let re = new RegExp(`{{ ${key}\\(\\) }}`, "g");
    result = result.replace(re, obj[key]());
  }

  // Replace Properties - For each available key in the data object
  for (let key in obj) {
    if (typeof obj[key] === "function") {
      continue;
    } // skip methods
    // Use regex to replace {{ key }} with data[key] (global search)
    const re = new RegExp(`{{ (${key}) }}`, "g");
    result = result.replace(re, obj[key]);
  }

  return result;
}

module.exports = {
  update: updateTemplate
};
