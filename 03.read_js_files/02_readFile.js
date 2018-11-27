const fs = require('fs');
const readline = require('readline');
const stream = require('stream');

function readLines({ input }) {
  const output = new stream.PassThrough({ objectMode: true });
  const rl = readline.createInterface({ input });
  rl.on("line", line => { 
    output.write(line);
  });
  rl.on("close", () => {
    output.push(null);
  }); 
  return output;
}
const input = fs.createReadStream("test-read-write.txt");
(async () => {
  for await (const line of readLines({ input })) {
    console.log(line);
  }
})();

// const fs = require('fs');
// const util = require('util');

// const readFile = util.promisify(fs.readFile);
// const readdir = util.promisify(fs.readdir);

// async function read1 (file) {
// 	const label = `read1-${file}`;
// 	console.time(label);
// 	const data = await readFile(file, 'utf8');
// 	const header = data.split(/\n/)[0];
// 	console.timeEnd(label);
// }

// async function read2 (file) {
//   return new Promise(resolve => {
//     let header;
//     const label = `read2-${file}`;
//     console.time(label);
//     const stream = fs.createReadStream(file, {encoding: 'utf8'});
//     stream.on('data', data => {
//       header = data.split(/\n/)[0];
//       stream.destroy();
//     });
//     stream.on('close', () => {
//       console.timeEnd(label);
//       resolve();
//     });
//   });
// }

// async function startTests(file) {
// 	console.log(file);
// 	await read1(file);
// 	await read2(file);
// }

// readdir(__dirname).then(file => {
// 	startTests('files.txt');
// });