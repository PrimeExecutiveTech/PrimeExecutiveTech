console.log("hi")
const { exec } = require('child_process');

exec('where node', (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`⚠️ Stderr: ${stderr}`);
    return;
  }
  console.log(`✅ Node.js path:\n${stdout}`);
});
