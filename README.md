# bear-north
stackstore project

[![Code Climate](https://codeclimate.com/github/sechu/bear-north/badges/gpa.svg)](https://codeclimate.com/github/sechu/bear-north)
[![Test Coverage](https://codeclimate.com/github/sechu/bear-north/badges/coverage.svg)](https://codeclimate.com/github/sechu/bear-north/coverage)
[![Issue Count](https://codeclimate.com/github/sechu/bear-north/badges/issue_count.svg)](https://codeclimate.com/github/sechu/bear-north)


# need to change ship date to auto default to t+4? 
	var someDate = new Date();
	var numberOfDaysToAdd = 6;
	someDate.setDate(someDate.getDate() + numberOfDaysToAdd); 

# need to change seed to have ative and fulfilled orders
# need to authenticate password change# need to write checkout route
# need to change all prices to show dollars not cents
# need to refresh cart after checkout
# make pending orders editable
# sort order by order status
# when you log out, destroy the cart
# anonymous users should put contact information...
#check unitprice from product price conversion...

- added a check for negative quantity
- added shipDate to default
- fixed subtotal to show prices
- fixed bug with persisting cart on logout
- fixed bug with persisting cart on checkout
- built new route for admin privileges on orders
- added rent or buy functionality in product pages
- updated Seed orders