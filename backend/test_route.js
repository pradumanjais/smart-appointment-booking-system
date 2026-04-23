const http = require('http');

http.get('http://localhost:5000', (res) => {
  console.log('Status Base:', res.statusCode);
});

// Since we don't have a token, we should get 401 Unauthorized if the route EXISTS.
// If the route DOES NOT EXIST, we should get 404.
http.get('http://localhost:5000/api/auth/user/645c1f...dummy', (res) => {
  console.log('Status Route:', res.statusCode);
  res.on('data', d => process.stdout.write(d));
});
