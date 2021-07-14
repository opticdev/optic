const allUseCases = require('./use-cases');
const allWorkflows = require('./workflows');

module.exports = {
  title: 'Optic',
  tagline: 'Optic documents your APIs as you build them',
  url: 'https://useoptic.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'opticdev', // Usually your GitHub org/user name.
  projectName: 'optic', // Usually your repo name.
  themeConfig: {
    googleAnalytics: {
      trackingID: 'UA-137236875-1',
    },
    // algolia: {
    //   apiKey: 'b2709a62d582be097dd8841886113119',
    //   indexName: 'optic-oss',
    //
    //   // Optional: see doc section below
    //   contextualSearch: true,
    //
    //   // Optional: see doc section below
    //   appId: 'BJWK3RB6C3',
    //
    //   // Optional: Algolia search parameters
    //   searchParameters: {},
    //
    //   //... other Algolia params
    // },
    hideableSidebar: false,
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
    },
    navbar: {
      title: 'Optic',
      logo: {
        alt: 'Optic logo',
        src: 'img/optic-logo.png',
        srcDark: 'img/optic-logo-dark.png',
      },
      items: [
        {
          to: '/docs',
          activeBasePath: '/docs',
          label: 'Docs',
          position: 'right',
        },
        // {
        //   label: 'Workflows',
        //   items: [
        //     allWorkflows.CIGitBot,
        //     allWorkflows.TeamDesignFirst,
        //     // allWorkflows.DevelopWithOpticLocally,
        //   ],
        //   position: 'right',
        // },
        {
          to: '/blog',
          activeBasePath: '/blog',
          label: 'Blog',
          position: 'right',
        },
        {
          to: '/community',
          activeBasePath: '/community',
          label: 'Community',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'Join Community',
              href: '/community',
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/t9hADkuYjP',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/@useoptic',
            },
            {
              label: 'GitHub Discussion',
              href: 'https://github.com/opticdev/optic/discussions',
            },
          ],
        },
        {
          title: 'Documentation',
          items: [
            {
              label: 'Documentation',
              href: '/docs',
            },
            {
              label: 'Use Cases',
              href: '/document',
            },
            {
              label: 'Reference',
              href: '/reference',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Careers',
              href: '/careers',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/opticdev/optic',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Optic Labs`,
    },
    prism: {
      additionalLanguages: ['csharp', 'rust', 'elixir'],
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/opticdev/optic/edit/develop/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/opticdev/optic/edit/develop/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  stylesheets: [
    'https://fonts.googleapis.com/css?family=Inter:200,400,600,700',
    'https://fonts.googleapis.com/css?family=Ubuntu+Mono:200,400,600,700',
  ],
  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            to: '/document',
            from: [
              '/docs/get-started/config',
              '/docs/get-started/config/intercept',
              '/docs/get-started/config/run-with-optic',
              '/docs/get-started/config/proxy',
              '/docs/using/share-with-team',
              '/docs/actix',
              '/docs/c-sharp',
              '/docs/django',
              '/docs/elixir',
              '/docs/express',
              '/docs/fastapi',
              '/docs/flask',
              '/docs/mux',
              '/docs/hapi',
              '/docs/laravel',
              '/docs/lithium',
              '/docs/pistache',
              '/docs/puma',
              '/docs/rocket',
              '/docs/rocket-ignite',
              '/docs/rails',
              '/docs/sails',
              '/docs/spring',
              '/docs/intellij',
            ],
          },
          {
            to: '/community',
            from: [
              '/docs/community',
              '/docs/optic/get-involved',
              '/docs/optic/roadmap',
            ],
          },
          {
            to: '/document/baseline',
            from: ['/docs/using/baseline'],
          },
          {
            to: '/change/diff-review',
            from: ['/docs/using/reviewing-diffs', '/docs/using/review-diffs'],
          },
          {
            to: '/change/ci',
            from: ['/apiops/pull-requests'],
          },
          {
            to: '/',
            from: ['/docs/demo'],
          },
          {
            to: '/test',
            from: ['/docs/get-started/testing'],
          },
          {
            to: '/test/run-in-ci',
            from: ['/docs/circleci', '/docs/github-actions'],
          },
          {
            to: '/reference/optic-cli/commands/debug',
            from: ['/docs/using/troubleshooting'],
          },
          {
            to: '/capture',
            from: ['/docs/integrations/integrations', '/docs/deploy/live'],
          },
          {
            to: '/reference/optic-yaml/scripts',
            from: [
              '/docs/faqs-and-troubleshooting/scripts',
              '/docs/apiops/scripts',
            ],
          },
          {
            to: '/reference/optic-yaml/ignore',
            from: ['/docs/faqs-and-troubleshooting/captures'],
          },
          {
            to: '/reference/optic-yaml',
            from: ['/docs/using/advanced-configuration'],
          },
          {
            to: '/reference/optic-cli/commands/help',
            from: ['/docs/using/cli-commands'],
          },
          {
            to: '/reference/optic-cli/commands/generate',
            from: ['/docs/apiops/openapi'],
          },
          {
            to: '/reference/spectacle',
            from: ['/docs/using/spectacle'],
          },
        ],
        createRedirects: function (existingPath) {
          if (existingPath.indexOf('/docs/deploy/') >= 0) {
            return existingPath.replace(
              '/docs/deploy/',
              '/reference/real-environments/'
            );
          }
        },
      },
    ],
  ],
};
