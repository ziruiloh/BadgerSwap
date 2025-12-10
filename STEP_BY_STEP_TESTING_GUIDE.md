# Step-by-Step Testing Guide for BadgerSwap

Follow this guide in order to test the app as you would naturally use it.

---

## 🚀 SETUP: Prepare Test Accounts

**Before starting, you need 2 test accounts:**

1. **Account 1 (Main User):**
   - Email: `test1@wisc.edu` (or your real UW email)
   - Password: `test123456`
   - Name: `Test User 1`

2. **Account 2 (Secondary User - for messaging/testing):**
   - Email: `test2@wisc.edu` (or another UW email)
   - Password: `test123456`
   - Name: `Test User 2`

**Note:** You'll need access to both email inboxes for verification.

---

## 📱 PART 1: First-Time User Experience

### Step 1: Launch the App
- [ ] Open the app
- [ ] You should see the **Login Page**
- [ ] Verify you see:
  - Email input field
  - Password input field
  - "Login" button
  - "Sign Up" link/button

### Step 2: Create First Account (Account 1)
- [ ] Click "Sign Up" or navigate to signup
- [ ] Fill in:
  - Name: `Test User 1`
  - Email: `test1@wisc.edu`
  - Password: `test123456`
  - Confirm Password: `test123456`
- [ ] Click "Sign Up"
- [ ] **Expected:** You should see a message about email verification
- [ ] **Check your email inbox** for verification email
- [ ] Click the verification link in the email
- [ ] **Expected:** Email is verified

### Step 3: Test Login Errors (Before Verification)
- [ ] Try to login with Account 1 before verifying email
- [ ] **Expected:** Error message: "Email not verified" with "Resend verification email" button
- [ ] Click "Resend verification email"
- [ ] **Expected:** New verification email sent

### Step 4: Login After Verification
- [ ] Go back to Login page
- [ ] Enter:
  - Email: `test1@wisc.edu`
  - Password: `test123456`
- [ ] Click "Login"
- [ ] **Expected:** 
  - Successfully logs in
  - Navigates to **Home tab** (product listings)
  - Bottom tab bar appears with: Home, Chat, Favorites, Profile

