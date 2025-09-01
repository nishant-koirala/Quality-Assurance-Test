const { spawn } = require('child_process');

console.log('Running Playwright tests...');

const testProcess = spawn('npx', ['playwright', 'test', 'tests\\contact.spec.js', '--project=chromium', '--reporter=line'], {
    cwd: process.cwd(),
    stdio: 'inherit'
});

testProcess.on('close', (code) => {
    console.log(`\nTest process exited with code: ${code}`);
    if (code === 0) {
        console.log('✅ Tests passed successfully!');
    } else {
        console.log('❌ Tests failed or had issues.');
    }
});

testProcess.on('error', (error) => {
    console.error('Error running tests:', error.message);
});
