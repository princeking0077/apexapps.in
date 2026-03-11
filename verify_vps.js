const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    console.log('Connected...');
    const cmd = `
    export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh" &&
    cd /var/www/apexapps.in &&
    echo "Node: $(node --version), NPM: $(npm --version)" &&
    npm install &&
    npm run build &&
    pm2 restart all &&
    echo "=== SUCCESS ===" &&
    git log --oneline -1
  `;
    conn.exec(cmd, { pty: false }, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code) => { console.log('Exit:', code); conn.end(); })
            .on('data', d => process.stdout.write(d))
            .stderr.on('data', d => process.stderr.write(d));
    });
}).connect({ host: '187.77.191.122', port: 22, username: 'root', password: 'Shoaib@001001', readyTimeout: 99999 });
