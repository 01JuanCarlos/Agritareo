const fs = require('fs');

// node_modules\@pnotify\core
pnotifyPath = './node_modules/@pnotify/core';
const pnotifyExist = fs.existsSync(pnotifyPath);

if (pnotifyExist) {
  const stackContent = fs.readFileSync(pnotifyPath + '/Stack.d.ts', 'utf-8');
  const lines = stackContent.split('\n');


  const replaceLine = `import { Notice } from './';\n`;
  lines[0] = replaceLine;
  fs.writeFileSync(pnotifyPath + '/Stack.d.ts', lines.join('\r\n'));

  console.log('Librería PNotify modificada correctamente');
}
