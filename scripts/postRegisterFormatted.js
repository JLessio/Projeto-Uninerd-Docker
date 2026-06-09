const http = require('http');
const data = JSON.stringify({
  nome: 'Cypress Test Formatted',
  email: 'cypress.formatted@test.local',
  senha: 'Aa1!test123',
  nivel: 'paciente',
  cpf: '123.456.789-09'
});

const options = {
  hostname: 'localhost',
  port: 80,
  path: '/api/users/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  console.log('STATUS', res.statusCode);
  console.log('HEADERS', JSON.stringify(res.headers));
  let body = '';
  res.setEncoding('utf8');
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('BODY', body);
  });
});

req.on('error', (e) => {
  console.error('ERROR', e.message);
});

req.write(data);
req.end();