### Step 5: Test Login Error Handling
- [ ] Logout (we'll do this later, but for now just know where it is)
- [ ] Try logging in with:
  - **Wrong password** → Should show "Incorrect password"
  - **Non-existent email** → Should show "Account not found" with signup option
  - **Invalid email format** → Should show "Invalid email"
- [ ] Login correctly again with Account 1

---

## 🏠 PART 2: Home & Browsing

### Step 6: Explore Home Page
- [ ] You should be on the **Home tab**
- [ ] **Expected to see:**
  - "BadgerSwap" header
  - Search bar at top
  - Horizontal scrollable category chips (All, Textbooks, Clothing, etc.)
  - Grid of product listings (or empty state if no products)

### Step 7: Test Search Functionality
- [ ] Type something in the search bar (e.g., "textbook")
- [ ] **Expected:** Products filter in real-time as you type
- [ ] Clear the search
- [ ] **Expected:** All products show again

### Step 8: Test Category Filters
- [ ] Scroll through category chips horizontally
- [ ] Click on a category (e.g., "Electronics")
- [ ] **Expected:** Only products in that category show
- [ ] Click "All" category
- [ ] **Expected:** All products show again
- [ ] Try combining search + category filter
- [ ] **Expected:** Results match both filters

### Step 9: View a Product (If Any Exist)
- [ ] Tap on any product card
- [ ] **Expected:** Navigate to **Listing Details** page
- [ ] **Verify you see:**
  - Product images (or placeholder)
  - Title, description, price, category, location
  - Seller name
  - Action buttons (Favorite, Report, Message Seller, or Edit/Delete if it's yours)
- [ ] Click back button
- [ ] **Expected:** Return to Home page

---

## ➕ PART 3: Create Your First Listing

### Step 10: Navigate to Post Listing
- [ ] On Home tab, look for a "+" button or "Post Listing" button
- [ ] OR go to Profile tab → look for "Post Listing" or "+" button
- [ ] Click to navigate to **Post Listing** page

### Step 11: Fill Out Listing Form
- [ ] Fill in:
  - **Title:** `Test Textbook - Calculus`
  - **Description:** `Great condition, barely used`
  - **Price:** `25`
  - **Category:** Select "Textbooks"
  - **Location:** `Madison, WI`
- [ ] **Expected:** All fields accept input

### Step 12: Add Images
- [ ] Click "Add Photo" or image upload button
- [ ] **Expected:** See options: "Take Photo" or "Choose from Gallery"
- [ ] Choose "Choose from Gallery"
- [ ] **Expected:** Gallery opens
- [ ] Select 2-3 images
- [ ] **Expected:** Images appear as thumbnails
- [ ] Try removing one image (tap X or swipe)
- [ ] **Expected:** Image removed from list
- [ ] Add one more image (you should have 2-3 total)

### Step 13: Submit Listing
- [ ] Click "Post" or "Submit" button
- [ ] **Expected:** 
  - Loading indicator appears
  - Images upload (may take a few seconds)
  - Success message or navigation back to Home
- [ ] **Verify on Home page:**
  - Your new listing appears in the feed
  - Images display correctly
  - All information is correct

### Step 14: Test Validation Errors
- [ ] Go back to Post Listing
- [ ] Try submitting with:
  - Empty title → Should show error
  - Empty price → Should show error
  - No images → Should show error
- [ ] Fix errors and submit successfully

---

## 👤 PART 4: Profile & My Listings

### Step 15: View Your Profile
- [ ] Navigate to **Profile tab** (bottom right)
- [ ] **Expected to see:**
  - Your name: `Test User 1`
  - Your email
  - Profile picture (default or uploaded)
  - Bio (if set)
  - Reputation stars (should show 5.0 ⭐⭐⭐⭐⭐)
  - Join date
  - Buttons: "Edit Profile", "My Listings", "Logout"

### Step 16: View My Listings
- [ ] Click "My Listings" button
- [ ] **Expected:** Navigate to **My Listings** page
- [ ] **Verify you see:**
  - Your listing(s) in a list
  - Each listing shows: image, title, price, category
  - Edit button (pencil icon) on each listing
- [ ] Tap on a listing
- [ ] **Expected:** Navigate to Listing Details
- [ ] **Verify you see:** Edit and Delete buttons (not Favorite/Report)

### Step 17: Edit Your Listing
- [ ] On Listing Details (your own listing), click **Edit** button (pencil icon)
- [ ] **Expected:** Navigate to **Edit Listing** page
- [ ] **Verify you see:**
  - All current values pre-filled
  - Existing images displayed
- [ ] Make changes:
  - Change title to: `Test Textbook - Calculus (Updated)`
  - Change price to: `20`
  - Remove one existing image
  - Add one new image
- [ ] Click "Save" or "Update"
- [ ] **Expected:** 
  - Changes saved
  - Navigate back to Listing Details
  - Updated information displays
- [ ] Go back to Home tab
- [ ] **Verify:** Updated listing shows new title and price

### Step 18: Test Image Management in Edit
- [ ] Go back to Edit Listing
- [ ] Try to remove ALL images
- [ ] **Expected:** Error message - must keep at least one image
- [ ] Keep at least one image and save

---

## ❤️ PART 5: Favorites

### Step 19: Favorite a Listing (Need Someone Else's Listing)
- [ ] Go to Home tab
- [ ] Find a listing that's NOT yours (or create Account 2 and post one)
- [ ] Tap on the listing
- [ ] **Expected:** See **Favorite** button (heart icon) - NOT Edit/Delete
- [ ] Click the heart icon
- [ ] **Expected:** 
  - Heart fills/changes color immediately
  - Favorite saved

### Step 20: View Favorites
- [ ] Navigate to **Favorites tab** (bottom navigation)
- [ ] **Expected:** See your favorited listing(s)
- [ ] Tap on a favorited item
- [ ] **Expected:** Navigate to Listing Details
- [ ] **Verify:** Heart is filled (favorited)

### Step 21: Remove from Favorites
- [ ] On Listing Details, click heart icon again
- [ ] **Expected:** Heart unfills immediately
- [ ] Go to Favorites tab
- [ ] **Expected:** Item removed from list (or swipe to remove if that option exists)

---

## 💬 PART 6: Chat/Messaging

### Step 22: Create Second Account (Account 2)
- [ ] Logout from Account 1 (Profile tab → Logout)
- [ ] Create Account 2: `test2@wisc.edu`
- [ ] Verify email
- [ ] Login with Account 2
- [ ] Create a listing as Account 2 (follow Steps 10-13)
- [ ] **Note the listing details** (title, etc.)

### Step 23: Message Seller (Account 1 → Account 2)
- [ ] Logout from Account 2
- [ ] Login with Account 1
- [ ] Go to Home tab
- [ ] Find Account 2's listing
- [ ] Tap on it
- [ ] Click **"Message Seller"** button
- [ ] **Expected:** 
  - Navigate to **Chat tab**
  - Conversation opens with Account 2
  - Product info shown in conversation header

### Step 24: Send First Message
- [ ] Type a message: `Hi, is this still available?`
- [ ] Click send button
- [ ] **Expected:** 
  - Message appears immediately
  - Message shows your name/avatar on right side
  - Timestamp appears

### Step 25: Test Real-Time Messaging
- [ ] **On Device 1 (Account 1):** Keep conversation open
- [ ] **On Device 2 (or simulator):** Login as Account 2
- [ ] Go to Chat tab
- [ ] **Expected:** See conversation with unread badge
- [ ] Tap conversation
- [ ] **Expected:** See Account 1's message
- [ ] Type reply: `Yes, it's available!`
- [ ] Send
- [ ] **On Device 1:** 
  - **Expected:** Message appears instantly (no refresh needed)
  - Unread badge updates

### Step 26: Test Unread Notifications
- [ ] As Account 2, send another message
- [ ] As Account 1, check Chat tab
- [ ] **Expected:** 
  - Red badge with number on Chat tab
  - Badge shows unread count
- [ ] Tap Chat tab
- [ ] **Expected:** See conversation with unread indicator
- [ ] Tap conversation
- [ ] **Expected:** 
  - Unread count resets to 0
  - Badge disappears

### Step 27: Test Conversations List
- [ ] On Chat tab, view conversations list
- [ ] **Expected to see:**
  - All conversations (as buyer and seller)
  - Last message preview
  - Timestamp
  - Unread badges where applicable
- [ ] Tap different conversation
- [ ] **Expected:** Opens that conversation

### Step 28: Test Swipe to Delete (If Implemented)
- [ ] On conversations list, swipe a conversation left
- [ ] **Expected:** Delete option appears
- [ ] Confirm deletion
- [ ] **Expected:** Conversation removed from list

---

## 🚩 PART 7: Reports & Reputation

### Step 29: Report a Listing
- [ ] As Account 1, go to Account 2's listing
- [ ] Click **Report** button (flag icon)
- [ ] **Expected:** Navigate to **Report Page**
- [ ] Select a reason: "Spam" (or any option)
- [ ] Click "Submit Report"
- [ ] **Expected:** 
  - Success message
  - Navigate back
  - Report created

### Step 30: Test Report Validation
- [ ] Go to Report Page again
- [ ] Try submitting without selecting reason
- [ ] **Expected:** Error message
- [ ] Select "Other" reason
- [ ] Try submitting without custom reason
- [ ] **Expected:** Error message
- [ ] Fill in custom reason and submit
- [ ] **Expected:** Success

### Step 31: Check Reputation Impact
- [ ] As Account 2, go to Profile tab
- [ ] **Expected:** Reputation score decreased (from 5.0 to 4.8)
- [ ] **Note:** Reputation deducts 0.2 per report

---

## 🔍 PART 8: Advanced Features

### Step 32: Test Multiple Images in Listing
- [ ] Create a new listing
- [ ] Add 5 images (maximum)
- [ ] **Expected:** Can add up to 5
- [ ] Try adding 6th image
- [ ] **Expected:** Error: "Limit reached"
- [ ] Submit listing
- [ ] View listing details
- [ ] **Expected:** 
  - All 5 images display
  - Can swipe through images
  - Image indicators (dots) show current image

### Step 33: Test Delete Listing
- [ ] Go to one of your listings
- [ ] Click **Delete** button (trash icon)
- [ ] **Expected:** Confirmation dialog
- [ ] Click "Cancel"
- [ ] **Expected:** Listing still exists
- [ ] Click Delete again
- [ ] Click "Delete" in confirmation
- [ ] **Expected:** 
  - Listing deleted
  - Navigate back
  - Listing removed from Home feed
  - Listing removed from My Listings

### Step 34: Edit Profile
- [ ] Go to Profile tab
- [ ] Click "Edit Profile"
- [ ] **Expected:** Navigate to Edit Profile page
- [ ] Update:
  - **Bio:** `This is my test bio`
  - **Profile Picture:** Choose new image from gallery
- [ ] Click "Save"
- [ ] **Expected:** 
  - Changes saved
  - Return to Profile
  - New bio and picture display

### Step 35: Test Profile Picture Upload
- [ ] Go to Edit Profile
- [ ] Click on profile picture area
- [ ] **Expected:** Options: "Take Photo" or "Choose from Gallery"
- [ ] Choose "Take Photo"
- [ ] **Expected:** Camera opens (if permission granted)
- [ ] Take photo or cancel
- [ ] Choose from gallery instead
- [ ] Select image
- [ ] **Expected:** Image preview updates
- [ ] Save
- [ ] **Expected:** New profile picture appears

---

## 🔄 PART 9: Refresh & Real-Time Updates

### Step 36: Test List Refresh
- [ ] Create a new listing
- [ ] Navigate away from Home tab
- [ ] Return to Home tab
- [ ] **Expected:** New listing appears (may need to pull down to refresh)

### Step 37: Test Real-Time Chat Updates
- [ ] Open chat conversation on both accounts
- [ ] Send message from Account 1
- [ ] **On Account 2:** 
  - **Expected:** Message appears instantly
  - No need to refresh or navigate away/back

---

## 🎯 PART 10: Edge Cases & Error Handling

### Step 38: Test Offline Behavior
- [ ] Turn off WiFi/data
- [ ] Try to create a listing
- [ ] **Expected:** Error message about network
- [ ] Turn WiFi back on
- [ ] Retry
- [ ] **Expected:** Works

### Step 39: Test Permission Denials
- [ ] Go to Post Listing
- [ ] Try to add photo
- [ ] Deny camera/gallery permission
- [ ] **Expected:** Error message asking for permission
- [ ] Grant permission in settings
- [ ] Try again
- [ ] **Expected:** Works

### Step 40: Test Empty States
- [ ] Delete all your listings
- [ ] Go to My Listings
- [ ] **Expected:** Empty state message with "Create Listing" button
- [ ] Go to Favorites
- [ ] Remove all favorites
- [ ] **Expected:** Empty state message
- [ ] Go to Chat
- [ ] Delete all conversations
- [ ] **Expected:** Empty state message

---

## ✅ FINAL VERIFICATION

### Step 41: Complete Feature Checklist
- [ ] ✅ Authentication works (signup, login, verification)
- [ ] ✅ Can create listings with multiple images
- [ ] ✅ Can edit own listings
- [ ] ✅ Can delete own listings
- [ ] ✅ Search and filters work
- [ ] ✅ Favorites work (add/remove)
- [ ] ✅ Chat works (send/receive messages)
- [ ] ✅ Real-time updates work
- [ ] ✅ Unread notifications work
- [ ] ✅ Reports work
- [ ] ✅ Reputation system works
- [ ] ✅ Profile editing works
- [ ] ✅ Navigation works smoothly
- [ ] ✅ Images upload and display correctly
- [ ] ✅ Error handling is user-friendly

### Step 42: Test on Different Screens
- [ ] Test on different device sizes (if possible)
- [ ] Test in portrait and landscape (if supported)
- [ ] Verify UI elements are visible and accessible

---

## 🐛 If Something Doesn't Work

**Common Issues & Quick Fixes:**

1. **Images not uploading:**
   - Check Firebase Storage rules
   - Verify internet connection
   - Check image file size

2. **Messages not syncing:**
   - Check Firestore rules for conversations
   - Verify both users are logged in
   - Check console for errors

3. **Favorites not saving:**
   - Check user document in Firestore
   - Verify favorites array exists

4. **Reputation not updating:**
   - Check Firestore rules allow reputation updates
   - Verify report was created successfully

5. **Email verification not working:**
   - Check spam folder
   - Verify Firebase Auth configuration
   - Try resend verification email

---

## 📝 Testing Notes Template

**Date:** _______________
**Tester:** _______________
**Device:** _______________
**OS Version:** _______________

**Issues Found:**
1. 
2. 
3. 

**Features Working:**
- ✅ 
- ✅ 
- ✅ 

**Features Not Working:**
- ❌ 
- ❌ 
- ❌ 

---

**Total Steps: 42**
**Estimated Time: 1-2 hours for complete testing**

Follow this guide sequentially, and you'll test every major feature of the app!

