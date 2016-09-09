let https = require("https");

let getBitIndexes = function(cb) {
  let data = "",
      obj;

  https.get('https://blockchain.info/latestblock', (res) => {
    if (res.statusCode === 200) {
      res.on('data', function (chunk) {
        data += chunk;
      });

      res.on('end', function() {
         obj = JSON.parse(data);

         cb(res.statusCode, obj);
      });
    } else
      console.error("Error in request");

    res.resume();
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
  });
};

let hydrateTenHashes = function(code, data) {
  let { txIndexes } = data,
      ul = $('.flipster ul'),
      count = 0;
  const url = 'https://blockchain.info/rawtx/';


  console.log("Part two", txIndexes);

  txIndexes.slice(0, 10).forEach(idx => {
    $.get(url + idx, function(res){
      // let transaction = $('<li class="flip-item"><div class="flip-content flip-next"/></li>');
      // let text = $('<p class="bitcoinTrans" />').text(res.hash);
      // transaction.find('div').append(text);
      // transaction.appendTo(ul);

      console.log("Part three", res);
      let transaction = $('<li> <p class="bitcoinTrans" /> </li>');

      transaction.find('p').text(res.hash);
      transaction.appendTo(ul);
      count++;
      // if (count === 10)
        // initializeFlipster();
    });
  });


};

let initializeFlipster = function() {
  $('.flipster').flipster();
};

getBitIndexes(hydrateTenHashes);
