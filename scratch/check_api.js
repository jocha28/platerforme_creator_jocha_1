const http = require('http');

http.get('http://localhost:3000/api/init', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('API Response Keys:', Object.keys(json));
      console.log('Recent Track IDs:', json.recentTrackIds);
      console.log('Weekly Top Track IDs:', json.weeklyTopTrackIds);
      console.log('Weekly Top Release IDs:', json.weeklyTopReleaseIds);
      console.log('Play History File exists:', require('fs').existsSync('.data/play-history.json'));
      if (require('fs').existsSync('.data/play-history.json')) {
        const history = JSON.parse(require('fs').readFileSync('.data/play-history.json', 'utf8'));
        console.log('Play History Length:', history.length);
        console.log('First 3 entries:', history.slice(0, 3));
      }
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
      console.log('Raw data:', data.slice(0, 500));
    }
  });
}).on('error', (err) => {
  console.error('Error fetching API:', err.message);
});
