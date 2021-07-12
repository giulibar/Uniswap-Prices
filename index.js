var Web3 = require('web3');
const ethers = require('ethers');
const BigNumber = require('bignumber.js');
const ABI = require('.//UniswapRouterABI.json');
//const ABI1 = require('.//BancorRouterABI.json');
const ABI2 = require('.//PoolABI.json');
//const BancorSDK = require('./sdk-master').SDK;

//const web3 = new Web3("wss://mainnet.infura.io/ws/v3/61166400586b4325bd12f699ab31f965"); // websocket de Infura para getmempool
//const web3 = new Web3("https://mainnet.infura.io/v3/61166400586b4325bd12f699ab31f965"); // RPC de Infura para funciones especificas
const Web3EthContract = require('web3-eth-contract');
Web3EthContract.setProvider('wss://mainnet.infura.io/ws/v3/61166400586b4325bd12f699ab31f965');
//Web3EthContract.setProvider('https://mainnet.infura.io/v3/61166400586b4325bd12f699ab31f965');





/* esto es para Bancor nada mas
const settings = {
    // optional, mandatory when interacting with the ethereum mainnet
    ethereumNodeEndpoint: 'https://mainnet.infura.io/v3/61166400586b4325bd12f699ab31f965',
};

async function create(){
    const BancorSDK = require('./sdk-master').SDK;
    const settings = {
        // optional, mandatory when interacting with the ethereum mainnet
        ethereumNodeEndpoint: 'https://mainnet.infura.io/v3/61166400586b4325bd12f699ab31f965',
    };
    
     bancorSDK = await BancorSDK.create(settings);
}
create();
*/

const Uniswap = {
    factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    recipient: '0xf11b2fc4f28150517af11c2c456cbe75e976f663'
}

const Bancor = {
    router: '0x2F9EC37d6CcFFf1caB21733BdaDEdE11c823cCB0'
}

const token = {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
    LPL: '0x99295f1141d58a99e939f7be6bbe734916a875b8',
    LINK: '0x514910771af9ca656af840dff83e8264ecf986ca',
}

const UniRouter = new Web3EthContract(ABI.abi, Uniswap.router);
//const BancorRouter = new Web3EthContract(ABI1.abi, Bancor.router);
const LplEthLP = new Web3EthContract(ABI2.abi, '0x966ea83CF3170a309184bB742398C925249E407e');
const EthUsdt = new Web3EthContract(ABI2.abi, '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852');

// retorna el input necesario para la salida de 1 unidad de output (cuanto usdt tengo que pagar por 1 eth por ejemplo) ,get token price from Uniswap 'router' 
async function getBuyPrice(tokenIn, tokenOut, router) {
    const amountOut = Web3.utils.toWei('1', 'ether');
    try {
        const amount = await router.methods.getAmountsIn(amountOut, [token[tokenIn], token[tokenOut]]).call();
        const price = (amount[0] * (10 ** -18)).toFixed(5);
        return price;
    } catch (error) {
        console.log("MI ERROR 1: " + error);
    }
}

// get the price from router using three tokens as path (IN,MID,OUT)
async function getBuyPriceByPath(tokenIn, tokenOut, tokenMid, router) {
    const amountOut = Web3.utils.toWei('1', 'ether');
    try {
        const amount = await router.methods.getAmountsIn(amountOut, [token[tokenIn], token[tokenMid], token[tokenOut]]).call();
        const price = (amount[0] * (10 ** -18)).toFixed(4);
        return price;
    } catch (error) {
        console.log("MI ERROR 3: " + error);
    }
}

// retorna el output de 1 unidad de input (cuanto usdt me dan por 1 eth por ejemplo) ,get token price from Uniswap 'router'
async function getSellPrice(tokenIn, tokenOut, router) {
    const amountIn = Web3.utils.toWei('1', 'ether');
    try {
        const amount = await router.methods.getAmountsOut(amountIn, [token[tokenIn], token[tokenOut]]).call();
        const price = (amount[1] * (10 ** -18)).toFixed(5);
        return price;
    } catch (error) {
        console.log("MI ERROR 1: " + error);
    }
}

