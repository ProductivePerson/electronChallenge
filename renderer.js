// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

let https = require("https"),
    axios = require ('axios'),
    dateFormat = require('dateformat');


let CURRENCY = "USD";
let currRates;
let txData = [];


//A simple IFFE using an axios library to get up-to-date currency exchange rates
const setCurrency = (() => {
  axios.get('https://blockchain.info/ticker')
    .then(res => {
      currRates = res.data;
      hydrateCurrencies(currRates);
    })
    .catch(err => console.error(err));
})();

const hydrateCurrencies = (xRates) => {
  for (let country in xRates) {
    $('#exchangeRates')
      .append(`<option name=${country} value=${country}>${country}</option>`);
    }
};

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
      console.error("Error. Status ", res.statusCode);

    res.resume();
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
  });
};

let interpretBitIndexes = function(code, data) {
  const { txIndexes } = data,
          url = 'https://blockchain.info/rawtx/';

  txIndexes.slice(0, 10).forEach(txIndex =>
    $.get(url + txIndex, hydrateTenTransactions)
  );
};

let hydrateTenTransactions = res => {
  res.out.forEach(tx => {
      tx.time = res.time;

      txData.push(tx);

      if (txData.length === 10)
        buildTransactions(txData);
  });
};

let buildTransactions = (txData) => {
  const ul = $('.flipster ul');
  txData.forEach(tx => {
    var t = buildSingleTx(tx);
    ul.append(t);
  });

  initializeFlipster();
};

let buildSingleTx = tx => {
  let $tran = $('<div class="transaction" />'),
      val = generateValue(tx.value),
      date = new Date(tx.time),
      fDate = dateFormat(date, "longTime");

  $tran.append('<p class="bCoinTime">An exchange at\n ' + date + ': </p>');
  $tran.append('<p class="bCoinVal">' + val + '</p>');

  return $('<li />').append($tran);
};

let generateValue = (num) => {
  return currRates[CURRENCY].symbol +
          (num / 100000000 * currRates[CURRENCY]['15m']).toFixed(2);
};

let toggleCurrency = () => {
  CURRENCY = $('#exchangeRates').val();

  $('.bCoinVal').text((idx) => {
    return generateValue(txData[idx].value);
  });
};

let initializeFlipster = function() {
  $('.flipster').flipster({
      style: 'carousel'
  });
  $('#exchangeRates').fadeIn(1000);
};

getBitIndexes(interpretBitIndexes);

module.exports.toggleCurrency = toggleCurrency;
