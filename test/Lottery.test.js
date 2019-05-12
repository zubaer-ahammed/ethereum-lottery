const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
//add provider - (for newer version of web3)
const provider = ganache.provider();

//console.log(ganache.provider());

const web3 = new Web3(provider);


const {interface, bytecode} =  require('../compile');


let accounts;
let lottery;

beforeEach(async () => {
    //Get list of all accounts

    accounts = await web3.eth.getAccounts();

    //console.log('Deploying from: ', accounts[0]);

    //Use one of those accounts to deploy the contract
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: 1000000 });

    //setProvider (for newer version of web3)
    lottery.setProvider(provider);

});

describe('Lottery Contract', () => {

    it('deploys a contract', () => {
        //console.log(inbox);
        assert.ok(lottery.options.address);
    });

    it('has a manager', async () => {
        //console.log(inbox);
        const manager = await lottery.methods.manager().call();
        console.log(manager);

        assert.ok(manager);
    });

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);

    });

    it('allows multiple account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);

    });

    it('requires a minimum amount of ether to enter', async () => {

        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('0.004', 'ether')
            });
            assert(false);
        } catch (e) {
            assert(e);
        }

    });

    it('only manager can call pickWinner', async () => {

        try {
            await lottery.methods.pickWinner().send({
                from: accounts[0]
            });
            assert(false);
        } catch (e) {
            assert(e);
        }

    });

    it('sends money to the winner and resets the players array', async () => {

        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);

        await lottery.methods.pickWinner().send({ from: accounts[0] });

        const finalBalance = await web3.eth.getBalance(accounts[0]);

        const difference = finalBalance - initialBalance;

        //console.log(difference);

        assert(difference > web3.utils.toWei('1.8', 'ether'));


    });

});
