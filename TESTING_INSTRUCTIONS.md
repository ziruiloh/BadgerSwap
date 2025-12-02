# Testing Instructions - BadgerSwap

## Quick Start

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Run on device:**
   - Scan QR code with Expo Go (iOS/Android)
   - Or press `i` for iOS simulator
   - Or press `a` for Android emulator

---

## Feature Testing Checklist

### ✅ 1. Login Error Handling

**Test Wrong Password:**
1. Open app → Should show LoginPage
2. Enter existing email (e.g., `test@wisc.edu`)
3. Enter wrong password
4. Tap "Log In"
5. ✅ Should show "Incorrect password" error

**Test Non-Existent Email:**
1. Enter email that doesn't exist (e.g., `newuser@wisc.edu`)
2. Enter any password
3. Tap "Log In"
4. ✅ Should show dialog asking to create account
5. Tap "Sign Up" → Should create account and log in

**Test Invalid Email:**
1. Enter non-@wisc.edu email
2. ✅ Should show error about UW-Madison email requirement

---

### ✅ 2. Multiple Images on Add Listing

**Test Adding Images:**
1. Log in
2. Tap + (FAB) button on Home
3. Tap "Camera" → Take a photo
4. ✅ Photo should appear in horizontal scroll
5. Tap "Gallery" → Select multiple images (up to 5)
6. ✅ All images should appear, scrollable horizontally
7. Tap X on any image → ✅ Should remove it

**Test Image Limits:**
1. Add 5 images
2. Try to add 6th image
3. ✅ Should show "Limit Reached" message

**Test Upload:**
1. Fill form: Title, Description, Price, Category, Location
2. Add at least 1 image
3. Tap "Post Listing"
4. ✅ Should show "Uploading images..." then "Posting..."
5. ✅ Should show success message
6. Check Firebase Storage → Should see uploaded images in `listings/` folder
7. Check Firestore → Product should have `images` array with URLs

---

### ✅ 3. Edit/Delete Listing

**Test Edit Listing (Remove Images):**
1. Go to a listing you created
2. Tap edit icon (pencil) in header
3. Tap X on existing image
4. ✅ Should show confirmation dialog
5. Confirm → ✅ Image should be removed

**Test Edit Listing (Add New Images):**
1. In EditListing page
2. Tap + or Camera/Gallery buttons
3. Add new image
4. ✅ New image should appear with "New" badge
5. Tap "Update Listing"
6. ✅ Should upload new images and update listing

**Test Edit Listing (Cannot Edit Existing Images):**
1. In EditListing page
2. ✅ You can only remove (X) or add new images
3. ✅ Cannot modify existing images directly (as requested)

**Test Edit Text Fields:**
1. Change title, description, price, category, location
2. Tap "Update Listing"
3. ✅ Changes should be saved
4. Go back to ListingDetails → ✅ Should show updated info

**Test Delete Listing:**
1. In EditListing page
2. Tap trash icon in header
3. ✅ Should show confirmation dialog
4. Confirm deletion
5. ✅ Listing should be deleted
6. Should navigate back
7. Listing should disappear from Home page

---

### ✅ 4. Category Filtering (Scrollable)

**Test Category Scrolling:**
1. On Home page
2. Look at category chips below search bar
3. ✅ Should be able to scroll horizontally through all categories
4. Tap different categories (All, Textbooks, Clothing, Electronics, Furniture, etc.)
5. ✅ Products should filter by selected category
6. ✅ Active category should be highlighted (black background)

**Test All Categories:**
1. Scroll through category chips
2. ✅ Should see all available categories from your products
3. Not just limited to 5 categories anymore

---

### ✅ 5. My Listings

**Test View My Listings:**
1. Go to Profile tab
2. Tap "My Listings"
3. ✅ Should show all listings you created
4. ✅ Should show count in header (e.g., "3 items")

**Test Empty State:**
1. If you have no listings
2. ✅ Should show "No listings yet" with "Create Listing" button

**Test Edit from My Listings:**
1. In My Listings page
2. Tap edit icon on any listing
3. ✅ Should navigate to EditListing page

**Test View from My Listings:**
1. Tap on any listing card
2. ✅ Should navigate to ListingDetails

---

