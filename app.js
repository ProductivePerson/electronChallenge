// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

let https = require("https"),
    axios = require ('axios'),
    dateFormat = require('dateformat');

const lastTenBits = (() => {
  // I use three private variables to maintain state across the module
  let CURRENCY = "USD",//determines which currency the bitcoin is output in
      exRates,//eventually becomes an object containing bitcoin exchange rates
      txData = [];//stores the last ten bitcoin transactions

  //A simple IFFE using an axios library to get up-to-date currency exchange rates
  //This function does two things: sets the exchange rates object
  // and calls a render function
  const setCurrency = (() => {
    axios.get('https://blockchain.info/ticker')
      .then(res => {
        exRates = res.data;
        renderExchangeRates(exRates);
      })
      .catch(err => console.error(err));
  })();

  //Populates a hidden dropdown menu on the main page with all currencies
  // generated from an API call.  This ensures that the front page will dynamically
  //generate all currencies recognized by the API and will render accordingly.
  const renderExchangeRates = (xRates) => {
    for (let country in xRates) {
      $('#exchangeRates')
        .append(`<option name=${country} value=${country}>${country}</option>`);
      }
  };

  //Cals blockchain API using an older node https method. This request returns
  //A large list of bitcoin indexes that I then pass to a callback.
  //the callback given is the interpretBitIndexes() function declared below
  let getBitIndexes = function(cb) {
    let data = "";

    https.get('https://blockchain.info/latestblock', (res) => {
      if (res.statusCode === 200) {
        res.on('data', function (chunk) {
          data += chunk;
        });

        res.on('end', function() {
           data = JSON.parse(data);

           cb(res.statusCode, data);
        });
      } else
        console.error("Error. Status ", res.statusCode);

      res.resume();
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
    });
  };

  //Takes the first ten elements in an array of bitcoin transaction indexes and
  // passes them into a hydration function
  //Uses jQueries built-in GET method for variety
  const interpretBitIndexes = function(code, data) {
    const { txIndexes } = data,
            url = 'https://blockchain.info/rawtx/';

    txIndexes.slice(0, 10).forEach(txIndex =>
      $.get(url + txIndex, hydrateTenTransactions)
    );
  };

  //function to be passed into interpretBitIndexes().
  // according to my research a single bitcoin transaction can actually
  // contain multiple exchanges. This is why I search each transaction output
  // and push each exchange into a object. Once that object reaches a length
  // of ten I call a render function.
  const hydrateTenTransactions = res => {
    res.out.forEach((tx, idx) => {
        tx.time = res.time;

        txData.push(tx);

        tx.index = txData.length;

        if (txData.length === 10)
          buildTransactions(txData);
    });
  };

  //Render function that does two thigns: appends to a specified DOM location
  // and initializes the fancy flipster
  const buildTransactions = (txData) => {
    const ul = $('.flipster ul');

    txData.forEach(tx =>
      buildSingleTx(tx).appendTo(ul)
    );

    initializeFlipster();
  };

  // build function that creates a single bitcoin transaction card
  const buildSingleTx = tx => {
    let $tran = $('<div class="transaction" />'),
        val = generateValue(tx.value),
        date = new Date(tx.time),
        fDate = dateFormat(date, "longTime"),
        type = tx.spent ? 'Expense' : 'Transfer';

    $tran.append(`<p class="bCoinTime">${type} #${tx.index} at ${fDate}: </p>`);
    $tran.append(`<p class="bCoinVal">${val}</p>`);
    $tran.attr("title", `address: ${tx.addr}`);

    return $('<li />').append($tran);
  };

  //Called when a user selects a currency exchange rate. Searches through all
  // displayed transactions and replaces bitcoin data with equivalant country
  // currency
  let toggleCurrency = () => {
    CURRENCY = $('#exchangeRates').val();

    $('.bCoinVal').text((idx) => {
      return generateValue(txData[idx].value);
    });
  };

  //helper function for toggleCurrency
  let generateValue = (num) => {
    return exRates[CURRENCY].symbol +
    (num / 100000000 * exRates[CURRENCY]['15m']).toFixed(2);
  };

  //triggers carousel feature for transactions
  let initializeFlipster = function() {
    $('.flipster').flipster({
        style: 'carousel',
        start: 0
    });
    $('#exchangeRates, #links').fadeIn(1000);
  };

  //called internally to trigger API calls upon module load
  getBitIndexes(interpretBitIndexes);

  //Only one function is needed by index.html so nothing else needs to be returned
  return { toggleCurrency };

})();

module.exports = {app:lastTenBits};
