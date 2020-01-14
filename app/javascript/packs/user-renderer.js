
var $ = require("jquery");
import Vue from 'vue/dist/vue.esm.js';


//const relayConfig = require('../../../relay.config').config
//var io = require('socket.io-client');

var BigNumber = require('bignumber.js')
var ethereumHelper;
var web3utils = require('web3-utils')

const ContractInterface = require('./contract-interface')


var app;
var dashboardData;


var categoryTabSelector;
var productCards;




export default class HomeRenderer {

    init( ethHelper, params  )
    {

      var self = this;
      ethereumHelper = ethHelper;


      categoryTabSelector = new Vue({
          el: '#category-tabs',
          data: {
             activeTagIndex: firstcategoryid,
             categories: allcategories,


          },
          methods: {

                clickTab: function (event,index) {
                   this.activeTagIndex = index;
                   self.selectedProductCategory(index)
                }


            }

        })

        productCards= new Vue({
            el: '#product-cards',
            data: {
               products: featuredProducts,
               activeProducts: []

            },
            methods: {

                  clickCard: function (event,index) {
                      console.log('index')
                  }


              }

          })


          //init data
          this.selectedProductCategory(firstcategoryid)

    }

    selectedProductCategory(index)
    {
      console.log('selected category',index)

      this.updateActiveProducts();
    }

    updateActiveProducts()
    {
      var newArray = [];

     newArray = productCards.products.filter(item => item.product_category_id == categoryTabSelector.activeTagIndex)


      Vue.set(productCards, 'activeProducts', newArray)

    }


    async onWeb3Connected() //from eth helper callback
    {
      var self = this;
        console.log('on web3 connected')







    }

    async getInvoiceUUID( newInvoiceData, ethHelper )
    {
       console.log('sha 3 inputs ', ethHelper.getConnectedAccountAddress(), newInvoiceData.refNumber, newInvoiceData.description, newInvoiceData.tokenAddress, newInvoiceData.tokenAmount, newInvoiceData.recipientAddress)

      var digest = web3utils.soliditySha3( {t: 'uint256', v: newInvoiceData.refNumber }, {t: 'string', v: newInvoiceData.description }, {t: 'address', v: newInvoiceData.tokenAddress }, {t: 'uint256', v: newInvoiceData.tokenAmount }, {t: 'address', v: newInvoiceData.recipientAddress },{t: 'uint256', v: newInvoiceData.ethBlockExpiresAt });

      var digestBytes32 = web3utils.hexToBytes(digest)
      console.log('digestBytes32',digestBytes32)

      return digest;
    }

    async createNewInvoice(  newInvoiceData )
    {

      console.log('create new invoice ', newInvoiceData.refNumber, newInvoiceData.description,newInvoiceData.tokenAddress,newInvoiceData.tokenAmount,newInvoiceData.recipientAddress,newInvoiceData.blockExpiresAt)


      var web3 = ethereumHelper.getWeb3Instance();

      var env = ethereumHelper.getEnvironmentName()

      console.log('env ',env)

      var connectedAddress = ethereumHelper.getConnectedAccountAddress()

      var paySpecContract = ContractInterface.getPaySpecContract(web3,env)


      //web3.eth.defaultAccount = web3.eth.accounts[0]
       //personal.unlockAccount(web3.eth.defaultAccount)


      // await web3.eth.enable();

      var response =  await new Promise(function (result,error) {
         paySpecContract.createInvoice.sendTransaction(newInvoiceData.refNumber,newInvoiceData.description,newInvoiceData.tokenAddress,newInvoiceData.tokenAmount,newInvoiceData.recipientAddress,newInvoiceData.blockExpiresAt, function(err,res){
            if(err){ return error(err)}

            //console.log('res ', res)
            result(res);
         })
       });

       return response;



    }

