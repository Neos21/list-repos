const fs    = require('fs');
const https = require('https');

/**
 * Request
 * 
 * @param {string} url URL
 * @return {Promise<string>} Response Text
 */
const request = url => new Promise((resolve, reject) => {
  const req = https.request(url, {}, res => {
    let data = '';
    res.setEncoding('utf8')
       .on('data', chunk => { data += chunk; })
       .on('end' , ()    => { resolve(data); });
  }).on('error'  , error => { reject(error); })
    .on('timeout', ()    => { req.destroy(); reject('Request Timeout'); })
    .setTimeout(5000)
    .end();
});

// プログラミング言語名とカラーコードの対応表を取得する
(async () => {
  try {
    // 元データは https://github.com/github/linguist/blob/master/lib/linguist/languages.yml と思われる
    // https://github.com/ozh/github-colors/blob/master/colors.json
    const responseText = await request('https://raw.githubusercontent.com/ozh/github-colors/master/colors.json');
    
    const rawJson = JSON.parse(responseText);
    const colours = Object.entries(rawJson)
      .filter(([_key, value]) => value.color != null)
      .reduce((obj, [key, value]) => {
        obj[key] = value.color.toLowerCase();
        return obj;
      }, {});
    const coloursJson = JSON.stringify(colours, null, '  ') + '\n';
    
    fs.writeFileSync('./src/colours.json', coloursJson, 'utf8');
    console.log('Succeeded');
  }
  catch(error) {
    console.error('Error', error);
  }
})();
