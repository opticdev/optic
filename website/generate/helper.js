const fs = require('fs');
const path = require('path');
const { generateRuntimeOutput } = require('./reference-helper');

const frontmatter = require('frontmatter');

function generate(
  name,
  pathArray,
  docsTemplate,
  linkTemplate,
  outputPathArray
) {
  const include = (name, slug, path, link, metadata) =>
    allItemsInGroup.push({ name, slug, path, link, metadata });
  const allItemsInGroup = [];

  function generateDocPermutations(folder) {
    const items = fs.readdirSync(folder);
    items.forEach((i) => {
      const absoluteFilePath = path.join(folder, i);
      const { data } = frontmatter(
        fs.readFileSync(absoluteFilePath).toString()
      );
      const slug = i.split('.')[0];
      include(data.title, slug, absoluteFilePath, linkTemplate(slug), data);
    });
  }

  generateDocPermutations(path.join(__dirname, ...pathArray));

  fs.writeFileSync(
    path.join(__dirname, 'results', name + '.js'),
    generateRuntimeOutput(
      allItemsInGroup.map((i) => {
        return {
          ...i,
          outputPath: path.join(...outputPathArray, i.slug + '.mdx'),
        };
      })
    )
  );

  emptyDir(path.join(...outputPathArray));
  return allItemsInGroup.map((i) => {
    fs.writeFileSync(
      path.join(...outputPathArray, i.slug + '.mdx'),
      docsTemplate(i.name, i.slug, i.path, i.link, i.metadata).trimStart()
    );
    return i.link;
  });
}

module.exports = {
  generate,
};

function emptyDir(dir) {
  fs.readdirSync(dir, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlinkSync(path.join(dir, file), (err) => {
        if (err) throw err;
      });
    }
  });
}
