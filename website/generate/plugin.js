module.exports = (context, options) => {
  return {
    name: 'optic-generated-docs-plugin',
    async contentLoaded({ content, actions }) {
      const abc = require('./results/frameworks.json');
      console.log(abc);
      // actions.createData()
    },
  };
};
