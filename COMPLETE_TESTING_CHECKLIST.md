# Complete Testing Checklist for BadgerSwap

## 🔐 Authentication & User Management

### Sign Up
- [ ] **Create new account with UW-Madison email**
  - Enter valid `@wisc.edu` email
  - Enter password (min 6 characters)
  - Enter name
  - Verify email verification is sent
  - Check that account is created in Firestore

- [ ] **Sign up validation**
  - Try non-UW email → Should show error
  - Try weak password → Should show error
  - Try existing email → Should show "email already in use"
  - Try empty fields → Should show validation errors

- [ ] **Email verification**
  - Check email inbox for verification link
  - Click verification link
  - Try logging in before verification → Should be blocked
  - Try logging in after verification → Should succeed

### Login
- [ ] **Successful login**
  - Enter correct email and password
  - Should navigate to main app (Home tab)
  - Should see bottom tab navigator

- [ ] **Login error handling**
  - Wrong password → Shows "Incorrect password" error
  - Non-existent email → Shows "Account not found" with signup option
  - Invalid email format → Shows "Invalid email" error
  - Unverified email → Shows "Email not verified" with resend option
  - Too many failed attempts → Shows rate limit message

- [ ] **Resend verification email**
  - Click "Resend verification email" button
  - Check email for new verification link
  - Verify link works

### Logout
- [ ] **Logout functionality**
  - Click logout from Profile page
  - Should navigate back to Login page
  - Should clear authentication state
  - Try accessing app features → Should redirect to login

---

## 📦 Product Listings

### View Listings
- [ ] **Home page displays products**
  - Products load on app start
  - Product cards show: image, title, price, category, seller name
  - Images display correctly (or placeholder if missing)
  - Price formatting is correct ($XX.XX format)

- [ ] **Product refresh**
  - Navigate away from Home tab
  - Create a new listing
  - Return to Home tab
  - New listing should appear in list

### Search Functionality
- [ ] **Search by title**
  - Type product title in search bar
  - Results filter in real-time
  - Case-insensitive search works

- [ ] **Search by description**
  - Type keywords from product description
  - Results show matching products

- [ ] **Clear search**
  - Clear search input
  - All products show again

### Category Filters
- [ ] **Filter by category**
  - Click category chip (e.g., "Electronics", "Textbooks")
  - Only products in that category show
  - Category chips are scrollable horizontally
  - Category names are visible on chips

- [ ] **"All" category**
  - Click "All" category
  - All products show regardless of category

- [ ] **Category + Search combination**
  - Select a category
  - Add search query
  - Results match both filters

### Create Listing
- [ ] **Post new listing**
  - Navigate to Post Listing (from Home tab or Profile)
  - Fill in: title, description, price, category, location
  - Add multiple images (up to 5)
  - Submit listing
  - Verify listing appears in Home feed
  - Verify listing appears in "My Listings"

- [ ] **Image upload**
  - Add image from gallery (multiple selection)
  - Take photo with camera
  - Remove individual images before posting
  - Verify images upload to Firebase Storage
  - Verify images display correctly in listing

- [ ] **Validation**
  - Try submitting empty title → Shows error
  - Try submitting empty price → Shows error
  - Try submitting without images → Shows error
  - Try submitting with invalid price format → Shows error

### Edit Listing
- [ ] **Edit own listing**
  - Go to listing details of your own listing
  - Click edit button (pencil icon)
  - Change title, description, price, category, location
  - Remove existing images
  - Add new images
  - Save changes
  - Verify changes appear in listing details
  - Verify changes appear in Home feed

- [ ] **Image management**
  - Remove existing images (with confirmation)
  - Add new images
  - Keep at least one image (validation)
  - Verify old images removed, new images added

- [ ] **Cannot edit others' listings**
  - Try to edit someone else's listing
  - Edit button should not appear (or should be disabled)

