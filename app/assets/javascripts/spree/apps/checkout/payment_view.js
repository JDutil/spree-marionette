SpreeStore.module('Checkout',function(Checkout, SpreeStore, Backbone, Marionette, $, _){
  Checkout.paymentView = Backbone.Marionette.ItemView.extend({
    template: '#order-payment-template',

    events: {
      "submit .edit_order": "updateOrder",
      "change .payment-method": "updatePaymentMethod"
    },

    onShow: function() {
      $('.payment-method').first().attr("checked", "checked").trigger("change")
    },

    updateOrder: function(e) {
      $('#errorExplanation').hide();
      e.stopPropagation();
      e.preventDefault();
      var submit_button = $(e.target).find("input[type='submit']")
      submit_button.attr('disabled', true);
      submit_button.slideUp(function() {
        $('#checkout #loading').show();
      });
      if (this.validate()) {
        var data = Backbone.Syphon.serialize(this)
        data['order_token'] = SpreeStore.currentOrderToken
        $.ajax({
          type: 'PUT',
          dataType: 'json',
          url: '/store/api/checkouts/' + this.model.attributes.number,
          data: data,
          success: function(data) {
            var order = new SpreeStore.Models.Order(data)
            SpreeStore.Checkout.Controller.renderFor(order)
          },
          error: function(xhr) {
            submit_button.stop();
            submit_button.slideDown();
            submit_button.show();
            submit_button.attr('disabled', false);
            $('#checkout #loading').hide();
            var errors = JSON.parse(xhr.responseText).errors["payments.Credit Card"]
            var error_markup = _.template($('#payment_errors_template').text(), { errors: errors })
            $('#errorExplanation').show().html(error_markup)
          }
        })
      }
    },

    validate: function() {
      return true;
    },

    updatePaymentMethod: function(e) {
      var target = $(e.target);
      var method_type = target.data("payment-method-type");
      var id_pieces = target.attr('id').split("-");
      var id = id_pieces[id_pieces.length-1];
      template = _.template($('#order-' + method_type + '-payment-method-template').html(), { payment_method_id: id, order: this.model.attributes })
      $('#payment-method-info').html(template)
    }
  })
})
