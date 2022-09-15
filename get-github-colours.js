const fs    = require('fs');
const http  = require('http');
const https = require('https');

/**
 * Request
 * 
 * @param {string} url URL
 * @param {object} options Options
 * @return {Promise<string>} Response Text
 */
const request = (url = '', options = {}) => new Promise((resolve, reject) => {
  if(Object.prototype.toString.call(url) !== '[object String]' || !url || !url.startsWith('http')) return reject('Invalid URL Argument');
  const body             = options.body;
  const responseEncoding = options.responseEncoding ?? 'utf8';
  const timeout          = options.timeout          ?? 5000;
  delete options.body;
  delete options.responseEncoding;
  delete options.timeout;
  const agent = url.startsWith('https:') ? https : http;
  const req = agent.request(url, options, res => {
    res.setEncoding(responseEncoding);
    let data = '';
    res.on('data', chunk => { data += chunk; })
       .on('end' , ()    => { resolve(data); });
  }).on('error'  , error => { reject(error); })
    .on('timeout', ()    => { req.destroy(); reject('Request Timeout'); });
  if(timeout) req.setTimeout(timeout);
  if(body) req.write(body);
  req.end();
});

// プログラミング言語名とカラーコードの対応表を取得する
(async () => {
  try {
    // 元データは https://github.com/github/linguist/blob/master/lib/linguist/languages.yml と思われる
    // https://github.com/ozh/github-colors/blob/master/colors.json
    const responseText = await request('https://raw.githubusercontent.com/ozh/github-colors/master/colors.json');
    //const responseText = fs.readFileSync('./colors.json', 'utf-8');
    
    const rawJson = JSON.parse(responseText);
    const colours = Object.entries(rawJson)
      .filter(([_key, value]) => value.color != null)
      .reduce((obj, [key, value]) => {
        obj[key] = value.color.toLowerCase();
        return obj;
      }, {});
    const coloursJson = JSON.stringify(colours, null, '  ');
    
    fs.writeFileSync('./src/colours.json', coloursJson, 'utf-8');
    console.log('Succeeded');
  }
  catch(error) {
    console.error('Error', error);
  }
})();
