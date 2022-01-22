/*==================================================
  Modules
  ==================================================*/
  const axios = require('axios')
  const sdk = require('@defillama/sdk');
  const BigNumber = require('bignumber.js');
  const _ = require('underscore');

/*==================================================
  Addresses
  ==================================================*/
  enum PoolType {
    BTC,
    ETH,
    USD,
  }

  const btcPoolAddress = "0x4f6A43Ad7cba042606dECaCA730d4CE0A57ac62e"
  const usdPoolAddress = "0x3911f80530595fbd01ab1516ab61255d75aeb066"
  const veth2PoolAddress = "0xdec2157831D6ABC3Ec328291119cc91B337272b5"
  const alethPoolAddress = "0xa6018520eaacc06c30ff2e1b3ee2c7c22e64196a"
  const usdV2PoolAddress = "0xaCb83E0633d6605c5001e2Ab59EF3C745547C8C7"
  const susdPoolAddress = "0x0C8BAe14c9f9BF2c953997C881BEfaC7729FD314"
  const veth2 = "0x898BAD2774EB97cF6b94605677F43b41871410B1"
  const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  const d4Pool = "0xc69ddcd4dfef25d8a793241834d4cc4b3668ead6"
  const btcV2PoolAddress = "0xdf3309771d2BF82cb2B6C56F9f5365C8bD97c4f2"
  const tbtcV2MetapoolAddress = "0xf74ebe6e5586275dc4CeD78F5DBEF31B1EfbE7a5"
  const wcusdMetapoolAddress = "0x3F1d224557afA4365155ea77cE4BC32D5Dae2174"
  const susdMetapoolV2Address = "0x824dcD7b044D60df2e89B1bB888e66D8BCf41491"
  const tbtcV2MetapoolV2Address = "0xA0b4a2667dD60d5CdD7EcFF1084F0CeB8dD84326"
  const wcusdMetapoolV2Address = "0xc02D481B52Ae04Ebc76a8882441cfAED45eb8342"

  const tokens = {
    // TBTC
    "0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa": [btcPoolAddress],
    // RENBTC
    "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d": [btcPoolAddress, btcV2PoolAddress],
    // WBTC
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": [btcPoolAddress, btcV2PoolAddress],
    // SBTC
    "0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6": [btcPoolAddress, btcV2PoolAddress],
    // DAI
    "0x6B175474E89094C44Da98b954EedeAC495271d0F": [usdPoolAddress, usdV2PoolAddress],
    // USDC
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": [usdPoolAddress, usdV2PoolAddress],
    // USDT
    "0xdAC17F958D2ee523a2206206994597C13D831ec7": [usdPoolAddress, usdV2PoolAddress],
    // SUSD
    "0x57ab1ec28d129707052df4df418d58a2d46d5f51" : [susdPoolAddress],
    // WETH
    [weth] : [veth2PoolAddress, alethPoolAddress],
    // VETH2
    [veth2] : [veth2PoolAddress],
    // alETH
    "0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6" : [alethPoolAddress],
    // SETH
    "0x5e74C9036fb86BD7eCdcb084a0673EFc32eA31cb" : [alethPoolAddress],
    // tBTCv2
    "0x18084fba666a33d37592fa2633fd49a74dd93a88" : [tbtcV2MetapoolAddress],
    // WCUSD
    "0xad3e3fc59dff318beceaab7d00eb4f68b1ecf195" : [wcusdMetapoolAddress]
  }

  const ethereum_pools = {
    [btcPoolAddress] : {
      type: PoolType.BTC,
      isMetaPool: false,
    },
    [usdPoolAddress] : {
      type: PoolType.USD,
      isMetaPool: false,
    }
    [alethPoolAddress] : {
      type: PoolType.ETH,
      isMetaPool: false,
    }
    [usdV2PoolAddress] : {
      type: PoolType.USD,
      isMetaPool: false,
    },
    [susdPoolAddress] : {
      type: PoolType.USD,
      isMetaPool: true,
    }
    [d4Pool] : {
      type: PoolType.USD,
      isMetaPool: false,
    }
    [btcV2PoolAddress] : {
      type: PoolType.BTC,
      isMetaPool: false,
    },
    [tbtcV2MetapoolAddress] : {
      type: PoolType.BTC,
      isMetaPool: true,
    },
    [wcusdMetapoolAddress] : {
      type: PoolType.USD,
      isMetaPool: true,
    },
    [susdMetapoolV2Address] : {
      type: PoolType.USD,
      isMetaPool: true,
    },
    [tbtcV2MetapoolV2Address] : {
      type: PoolType.BTC,
      isMetaPool: true,
    },
    [wcusdMetapoolV2Address] : {
      type: PoolType.USD,
      isMetaPool: true,
    },
  }

  const fantom_usdPoolAddress = "0xBea9F78090bDB9e662d8CB301A00ad09A5b756e9"

  const fantom_pools = {
    [fantom_usdPoolAddress]: {
      type: PoolType.USD,
      isMetaPool: false,
    }
  }