    async payInvoice(  invoiceUUID )
    {

      console.log('pay invoice ', invoiceUUID)


      var web3 = ethereumHelper.getWeb3Instance();

      var env = ethereumHelper.getEnvironmentName()

      console.log('env ',env)

      var connectedAddress = ethereumHelper.getConnectedAccountAddress()

      var paySpecContract = ContractInterface.getPaySpecContract(web3,env)


      //web3.eth.defaultAccount = web3.eth.accounts[0]
       //personal.unlockAccount(web3.eth.defaultAccount)


      // await web3.eth.enable();

      var response =  await new Promise(function (result,error) {
         paySpecContract.payInvoice.sendTransaction(invoiceUUID, function(err,res){
            if(err){ return error(err)}

            result(res);
         })
       });


    }




/*

    async claimName(name)
    {
      var web3 = ethereumHelper.getWeb3Instance();

      var env = 'mainnet'

      var connectedAddress = ethereumHelper.getConnectedAccountAddress()

      var nametagContract = ContractInterface.getNametagContract(web3,env)

      var response =  await new Promise(function (result,error) {
         nametagContract.claimToken.sendTransaction(connectedAddress,name, function(err,res){
            if(err){ return error(err)}

            result(res);
         })
       });


    }

    async queryTokenOwner(name)
    {


            var web3 = ethereumHelper.getWeb3Instance();

             if(!web3) return;

            var env = 'mainnet'

            var nametagContract = ContractInterface.getNametagContract(web3,env)


            var tokenIdRaw =  await new Promise(function (result,error) {
               nametagContract.nameToTokenId.call(name, function(err,res){
                  if(err){ return error(err)}

                  result(res);
               })
             });

             var tokenIdNumber =  new BigNumber(tokenIdRaw).toFixed();

             var tokenOwnerAddress =  await new Promise(function (result,error) {
                nametagContract.ownerOf.call(tokenIdNumber, function(err,res){
                   if(err){ return error(err)}

                   result(res);
                })
              });


             Vue.set(tokenOwnerQuery, 'ownerResult', tokenOwnerAddress)
              Vue.set(tokenOwnerQuery, 'ownerURL', 'https://etherscan.io/address/' + tokenOwnerAddress)


    }

    async queryTokenId(name)
    {


            var web3 = ethereumHelper.getWeb3Instance();

             if(!web3) return;

            var env = 'mainnet'

            var nametagContract = ContractInterface.getNametagContract(web3,env)


            var tokenIdRaw =  await new Promise(function (result,error) {
               nametagContract.nameToTokenId.call(name, function(err,res){
                  if(err){ return error(err)}

                  result(res);
               })
             });

             var tokenIdNumber =  new BigNumber(tokenIdRaw).toFixed();

             Vue.set(tokenIdQuery, 'tokenIdResult', tokenIdNumber)



    }

    async queryTokenName(tokenId)
    {


            var web3 = ethereumHelper.getWeb3Instance();

             if(!web3) return;

            var env = 'mainnet'

            var nametagContract = ContractInterface.getNametagContract(web3,env)


            var tokenName =  await new Promise(function (result,error) {
               nametagContract.tokenURI.call(tokenId, function(err,res){
                  if(err){ return error(err)}

                  result(res);
               })
             });

             Vue.set(tokenNameQuery, 'tokenNameResult', tokenName)

    }


    async checkNameAvailability(name)
    {



      var web3 = ethereumHelper.getWeb3Instance();

       if(!web3) return;

      var env = 'mainnet'

      var nametagContract = ContractInterface.getNametagContract(web3,env)

      console.log(name)

      var tokenIdRaw =  await new Promise(function (result,error) {
         nametagContract.nameToTokenId.call(name, function(err,res){
            if(err){ return error(err)}

            result(res);
         })
       });


       var containsOnlyLower =  await new Promise(function (result,error) {
          nametagContract.containsOnlyLower.call(name, function(err,res){
             if(err){ return error(err)}

             result(res);
          })
        });

        if(!containsOnlyLower)
        {
          Vue.set(nametagInput, 'nametagAvailable', false)
          Vue.set(nametagInput, 'showAvailability', true)

          return
        }


       var tokenIdNumber =  new BigNumber(tokenIdRaw).toFixed();

        console.log(  tokenIdNumber  )

        var tokenOwnerAddress =  await new Promise(function (result,error) {
           nametagContract.ownerOf.call(tokenIdNumber, function(err,res){
              if(err){ return error(err)}

              result(res);
           })
         });



         var hasOwner = tokenOwnerAddress && tokenOwnerAddress != '0x'
           console.log(  hasOwner  )

           Vue.set(nametagInput, 'nametagAvailable', !hasOwner)
           Vue.set(nametagInput, 'showAvailability', true)



    }


    async updatePersonalNamesList()
    {
      var web3 = ethereumHelper.getWeb3Instance();

      var localMetamaskAddress = ethereumHelper.getConnectedAccountAddress();

       if(!web3) return;

       var env = 'mainnet'

       var nametagContract = ContractInterface.getNametagContract(web3,env)
       console.log('update names list', nametagContract)



           var currentEthBlock = await ethereumHelper.getCurrentEthBlockNumber()



            const _CONTRACT_ADDRESS = "0x3c642be0bb6cb9151652b999b26d80155bcea7de"
            const _TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"



              console.log('localMetamaskAddress',localMetamaskAddress)

                  var localMetamaskAddressFixed =  new BigNumber(localMetamaskAddress).toFixed();


                      var personalNames = []



                      /// need to fix from block
                      await web3.eth.filter({
                        fromBlock: (currentEthBlock - (30 * 1000)),
                            toBlock: currentEthBlock,
                            address: _CONTRACT_ADDRESS,
                            topics: [_TRANSFER_TOPIC, null],
                      }, async function(error,result)  {

                         var fromAddress = result.topics[1];
                         var toAddress = result.topics[2];
                         var tokenIdHex = result.topics[3];
                         var tokenIdNumber =  new BigNumber(tokenIdHex).toFixed();


                     //    var tokenName = await nametagContract.tokenURI.call( )

                         var tokenName =  await new Promise(function (result,error) {
                            nametagContract.tokenURI.call(tokenIdNumber, function(err,res){
                               if(err){ return error(err)}

                               result(res);
                            })
                          });

                          var toAddressFixed =  new BigNumber(toAddress).toFixed();
                          console.log('???', toAddressFixed, localMetamaskAddressFixed)

                         if(toAddressFixed == localMetamaskAddressFixed)
                         {
                           var nameData = {
                             to:  toAddress,
                             tokenIdHex: tokenIdHex,
                             tokenIdNumber: tokenIdNumber,
                             tokenName: tokenName,
                             tokenURL: 'https://etherscan.io/token/'+_CONTRACT_ADDRESS+'?a='+tokenIdNumber
                           }



                           console.log('learned', nameData)
                           if(personalNames.length< 35)
                           {
                               personalNames.push(nameData)
                           }


                         }

                       });

                       Vue.set(personalNamesList, 'list', personalNames)

    }





    async updateRecentNamesList()
    {


      var web3 = ethereumHelper.getWeb3Instance();

      var localMetamaskAddress = ethereumHelper.getConnectedAccountAddress();

       if(!web3) return;




      var env = 'mainnet'

      var nametagContract = ContractInterface.getNametagContract(web3,env)
      console.log('update names list', nametagContract)


          var currentEthBlock = await ethereumHelper.getCurrentEthBlockNumber()



           const _CONTRACT_ADDRESS = "0x3c642be0bb6cb9151652b999b26d80155bcea7de"
           const _TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

           var recentNames = []

           await web3.eth.filter({
             fromBlock: (currentEthBlock-3000),
                 toBlock: currentEthBlock,
                 address: _CONTRACT_ADDRESS,
                 topics: [_TRANSFER_TOPIC, null],
           }, async function(error,result)  {

              var fromAddress = result.topics[1];
              var toAddress = result.topics[2];
              var tokenIdHex = result.topics[3];
              var tokenIdNumber =  new BigNumber(tokenIdHex).toFixed();


          //    var tokenName = await nametagContract.tokenURI.call( )

              var tokenName =  await new Promise(function (result,error) {
                 nametagContract.tokenURI.call(tokenIdNumber, function(err,res){
                    if(err){ return error(err)}

                    result(res);
                 })
               });



              if(fromAddress == '0x0000000000000000000000000000000000000000000000000000000000000000')
              {
                var nameData = {
                  to:  toAddress,
                  tokenIdHex: tokenIdHex,
                  tokenIdNumber: tokenIdNumber,
                  tokenName: tokenName,
                  tokenURL: 'https://etherscan.io/token/'+_CONTRACT_ADDRESS+'?a='+tokenIdNumber
                }



                console.log('learned', nameData)
                if(recentNames.length< 25)
                {
                    recentNames.push(nameData)
                }


              }

            });

      Vue.set(recentNamesList, 'list', recentNames)


    }


    */


     update(renderData)
    {



    }



}
