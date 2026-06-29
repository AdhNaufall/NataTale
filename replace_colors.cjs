const fs = require('fs');
const path = require('path');

const walk = dir => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/terracotta/g, 'lavender');
  content = content.replace(/caramel/g, 'softblue');
  content = content.replace(/sage-green/g, 'mint');
  content = content.replace(/sage/g, 'mint');
  content = content.replace(/espresso/g, 'slate');
  content = content.replace(/charcoal/g, 'slate');
  fs.writeFileSync(file, content);
});
console.log('Colors replaced successfully!');
