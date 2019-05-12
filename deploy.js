const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const {interface, bytecode} = require('./compile');

const provider = new HDWalletProvider(
  'unfair surface aunt six fatigue elephant canoe trend trip divorce cube art',
  'https://rinkeby.infura.io/v3/16f850be600d4f2dba1ae70223b4e2e8'
);
const web3 = new Web3(provider);

const deploy = async () => {

  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
      .deploy({ data:bytecode })
      .send({ gas:'1000000', from:accounts[0] });

  console.log(interface);
  console.log('Contract deployed to', result.options.address);

};

deploy();