### Delete Listing
- [ ] **Delete own listing**
  - Go to listing details of your own listing
  - Click delete button (trash icon)
  - Confirm deletion in alert dialog
  - Verify listing removed from Home feed
  - Verify listing removed from "My Listings"
  - Verify listing removed from Favorites (if favorited)

- [ ] **Cancel deletion**
  - Click delete button
  - Click "Cancel" in confirmation dialog
  - Listing should remain

- [ ] **Cannot delete others' listings**
  - Delete button should not appear for others' listings

### Listing Details
- [ ] **View listing details**
  - Tap on any product card
  - See full details: title, description, price, category, location, seller
  - See all images (if multiple)
  - Swipe through image gallery
  - See image indicators (dots)

- [ ] **Owner actions**
  - On own listing: See edit and delete buttons
  - On own listing: Do NOT see favorite/report buttons

- [ ] **Non-owner actions**
  - On others' listings: See favorite and report buttons
  - On others' listings: Do NOT see edit/delete buttons

---

## ❤️ Favorites

### Add to Favorites
- [ ] **Favorite a listing**
  - Go to listing details (not your own)
  - Click heart icon
  - Heart should fill/change color immediately (optimistic update)
  - Verify favorite saved in Firestore

- [ ] **Unfavorite a listing**
  - Click heart icon again
  - Heart should unfill immediately
  - Verify removed from Firestore

### Favorites Page
- [ ] **View favorites**
  - Navigate to Favorites tab
  - See all favorited listings
  - See empty state if no favorites

- [ ] **Remove from favorites**
  - Swipe or click remove on favorite item
  - Item disappears from list immediately
  - Verify removed from Firestore

- [ ] **Favorites refresh**
  - Favorite a new item
  - Navigate to Favorites tab
  - New favorite should appear

- [ ] **Navigate to listing from favorites**
  - Tap on favorited item
  - Should navigate to listing details

---

## 💬 Chat/Messaging

### Start Conversation
- [ ] **Message seller from listing**
  - Go to listing details (not your own)
  - Click "Message Seller" button
  - Should navigate to Chat tab
  - Should open/create conversation with seller
  - Should show product info in conversation

- [ ] **Conversation creation**
  - First message creates conversation
  - Conversation appears in conversations list
  - Product title and info shown in conversation header

### Send Messages
- [ ] **Send message**
  - Type message in input field
  - Click send button
  - Message appears immediately (optimistic update)
  - Message syncs to Firebase in real-time
  - Message appears for recipient

- [ ] **Real-time updates**
  - Open conversation on two devices (or two users)
  - Send message from one device
  - Message appears on other device instantly (no refresh needed)

- [ ] **Message history**
  - Previous messages load when opening conversation
  - Messages ordered chronologically
  - Timestamps display correctly

### Conversations List
- [ ] **View all conversations**
  - Navigate to Chat tab
  - See list of all conversations (as buyer and seller)
  - See conversation preview: product title, last message, timestamp
  - See unread badge if unread messages

- [ ] **Unread notifications**
  - Receive message in conversation
  - Unread count badge appears on Chat tab
  - Badge shows total unread count
  - Badge disappears after reading conversation

- [ ] **Mark as read**
  - Open conversation with unread messages
  - Unread count should reset to 0
  - Badge should update

- [ ] **Swipe to delete**
  - Swipe conversation to left
  - Delete option appears
  - Confirm deletion
  - Conversation removed from list

- [ ] **Full-screen chat UI**
  - Tap conversation to open
  - Chat takes full screen (not split view)
  - Can navigate back to conversations list
  - Back button works correctly

### Bi-directional Conversations
- [ ] **Buyer perspective**
  - As buyer, see conversations where you're the buyer
  - Can message seller
  - Receive messages from seller

- [ ] **Seller perspective**
  - As seller, see conversations where you're the seller
  - Can message buyer
  - Receive messages from buyer

- [ ] **Both roles**
  - User can be both buyer and seller
  - See all conversations in one list
  - Unread counts work for both roles

---

## 👤 Profile

### View Profile
- [ ] **Profile information**
  - Navigate to Profile tab
  - See: name, email, profile picture, bio, reputation score
  - See join date
  - See reputation stars (horizontal display)

