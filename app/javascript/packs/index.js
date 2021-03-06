

var $ = require("jquery");

import Vue from 'vue/dist/vue.esm.js';

import GenericDashboard from './generic-dashboard'

import AlertRenderer from './alert-renderer'
import NavbarRenderer from './navbar-renderer'

import HomeRenderer from './home-renderer'

import InvoiceRenderer from './invoice-renderer'
import GetCryptoRenderer from './get-crypto-renderer'

import ActiveProductsContainerRenderer from './products/active-product-container-renderer'

import ProductShow from './products/product-show'
import OrderNew from './orders/order-new'


var url = require('url');

var web3utils = require('web3-utils')


//var flash = require('./flash')

var genericDashboard = new GenericDashboard();

var alertRenderer = new AlertRenderer();
var homeRenderer;
var getCryptoRenderer;
var invoiceRenderer;

var navbarRenderer;

$(document).ready(function(){

          var urlstring = window.location.href ;





          var url_parts = url.parse(urlstring, true);
          var query = url_parts.query;

          console.log('query2', query)



      navbarRenderer= new NavbarRenderer()
      navbarRenderer.init()

      if($("#home").length > 0){

          console.log('found home ' )
        homeRenderer = new HomeRenderer();

        genericDashboard.init(homeRenderer, query);


        var activeProductsContainerRenderer = new ActiveProductsContainerRenderer();
        activeProductsContainerRenderer.init();


      }


      if($("#user-show").length > 0){

        var activeProductsContainerRenderer = new ActiveProductsContainerRenderer();
        activeProductsContainerRenderer.init();

      }

      if($("#product-show").length > 0){

        var activeProductsContainerRenderer = new ActiveProductsContainerRenderer();
        activeProductsContainerRenderer.init();

        var productShow = new ProductShow();
        productShow.init();

      }

      if($("#order-new").length > 0){


        var orderNew = new OrderNew();
        orderNew.init();

      }


      if($("#invoice").length > 0){

        invoiceRenderer = new InvoiceRenderer();

        genericDashboard.init(invoiceRenderer, query);


      }

      if($("#get-crypto").length > 0){

        getCryptoRenderer = new GetCryptoRenderer();

        genericDashboard.init(getCryptoRenderer, query);


      }


});
