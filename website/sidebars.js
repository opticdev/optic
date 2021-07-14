const allIntegrationDocs = require('./generate/generate-frameworks.js');
const allBrowserIntegrationDocs = require('./generate/generate-browsers.js');
const allToolsIntegrations = require('./generate/generate-tools.js');

const allUseCases = require('./use-cases');

module.exports = {
  useCasesSidebar: [
    {
      type: 'category',
      label: allUseCases.Document.label,
      collapsed: false,
      items: [
        'document/document',
        'document/baseline',
        'document/parameters',
        'document/bulk-learn',
        'document/ignoring',
        'document/what-next',
      ],
    },
    {
      type: 'category',
      label: allUseCases.Test.label,
      collapsed: false,
      items: [
        'test/test',
        'test/with-optic',
        'test/run-in-ci',
        'test/what-next',
      ],
    },
    {
      type: 'category',
      label: allUseCases.Change.label,
      collapsed: false,
      items: [
        'change/change',
        'change/ci',
        'change/updating',

        {
          type: 'category',
          label: 'Using Diffs to Update Spec',
          collapsed: true,
          items: ['change/options/status', 'change/options/diff-review'],
        },
        {
          type: 'category',
          label: 'Manual Editing',
          collapsed: true,
          items: [
            'change/options/delete',
            'change/options/revert',
            'change/options/descriptions',
            'change/options/add',
            'change/options/edit-body',
          ],
        },
      ],
    },
    {
      type: 'link',
      label: 'Reference Docs',
      href: '/reference',
    },
    // {
    //   type: 'category',
    //   label: allUseCases.Share.label,
    //   collapsed: false,
    //   items: ['share/share', 'share/changelogs', 'share/openapi'],
    // },
  ],
  referenceSideBar: [
    'reference/key-concepts',
    {
      type: 'category',
      label: 'Capturing Traffic',
      collapsed: false,
      items: [
        'reference/capture',
        {
          type: 'category',
          label: 'API Framework Integrations',
          items: allIntegrationDocs,
        },
        {
          type: 'category',
          label: 'Web Browsers',
          items: allBrowserIntegrationDocs,
        },
        {
          type: 'category',
          label: 'API Tools',
          items: allToolsIntegrations,
        },
        {
          type: 'category',
          label: 'Deployed Environments',
          items: [],
        },
      ],
    },
    {
      type: 'category',
      label: 'Optic CLI',
      collapsed: false,
      items: [
        'reference/optic-cli/commands/help',
        'reference/optic-cli/commands/init',
        'reference/optic-cli/commands/check',
        'reference/optic-cli/commands/run',
        'reference/optic-cli/commands/intercept',
        'reference/optic-cli/commands/exec',
        'reference/optic-cli/commands/spec',
        'reference/optic-cli/commands/status',
        'reference/optic-cli/commands/generate',
        'reference/optic-cli/commands/scripts',
        'reference/optic-cli/commands/debug',
      ],
    },
    {
      type: 'category',
      label: 'Config in optic.yml',
      collapsed: false,
      items: [
        'reference/optic-yaml/explained',
        'reference/optic-yaml/tasks',
        'reference/optic-yaml/environments',
        'reference/optic-yaml/scripts',
        'reference/optic-yaml/ignore',
      ],
    },
    {
      type: 'category',
      label: 'CI Workflows',
      collapsed: false,
      items: [
        'reference/ci/changelog',
        'reference/ci/test',
        'reference/ci/check',
      ],
    },
    {
      type: 'category',
      label: 'Real Environments',
      collapsed: false,
      items: [
        'reference/real-environments/aws-api-gateway',
        'reference/real-environments/azure-api-management',
        'reference/real-environments/azure-app-gateway',
        'reference/real-environments/cloudflare-worker',
        'reference/real-environments/envoy-proxy',
        'reference/real-environments/kubernetes',
        'reference/real-environments/nginx',
      ],
    },
    {
      type: 'category',
      label: 'Using Spectacle',
      collapsed: false,
      items: ['reference/spectacle/spectacle'],
    },
  ],
};