- [ ] **Profile refresh**
  - Edit profile
  - Return to Profile tab
  - Changes should appear

### Edit Profile
- [ ] **Edit profile picture**
  - Click "Edit Profile"
  - Choose "Take Photo" or "Choose from Gallery"
  - Select/capture image
  - Save changes
  - Verify new profile picture appears on Profile page
  - Verify image uploaded to Firebase Storage

- [ ] **Edit bio**
  - Click "Edit Profile"
  - Enter or update bio text
  - Save changes
  - Verify bio appears on Profile page
  - Verify bio saved in Firestore

- [ ] **Cancel edit**
  - Make changes
  - Click back/cancel
  - Changes should not be saved

### My Listings
- [ ] **View my listings**
  - Click "My Listings" button on Profile
  - See all listings you created
  - See empty state if no listings
  - See listing count in header

- [ ] **Navigate to listing**
  - Tap on listing in "My Listings"
  - Should navigate to listing details
  - Can edit or delete from there

- [ ] **Create listing from empty state**
  - If no listings, see "Create Listing" button
  - Click button
  - Navigate to Post Listing page

### Reputation System
- [ ] **View reputation**
  - See reputation score on Profile page
  - See reputation stars (horizontal, 5-star scale)
  - Default score is 5.0 for new users

- [ ] **Reputation deduction**
  - Report a user's listing
  - User's reputation should decrease (by 0.2)
  - Verify score updates in Firestore
  - Verify score doesn't go below 0

---

## 🚩 Reports

### Create Report
- [ ] **Report a listing**
  - Go to listing details (not your own)
  - Click report button (flag icon)
  - Select reason (Spam, Inappropriate, Scam, Other)
  - If "Other", enter custom reason
  - Submit report
  - See success message
  - Verify report created in Firestore

- [ ] **Report validation**
  - Try submitting without selecting reason → Shows error
  - Select "Other" without custom reason → Shows error
  - Submit with valid data → Success

- [ ] **Reputation impact**
  - Report someone's listing
  - Check their profile
  - Reputation score should decrease by 0.2

### View Reports
- [ ] **View my reports**
  - Reports you created should be accessible
  - (Admin functionality may be separate)

---

## 🧭 Navigation

### Bottom Tab Navigation
- [ ] **Tab navigation**
  - Home tab → Shows product listings
  - Chat tab → Shows conversations
  - Favorites tab → Shows favorited items
  - Profile tab → Shows user profile

- [ ] **Tab icons**
  - Icons change when tab is active (filled vs outline)
  - Active tab highlighted in black
  - Inactive tabs gray

- [ ] **Tab badges**
  - Chat tab shows unread count badge
  - Badge appears when unread messages > 0
  - Badge disappears when all read

### Stack Navigation
- [ ] **Navigation flow**
  - Login → Main App (tabs)
  - Home → Listing Details
  - Listing Details → Edit Listing (if owner)
  - Listing Details → Report Page
  - Profile → Edit Profile
  - Profile → My Listings
  - My Listings → Edit Listing

- [ ] **Back navigation**
  - Back button works on all detail pages
  - Returns to previous screen correctly
  - Tab state preserved when navigating back

### Authentication Flow
- [ ] **Unauthenticated access**
  - Logout
  - Try accessing app features
  - Should redirect to Login page

- [ ] **Authenticated access**
  - Login successfully
  - Should see main app (tabs)
  - Can access all features

---

## 🖼️ Image Handling

### Image Upload
- [ ] **Multiple images**
  - Upload up to 5 images per listing
  - Images upload to Firebase Storage
  - Images display correctly after upload

- [ ] **Image sources**
  - Choose from gallery (multiple selection)
  - Take photo with camera
  - Both work correctly

- [ ] **Image removal**
  - Remove images before posting
  - Remove existing images when editing
  - Cannot remove all images (validation)

