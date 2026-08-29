/**
 * Comprehensive Disposable and Temporary Email Detection Utility
 */

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  '10minutemail.com',
  '10minutemail.net',
  '10mail.org',
  'minuteinbox.com',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'sharklasers.com',
  'grr.la',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'cool.fr.nf',
  'courriel.fr.nf',
  'moncourrier.fr.nf',
  'monemail.fr.nf',
  'monmail.fr.nf',
  'throwawaymail.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'dispostable.com',
  'fakeinbox.com',
  'fakemailgenerator.com',
  'getnada.com',
  'nada.ltd',
  'nada.email',
  'mohmal.com',
  'crazymailing.com',
  'inboxkitten.com',
  'mytemp.email',
  'tempail.com',
  'burnermail.io',
  'burner.email',
  'emailondeck.com',
  'generator.email',
  'throwaway.email',
  'tempmail.net',
  'tempmailaddress.com',
  'zillamail.com',
  'maildrop.cc',
  'mintemail.com',
  'tempinbox.com',
  'harakirimail.com',
  'mailcatch.com',
  'nowmymail.com',
  'spamgourmet.com',
  'jetable.org',
  'boun.cr',
  'mytrashmail.com',
  'incognitomail.org',
  'anonymbox.com',
  'discard.email',
  'discardmail.com',
  'spambog.com',
  'mailnesia.com',
  'hidebux.com',
  'inboxbear.com',
  'emailfake.com',
  'trash-mail.com',
  'moakt.com',
  'tmailor.com',
  'internxt.com',
  'tmpmail.net',
  'tmpmail.org',
  'mailsac.com',
  'mailnull.com',
  'dropmail.me',
  '10minutemail.co.uk',
  'fakemail.net',
  'yapped.net',
  'byom.de',
  'crazymailing.com',
  'getairmail.com',
  'mohmal.im',
  'mohmal.in',
  'temp-mail.info',
]);

const DISPOSABLE_KEYWORDS = [
  'tempmail',
  'throwaway',
  'disposable',
  'fakeinbox',
  'trashmail',
  'guerrillamail',
  'sharklaser',
  '10minute',
  'burnermail',
  'emailondeck',
  'yopmail',
  'mailinator',
];

/**
 * Validates an email address and checks for disposable/temp email providers
 * @param {string} email
 * @returns {{ isValid: boolean, isDisposable: boolean, error?: string }}
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, isDisposable: false, error: 'Email is required.' };
  }

  const cleanEmail = email.toLowerCase().trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(cleanEmail)) {
    return { isValid: false, isDisposable: false, error: 'Please provide a valid email format.' };
  }

  const domain = cleanEmail.split('@')[1];
  if (!domain) {
    return { isValid: false, isDisposable: false, error: 'Invalid email domain.' };
  }

  // Check known disposable domain set
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      isDisposable: true,
      error: 'Temporary or disposable email addresses are not permitted. Please use your verified campus or permanent email address.',
    };
  }

  // Check disposable keyword sub-patterns
  const domainLower = domain.toLowerCase();
  for (const keyword of DISPOSABLE_KEYWORDS) {
    if (domainLower.includes(keyword)) {
      return {
        isValid: false,
        isDisposable: true,
        error: 'Temporary or disposable email addresses are not permitted. Please use your verified campus or permanent email address.',
      };
    }
  }

  return { isValid: true, isDisposable: false };
};

module.exports = {
  validateEmail,
  DISPOSABLE_DOMAINS,
};
