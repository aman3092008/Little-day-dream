Little Daydream - Responsive Order Form Update

The order popup has been redesigned so all customer, payment, shipping, price and total information fits cleanly on screen. On small screens the form stays within the viewport and scrolls internally instead of being cut off.

Payment buttons for bKash, Nagad and Cash on Delivery are preserved.

PRODUCT DETAIL UPDATE
- Product cards on the Store are now clickable and open product.html?id=...
- The product detail page supports multiple product photos, quantity, Buy Now, Add to Cart, short bio, full details and feature/spec lines.
- Admin -> Products lets you add multiple photos and customize name, category, price, short bio, color, size, weight, full details and feature/spec lines.
- Admin can edit existing products and add more photos or replace their photos.
- Existing products continue to work with their original single image/description fields.

VOUCHER / COUPON SYSTEM
- Customers can enter a voucher code in the order form and tap Apply.
- Admin -> Voucher / Coupon Manager can generate a code or type a custom code.
- Admin can choose Percentage (%) or Fixed (৳) discount.
- Admin can set total uses (0 = unlimited), uses per customer account (0 = unlimited), expiry date, and Active/Inactive.
- Signed-in customers are tracked by account email. Guest customers are tracked by phone number.
- Admin can open Usage to see which account/phone used a voucher and how many times.
- Voucher discounts are saved with the order and shown in admin order details and customer order details.
- This website stores data in browser localStorage and is a demo/local system; production voucher security should be enforced by a server/database.

AVAILABLE OFFERS
- Customers now see an “Available Offers” section in the order form.
- Only active, non-expired vouchers with remaining total uses are shown.
- Customers can tap “Use” to place the voucher code into the voucher box and apply it.
- The offer card shows the discount, expiry date (when set), and per-account usage limit.
- Admin controls for creating, activating/deactivating, setting expiry, total uses, and per-account uses remain in Admin → Voucher / Coupon Manager.


ADMIN LOGIN (FINAL)
- Email: aman3092008@gmail.com
- Password: Littledaydream@#
- Admin sign-up: none
- Admin password change: none
- Admin login is displayed as a sign-in form matching the customer sign-in design.
- If an older cached admin page shows an 'Admin email (demo)' browser prompt, reload the site; this version cache-busts admin.js.