- [ ] **Image display**
  - Images show in listing cards
  - Images show in listing details (gallery)
  - Profile pictures display correctly
  - Placeholder shows if no image

### Image Gallery
- [ ] **Swipe through images**
  - Multiple images in listing details
  - Swipe left/right to navigate
  - Image indicators (dots) show current image
  - Indicators update on swipe

---

## 🔄 Real-time Features

### Real-time Chat
- [ ] **Messages sync instantly**
  - Send message
  - Appears on other device immediately
  - No refresh needed

- [ ] **Conversations update**
  - New conversation appears in list instantly
  - Last message updates in real-time
  - Unread counts update automatically

### Real-time Listings
- [ ] **New listings appear**
  - Create listing
  - Appears in Home feed without refresh
  - (May require navigating away and back)

---

## 🎨 UI/UX

### Loading States
- [ ] **Loading indicators**
  - Products loading → Shows spinner
  - Images uploading → Shows progress/loading
  - Submitting forms → Shows loading state

### Error Handling
- [ ] **Network errors**
  - Handle offline gracefully
  - Show error messages for failed operations
  - Allow retry

- [ ] **Validation errors**
  - Form validation shows clear errors
  - Required fields highlighted
  - Error messages user-friendly

### Empty States
- [ ] **Empty states display**
  - No listings → Shows "No listings yet"
  - No favorites → Shows "No favorites"
  - No conversations → Shows "No conversations"
  - No my listings → Shows "No listings yet" with create button

### Keyboard Handling
- [ ] **Keyboard doesn't block inputs**
  - Forms scroll when keyboard appears
  - KeyboardAvoidingView works correctly
  - Can dismiss keyboard

---

## 🔒 Security & Permissions

### Firebase Rules
- [ ] **Users can only edit own data**
  - Cannot edit others' listings
  - Cannot delete others' listings
  - Cannot modify others' profiles

- [ ] **Reports accessible**
  - Can create reports
  - Can read own reports
  - Cannot read others' reports

- [ ] **Conversations accessible**
  - Can read/write own conversations
  - Cannot access others' conversations

### Email Validation
- [ ] **UW-Madison email required**
  - Signup requires @wisc.edu email
  - Login requires @wisc.edu email
  - Non-UW emails rejected

---

## 📱 Platform-Specific

### Permissions
- [ ] **Camera permission**
  - Request camera permission when taking photo
  - Handle permission denial gracefully

- [ ] **Gallery permission**
  - Request gallery permission when selecting images
  - Handle permission denial gracefully

### Performance
- [ ] **App performance**
  - Smooth scrolling in lists
  - Images load efficiently
  - No lag when navigating
  - Real-time updates don't cause performance issues

---

## ✅ Final Checks

- [ ] **All features work end-to-end**
- [ ] **No console errors**
- [ ] **No crashes**
- [ ] **Data persists correctly in Firestore**
- [ ] **Images upload and display correctly**
- [ ] **Real-time features work**
- [ ] **Navigation is smooth**
- [ ] **Error messages are clear**
- [ ] **App handles edge cases gracefully**

---

## 🐛 Common Issues to Watch For

1. **Images not uploading** → Check Firebase Storage rules
2. **Messages not syncing** → Check Firestore rules for conversations
3. **Favorites not saving** → Check user document structure
4. **Reputation not updating** → Check Firestore rules allow reputation updates
5. **Email verification not working** → Check Firebase Auth configuration
6. **Navigation errors** → Check screen names match in App.js
7. **Real-time not working** → Check Firestore listeners are set up correctly

---

## 📝 Testing Notes

**Test Accounts Needed:**
- At least 2 accounts (to test messaging, reporting, etc.)
- Both should be verified UW-Madison emails

**Test Data:**
- Create test listings with various categories
- Add test images
- Create test conversations
- Test with different user roles (buyer/seller)

**Test Environment:**
- Test on physical device (recommended)
- Test on iOS and Android if possible
- Test with different network conditions

---

**Last Updated:** After pulling latest from main branch
**Total Features to Test:** ~80+ test cases

