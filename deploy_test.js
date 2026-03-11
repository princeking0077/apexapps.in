const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    console.log('Connected to VPS...');
    const cmd = `export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh" && cd /var/www/apexapps.in && echo "Installing dependencies..." && npm install && echo "Building Next.js app..." && npm run build && echo "Restarting PM2..." && pm2 restart all`;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code) => {
            console.log('Deployment finished with code: ' + code);
            conn.end();
        }).on('data', d => process.stdout.write(d)).stderr.on('data', d => process.stderr.write(d));
    });
}).connect({
    host: '187.77.191.122',
    port: 22,
    username: 'root',
    password: 'Shoaib@001001',
    readyTimeout: 99999
});