// retorna el output de 1 unidad de input (cuanto usdt me dan por 1 eth por ejemplo) ,get token price from Uniswap 'router'
async function getSellPriceByPath(tokenIn, tokenMid, tokenOut, router) {
    const amountIn = Web3.utils.toWei('1', 'ether');
    try {
       // console.log('amount: '+amountIn+' tokenIn: '+tokenIn+' tokenMid: '+tokenMid+' tokenOut: '+tokenOut)
        const amount = await router.methods.getAmountsOut(amountIn, [token[tokenIn],token[tokenMid], token[tokenOut]]).call();
        const price = (amount[2] * (10 ** -18)).toFixed(5);
        return price;
    } catch (error) {
        console.log("MI ERROR 1: " + error);
    }
}

// get token price from Bancor 'router'
async function getPriceBancor(tokenIn, tokenOut, router) {
    const amountOut = Web3.utils.toWei('1', 'ether');
    try {
        const path = await router.methods.conversionPath(token[tokenIn], token[tokenOut]).call();
        console.log(path);
        const amount = await router.methods.getReturnByPath(path, amountOut).call();
        const price = (amount[0] * (10 ** -18)).toFixed(4);
        return price;
    } catch (error) {
        console.log("MI ERROR 2: " + error);
    }
}

// execute the getPrice() functions
async function init() {
    for (let i = 0; i < 1; i++) {
        let tokIn = 'WETH';
        let tokMid = 'WETH';
        let tokOut = 'DAI';
        let router = UniRouter;
       // let price = await getSellPriceByPath(tokIn, tokMid, tokOut, router);
        let price = await getSellPrice(tokIn, tokOut, router);
        console.log('----------------------------------------');
        console.log("Precio de 1 " + tokIn + " en Uniswap: " + price + " " + tokOut);
        console.log('----------------------------------------');
        /*
        let router = BancorRouter;
        let price = await bancorSDK.pricing.getPathAndRate(tokIn, tokOut, "1.0");
        console.log('----------------------------------------');
        console.log("Precio de 1 " + tokOut + " en Bancor: " + price);
        console.log('----------------------------------------');
        */
    }
}


// obtiene las tx de la mempool usando websocket Infura aunque a veces muestra solo el Txn Hash (la direccion de la transaccion)
async function getMempool() {
    var subscription = web3.eth.subscribe('newPendingTransactions', function (error, result) {})
        .on("data", function (transaction) {
            web3.eth.getTransaction(transaction).then(response => {
                if (response.to == '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' || response == '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f') {
                    console.log(response)
                } else {
                    console.log('No era de Uniswap');
                }
            });
        });
}


// obtiene las tx de la mempool haciendo llamadas susecivas https de Blockdaemon
function getMempool1() {
    const http = require('https');

    const options = {
        hostname: 'ubiquity.api.blockdaemon.com',
        port: 443,
        path: '/v2/ethereum/mainnet/txs',
        query: 'desc/null/1/ethereum/native/eth:ethereum/currency2',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer bd1bILrdTjfAZ19mNxRNCyRGOmWW4ilL2CTvHX3larat4BO',
            'Accept': 'application/json'
        }
    };

    http.get(options, (res) => {
        res.on('data', (d) => {
            const datos = ("" + d);
            console.log(datos);
        });

    }).on('error', (e) => {
        console.error(e);
    });
}

// escucha los eventos de swap que se dan en la pool de ETH-LPL
async function listenSwap() {
    var swap = EthUsdt.events.Swap({}).on('data', event => {
        let amountIn = (event.returnValues.amount0In) * (10 ** (-18));
        let amountOut = (event.returnValues.amount1Out) * (10 ** (-6));
        if (amountIn != 0) {
            console.log('------------------------------------------');
            console.log('txHash: ' + event.transactionHash);
            console.log('In: ' + amountIn);
            console.log('Out: ' + amountOut);
            console.log('Price: ' + amountOut / amountIn);
            console.log('------------------------------------------');
        }
    });
}


init()
//getMempool();
//getMempool1();
//listenSwap();


