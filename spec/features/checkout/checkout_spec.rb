require 'spec_helper'

feature "Checkout", :js => true do
  before do
    reset_spree_preferences
  end

  let!(:country) { Spree::Country.first || FactoryGirl.create(:country) }
  let!(:state) { country.states.first || FactoryGirl.create(:state, :country => country) }
  let!(:shipping_category) { FactoryGirl.create(:shipping_category) }
  let!(:product) { FactoryGirl.create(:base_product, :name => "iPad", :shipping_category => shipping_category) }
  let!(:shipping_method) do
    FactoryGirl.create(:shipping_method).tap do |sm|
      sm.calculator.preferred_amount = 10
      sm.calculator.save
    end
  end

  def fill_in_address_for(type)
    field_prefix = "order_#{type}_address_attributes"
    within(type == "bill" ? "#billing" : "#shipping") do
      fill_in "First Name", :with => "Ryan"
      fill_in "Last Name", :with => "Bigg"
      fill_in "Street Address", :with => "1 Nowhere Lane"
      fill_in "City", :with => "Nowhere"
      select country.name, :from => "Country"
      select state.name, :from => "State"
      fill_in "Zip", :with => "3000"
      fill_in "Phone", :with => "(555) 555-5555"
    end
  end

  it "can add a product to the cart" do
    visit "/"
    click_link "iPad"
    fill_in "quantity", :with => 2
    click_button 'Add To Cart'
    fill_in 'Email', :with => "me@ryanbigg.com"
    click_button 'Checkout'
    sleep(0.5)
    page.current_url.should include("checkout/address")
    fill_in_address_for("bill")
    check "Use Billing Address"
    click_button "Save and Continue"
    sleep(0.5)
    page.current_url.should include("checkout/delivery")
    choose shipping_method.name
    click_button "Save and Continue"
    page.current_url.should include("checkout/payment")
  end

  it "can jump back to a previous state"

  it "cannot navigate to an invalid state"

  # Maybe put an error message here?
  it "reroutes to homepage when cart is blank"
end