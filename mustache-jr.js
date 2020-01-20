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
  let cls;

  do {
    cls = Object.getPrototypeOf(obj);
    if (!Object.getPrototypeOf(cls)) {
      // Break the loop once we hit object
      break;
    }
    Object.getOwnPropertyNames(cls)
      .filter(i => i !== "constructor")
      .map(i => methods.push(i));

    obj = cls;
  } while (true);

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

  // Replace Methods
  const methods = getMethods(obj);
  for (let key of methods) {
    let re = new RegExp(`{{ ${key}\\(\\) }}`, "g");
    result = result.replace(re, obj[key]());
  }
  // Replace Properties
  // For each available key in the data object
  for (let key in obj) {
    // Use regex to replace {{ key }} with data[key] (global search)
    const re = new RegExp(`{{ (${key}) }}`, "g");
    result = result.replace(re, obj[key]);
  }

  return result;
}

module.exports = {
  update: updateTemplate,
};