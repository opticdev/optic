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
      trackingID: 'G-Y7T04R4QF5',
    },
    hideableSidebar: true,
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
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          to: 'docs/community/',
          activeBasePath: 'docs/community',
          label: 'Community',
          position: 'left',
        },
        { to: 'blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/opticdev/optic',
          label: 'GitHub',
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
              href: '/docs/community',
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
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
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
      additionalLanguages: ['csharp'],
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
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
};
