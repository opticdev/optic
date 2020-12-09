export const IntegrationDocs = require('./loaded/setup.json');
export const CommonIssues = require('./loaded/common-issues.json');

export const integrationDocsOptions = (() => {
  const frameworks = [];
  Object.values(IntegrationDocs).forEach((lang) => {
    Object.entries(lang.frameworks).forEach(([key, value]) => {
      frameworks.push({
        value: key,
        label: value.pretty_name,
        data: { ...value}, //, start_command: lang.start_command },
        language: lang.pretty_name,
      });
    });
  });

  return frameworks;
})();

function capitalize(s) {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
