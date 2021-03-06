require 'json'


class OrderController < ApplicationController

include OrderHelper
include CurrencyHelper
include PayspecBotHelper
include ProductHelper

  def new

    ##override the currency for now, built out full multi coin support later
    @currency = Currency.all.first
  end

  def create

    parameters = orderCreationParams.to_h

    p 'create order w params '
    p parameters

    @cart = parameters[:cart]
    @ship_info = parameters[:shipping]

    #{"cart"=>{"0"=>{"product_id"=>"1", "quantity"=>"2"}}, "shipping"=>{"name"=>"a", "streetAddress"=>"b", "stateCode"=>"cd", "countryCode"=>"US", "zipCode"=>"d"}}

    if @cart.length == 0
      respond_to do |format|
        format.js { render json: {success:false, message: 'Cart is empty' }.to_json }
        format.html
      end
      return
    end


    p 'cart is'
    p @cart

    if OrderHelper.cartItemsHaveDifferentCurrencies?(@cart)
      respond_to do |format|
        format.js { render json: {success:false, message: 'Cart items use different currencies' }.to_json }
        format.html
      end
      return
    end

      @order = Order.new( )

  ##  @currency = Currency.all.first  #this should be a param
    @subtotalRaw = 0

      p 'meepo '





      @cart.each do |row|
        p 'item is '
        index = row[0]
        item = row[1]
        p item
        prod_id = item[:product_id].to_i
        currency_id = item[:currency_id].to_i

        @quantity = item[:quantity].to_i
        @product = Product.find_by_id(prod_id)
        @currency = Currency.find_by_id(currency_id)
        @price_data = ProductHelper.getPriceOfCurrency(@product,@currency).getExportData

        @subtotalRaw = @subtotalRaw + @price_data[:price_raw_units] * @quantity

         p 'subtotal raw'
         p @subtotalRaw

         @order_row = @order.order_rows.build(product_id:prod_id, quantity: @quantity     )

         @order_row.build_product_price( currency: @currency, price_raw_units: @price_data[:price_raw_units]  )
      end

        # fix me


#the payspec server will automatically fill in the recipient address and the refNumber(increments)
    payspecData = {
      amountDue: @subtotalRaw,  #calc this from subtotal
      tokenAddress: @currency.eth_contract_address,
      description: (Rails.configuration.APPNAME+' Order')
    }



    PayspecBotHelper.setInvoicePaidCallbackURL() #init

    # locking up here
    @invoiceUUID = PayspecBotHelper.generateOffchainInvoice( payspecData )

    p 'got invoice uuid '
    p @invoiceUUID

    if(@invoiceUUID == nil)
      respond_to do |format|
        format.js { render json: {success:false, message: 'Server Error: Could not generate Payspec Invoice' }.to_json }
        format.html
      end
      return
    end





    @order.invoice_uuid = @invoiceUUID



      #add subtotal
    @order.subtotal_currency =  @currency
    @order.subtotal_raw_units = @subtotalRaw

    if(current_user)
      @order.user = current_user
    end


    #add shipping info
    p 'ship info'
    p @ship_info
    @order.build_shipping_info(ship_to_name: @ship_info[:name],streetAddress: @ship_info[:streetAddress] ,stateCode: @ship_info[:stateCode] ,zipCode: @ship_info[:zipCode],countryCode: @ship_info[:countryCode])


    @order.setOrderStatus(Order::order_statuses[:invoiced])

    @order.save!

    p 'new order: '
    p @order

    respond_to do |format|
      format.js { render json: {success:true, redirect_url: order_show_url(@order) }.to_json }
      format.html
    end

  #  redirect_to order_show_url(@order)
  end


  def show
    @order = Order.find_by(id: params[:id])

    # this needs to be done by this server on a regular interval
    OrderHelper.updateOrderPaidStatusFromBot(@order)


    @order_is_paid = @order.hasOrderStatus?(Order::order_statuses[:paid] )
    @order_is_shipped = @order.hasOrderStatus?(Order::order_statuses[:shipped] )


  end

  def invoiceCallback
    @order = Order.find_by(invoice_uuid: params[:order_uuid])

    redirect_to order_url(@order)
  end

  def index
  end


    def getShoppingListData
      p 'get shopping list data '

      parameters = shoppingCartParams.to_h

      p parameters
      cart = parameters[:cart].to_a

      @currency = nil

      @list = []
      @subtotalRaw = 0;
      @subtotalFormatted = 0;

      if cart.length == 0
        respond_to do |format|
          format.js { render json: {success:true, shoppingList:  @list, currency: Currency.all.first.getExportData, subtotalRaw: @subtotalRaw, subtotalFormatted: @subtotalFormatted , currency: @currency}.to_json }
          format.html
        end
        return
      end



      if OrderHelper.cartItemsHaveDifferentCurrencies?(cart)   #broken!
        respond_to do |format|
          format.js { render json: {success:false, message: 'Cart items use different currencies' }.to_json }
          format.html
        end
        return
      end



    #  p cart.to_s

       cart.each do |row|
         p 'item is '
         index = row[0]
         item = row[1]
         prod_id = item[:product_id].to_i
         currency_id = item[:currency_id].to_i

         @quantity = item[:quantity].to_i
         @product = Product.find_by_id(prod_id)
         @currency = Currency.find_by_id(currency_id)
         @price_data = ProductHelper.getPriceOfCurrency(@product,@currency).getExportData

         @subtotalRaw = @subtotalRaw + @price_data[:price_raw_units] * @quantity
          p 'subtotal raw'
          p @subtotalRaw
         @list << {product_id: @product.id, product: @product.getExportData, quantity: @quantity , price_data: @price_data}
       end

       p @list

       @subtotalFormatted = CurrencyHelper.getPriceFormatted({currency: @currency, raw_units: @subtotalRaw})

      respond_to do |format|
        format.js { render json: {success:true, shoppingList:  @list, currency: @currency.getExportData, subtotalRaw: @subtotalRaw, subtotalFormatted: @subtotalFormatted  }.to_json }
        format.html
      end


    end









private
    def shoppingCartParams
      params.permit(cart: [:product_id,:quantity,:currency_id])
    end


    def orderCreationParams
      params.permit(cart: [:product_id,:quantity,:currency_id],  shipping: [:name, :streetAddress, :stateCode, :zipCode, :countryCode ] )
    end


end
