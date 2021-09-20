//api list


//
var cors="https://cors-anywhere.herokuapp.com/"
/*人相似度

photo==base64

*/

fetch("https://www.sk-ai.com/Experience/facesearch", {
  "headers": {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "pragma": "no-cache",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest"
  },
  "referrer": "https://www.sk-ai.com/Experience/face-compare",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": "photo1="+"&photo2="+"&thing=contrast",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
}).then((response) => {
    return response.json(); 
  }).then((jsonData) => {
    console.log(jsonData);
  }).catch((err) => {
    console.log('錯誤:', err);
});