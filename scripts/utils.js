const sanitizeFilename = require("sanitize-filename")
const diacritics = require('diacritics');
const { isString, escapeRegExp, flow, partialRight } = require('lodash');

const uriChars = /[\w\-.~]/i;
const ucsChars = /[\xA0-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFEF}\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E1000}-\u{EFFFD}]/u;
const validURIChar = char => uriChars.test(char);
const validIRIChar = char => uriChars.test(char) || ucsChars.test(char);
// `sanitizeURI` does not actually URI-encode the chars (that is the browser's and server's job), just removes the ones that are not allowed.
function sanitizeURI(str, { replacement = '', encoding = 'unicode' } = {}) {
  if (!isString(str)) {
    throw new Error('The input slug must be a string.');
  }
  if (!isString(replacement)) {
    throw new Error('`options.replacement` must be a string.');
  }

  let validChar;
  if (encoding === 'unicode') {
    validChar = validIRIChar;
  } else if (encoding === 'ascii') {
    validChar = validURIChar;
  } else {
    throw new Error('`options.encoding` must be "unicode" or "ascii".');
  }

  // Check and make sure the replacement character is actually a safe char itself.
  if (!Array.from(replacement).every(validChar)) {
    throw new Error('The replacement character(s) (options.replacement) is itself unsafe.');
  }

  // `Array.from` must be used instead of `String.split` because
  //   `split` converts things like emojis into UTF-16 surrogate pairs.
  return Array.from(str)
    .map(char => (validChar(char) ? char : replacement))
    .join('');
}

module.exports = (str) => {
    const encoding = 'unicode'
    const stripDiacritics = true
    const replacement = '-'

    if (!isString(str)) {
      throw new Error('The input slug must be a string.')
    }

    const sanitizedSlug = flow([
      ...(stripDiacritics ? [diacritics.remove] : []),
      partialRight(sanitizeURI, { replacement, encoding }),
      partialRight(sanitizeFilename, { replacement }),
    ])(str)

    // Remove any doubled or leading/trailing replacement characters (that were added in the sanitizers).
    const doubleReplacement = new RegExp(`(?:${escapeRegExp(replacement)})+`, 'g')
    const trailingReplacment = new RegExp(`${escapeRegExp(replacement)}$`)
    const leadingReplacment = new RegExp(`^${escapeRegExp(replacement)}`)

    const normalizedSlug = sanitizedSlug
      .replace(doubleReplacement, replacement)
      .replace(leadingReplacment, '')
      .replace(trailingReplacment, '')

    return normalizedSlug;
  }