/*==================================================
  TVL
  ==================================================*/

  async function fetchEthereum() {

  }

  async function tvl(timestamp, block) {
    let balances = {};
    let calls = [];

    for (const token in tokens) {
      for(const poolAddress of tokens[token])
      calls.push({
        target: token,
        params: poolAddress
      })
    }

    // Pool Balances
    let balanceOfResults = await sdk.api.abi.multiCall({
      block,
      calls: calls,
      abi: 'erc20:balanceOf'
    });

    // Compute Balances
    _.each(balanceOfResults.output, (balanceOf) => {
        let address = balanceOf.input.target
        let amount =  balanceOf.output
        if(balanceOf.input.params[0] === veth2PoolAddress){
          if(address === veth2){
            return
          } else {
            amount = BigNumber(amount).times(2).toFixed()
          }
        }
        balances[address] = BigNumber(balances[address] || 0).plus(amount).toFixed()
    });

    let d4Tokens = (await axios.get(`https://api.covalenthq.com/v1/1/address/${d4Pool}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`)).data.data.items

     await Promise.all(
         d4Tokens.map( async (token) => {
           if(token.supports_erc) {
             const singleTokenLocked = sdk.api.erc20.balanceOf({
               target: token.contract_address,
               owner: d4Pool,
               block: block
             })
             sdk.util.sumSingleBalance(balances, token.contract_address, (await singleTokenLocked).output)
           }
         })
     )

    return balances;
  }

  async function fetchFantom() {
    let balanceCalls = [];
    let decimalCalls = [];
    const tvl = 0;

    for (const token in fantom_tokens) {
      for(const poolAddress of fantom_tokens[token]) {
        balanceCalls.push({
          target: token,
          params: poolAddress,
        })
      }
      decimalCalls.push({
        target: token,
      })
    }

    // Pool Balances
    let balanceOfResults = await sdk.api.abi.multiCall({
      calls: balanceCalls,
      abi: 'erc20:balanceOf',
      chain: "fantom"
    });
    // Fetch Decimals
    let decimalOfResults = await sdk.api.abi.multiCall({
      calls: decimalCalls,
      abi: 'erc20:decimals',
      chain: "fantom"
    });

    // Compute Balances
    // Since we only have stalbecoins on Fantom, we can just use the balance of the pool
    let sumOfBalancesDecimalAdjusted = BigNumber(0);
    _.each(balanceOfResults.output, (balanceOf) => {
        let address = balanceOf.input.target
        let rawAmount = BigNumber(balanceOf.output)
        decimalOfResults.output.find(decimalOf => {
          if(decimalOf.input.target === address) {
            let decimal = BigNumber(decimalOf.output)
            let amount = rawAmount.div(BigNumber(10).pow(decimal))
            sumOfBalancesDecimalAdjusted = sumOfBalancesDecimalAdjusted.plus(amount)
          }
        });
    });

    return sumOfBalancesDecimalAdjusted.toFixed();
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    ethereum: {
      start: 1611057090,        // January 19, 2021 11:51:30 AM
      tvl                       // tvl adapter
    },
    fantom: {
      fetch: fetchFantom(),
    }
  }
