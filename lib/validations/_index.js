
  // Data Normalization
  if (parameter.trim) { subject = subject.trim(); }
  if (parameter.toUpperCase) { subject = subject.toUpperCase(); }
  if (parameter.toLowerCase) { subject = subject.toLowerCase(); }

  // allow restrictions to be defined explicitly rather than using a flag
  if (parameter.restriction) {
    parameter[parameter.restriction] = true;
  }

  // multiple
  if (parameter.multipleOf && (subject % parameter.multipleOf === 0)) { return err('VALUE.MULTIPLE_OF', parameter.multipleOf); }

  // maximums
  if (parameter.maximum && subject > parameter.maximum) { return err('VALUE.MAX', parameter.maximum); }
  if (parameter.exclusiveMaximum && subject >= parameter.exclusiveMaximum) { return err('VALUE.EXCLUSIVE_MAX', parameter.exclusiveMaximum); }

  // minimums
  if (parameter.minimum && subject < parameter.minimum) { return err('VALUE.MIN', parameter.minimum); }
  if (parameter.exclusiveMinimum && subject <= parameter.exclusiveMinimum) { return err('VALUE.EXCLUSIVE_MIN', parameter.exclusiveMinimum); }


  // lengths
  if (parameter.maxlength && subject.length > parameter.maxLength) { return err('VALUE.MAX_LENGTH', parameter.maxLength); }
  if (parameter.maxItems && subject.length > parameter.maxItems)   { return err('VALUE.MAX_ITEMS', parameter.maxItems); }
  if (parameter.minLength && subject.length < parameter.minLength) { return err('VALUE.MIN_LENGTH', parameter.minLength); }
  if (parameter.minItems && subject.length < parameter.minItems)   { return err('VALUE.MIN_ITEMS', parameter.minItems); }

  // pattern/regex
  if (parameter.pattern) {
    let regex = new RegExp(parameter.pattern);
    if (!regex.test(subject)) { return err('VALUE.PATTERN', parameter.pattern); }
  }

  // unique items
  if (parameter.uniqueItems && _.isArray(subject)) { throw Error('uh oh! uniqueItems is not currently supported. Please try back later'); }

  // property counts
  if (parameter.maxProperties && Object.keys(subject).length > parameter.maxProperties) { return err('VALUE.MAX_PROPERTIES', parameter.maxProperties); }
  if (parameter.minProperties && Object.keys(subject).length < parameter.minProperties) { return err('VALUE.MIN_PROPERTIES', parameter.minProperties); }

  // enum
  if (parameter.enum) {
    if (is.not.inArray(subject, parameter.enum)) { return err('VALUE.ENUM', parameter.enum.toString()); }
  }

  // email
  if (parameter.email && is.not.email(subject)) { return err('VALUE.EMAIL'); }

  // alphanumeric
  if (parameter.alphaNumeric && is.not.alphaNumeric(subject)) { return err('VALUE.ALPHANUMERIC'); }

  // lowercase
  if (parameter.lowercase && is.not.lowerCase(subject)) { return err('VALUE.LOWERCASE'); }

  // uppercase
  if (parameter.uppercase && is.not.upperCase(subject)) { return err('VALUE.UPPERCASE'); }

  if (!_.isEqual(subject, original)) return subject;
}