### ✅ 6. Favourites Page

**Test Add to Favorites:**
1. Go to any listing (not yours)
2. Tap heart icon in header
3. ✅ Heart should turn red
4. Go to Favorites tab
5. ✅ Listing should appear in favorites list

**Test Remove from Favorites:**
1. In Favorites tab
2. Tap X or heart icon on favorited item
3. ✅ Item should be removed from list

**Test Empty Favorites:**
1. Remove all favorites
2. ✅ Should show "No favorites yet" message

---

### ✅ 7. Report Page

**Test Report a Listing:**
1. Go to any listing (not yours)
2. Tap flag icon in header
3. ✅ Should navigate to ReportPage
4. Select a reason (e.g., "Inappropriate Content")
5. If "Other" → Enter custom reason
6. Tap "Submit Report"
7. ✅ Should show success message
8. Check Firestore → `reports` collection should have new document

---

### ✅ 8. Profile Page

**Test Profile Display:**
1. Go to Profile tab
2. ✅ Should show your name, email, bio, reputation
3. ✅ Should NOT have Settings button (removed as requested)

**Test My Listings Button:**
1. Tap "My Listings"
2. ✅ Should navigate to MyListingsPage

**Test Logout:**
1. Tap "Logout" button
2. ✅ Should show confirmation
3. Confirm → ✅ Should return to LoginPage

---

### ✅ 9. Navigation Flow

**Test Bottom Tabs:**
1. ✅ Home tab → ProductListPage
2. ✅ Chat tab → ChatPage
3. ✅ Favorites tab → FavouritesPage
4. ✅ Profile tab → ProfilePage

**Test Stack Navigation:**
1. From Home → Tap listing → ✅ ListingDetails
2. From Home → Tap + → ✅ PostListing
3. From ListingDetails → Tap edit → ✅ EditListing
4. From ListingDetails → Tap flag → ✅ ReportPage
5. From Profile → Tap My Listings → ✅ MyListingsPage

**Test Chat Navigation:**
1. From ListingDetails → Tap "Message seller"
2. ✅ Should navigate to Chat tab with seller info

---

## Firebase Verification

### Firestore Collections to Check:

1. **products**
   - New listings appear with `images` array
   - Updates save correctly
   - Deletions remove documents

2. **users**
   - User documents created on signup
   - `favorites` array updates when favoriting

3. **reports**
   - Reports created with correct data

### Firebase Storage:

1. **listings/**
   - Images uploaded successfully
   - Multiple images per listing
   - URLs accessible

---

## Common Issues & Solutions

### ❌ "Cannot navigate to Chat"
- **Fixed:** Now navigates properly to Chat tab

### ❌ "Can't scroll categories"
- **Fixed:** Categories are now in horizontal ScrollView

### ❌ "Can't see my listings"
- **Fixed:** MyListingsPage created and linked from Profile

### ❌ Images not uploading
- Check Firebase Storage rules allow writes
- Grant camera/photo library permissions
- Check network connection

### ❌ Favorites not working
- Ensure user is logged in
- Check Firestore user document has `favorites` field

---

## Complete Test Flow

1. **Create Account** → Login → View products
2. **Add Listing** with 3 images → Verify in Firebase
3. **View Listing Details** → Favorite it → Report it
4. **Go to Favorites** → Verify item appears
5. **Go to Profile** → My Listings → Verify your listing
6. **Edit Listing** → Remove 1 image, add 1 new → Update
7. **Filter by Category** → Scroll through all categories → Select different ones
8. **Delete Listing** → Verify removed
9. **Test Login Errors** → Wrong password, non-existent email
10. **Logout** → Login again → Verify favorites persist

---

## What's Working

✅ Login/Signup with error handling  
✅ Multiple images on add listing (camera/gallery)  
✅ Edit/Delete listing (remove/add images, not edit existing)  
✅ Scrollable category filtering  
✅ My Listings page  
✅ Favourites page with Firebase  
✅ Report page  
✅ Profile page (Settings button removed)  
✅ Navigation to Chat tab  
✅ All integrated with partners' backend code  

---

## Notes

- Test on real device for best camera/gallery experience
- Firebase rules should allow reads/writes for testing
- All features are integrated and ready to test!


