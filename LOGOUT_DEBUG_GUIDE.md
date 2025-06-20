# Logout Functionality Debug Guide

## 🔧 Debugging Tools Implemented

### 1. Enhanced Console Logging
The logout flow now includes comprehensive logging at every step:

```
🚪 Starting logout process...
👤 Current user before logout: user@example.com
🧹 Clearing user state...
📡 Calling Supabase signOut...
✅ Supabase signOut successful
🎉 Logout process completed
🏁 Logout process finished, isLoading set to false
```

### 2. Improved Error Handling
- Graceful handling of Supabase signOut failures
- User state cleared even if Supabase call fails
- Detailed error logging with status codes
- User-friendly error messages

### 3. Enhanced UI Feedback
- Confirmation dialog before logout
- Loading state during logout process
- Disabled button during logout
- Visual feedback with button text changes

### 4. Auth Guard Implementation
- Automatic navigation based on auth state
- Prevents access to protected routes
- Handles auth state changes properly

## 🐛 How to Debug Logout Issues

### Step 1: Open Browser Developer Tools
1. Right-click on the page → "Inspect" or press F12
2. Go to the "Console" tab
3. Clear the console (Ctrl+L or Cmd+K)

### Step 2: Attempt Logout
1. Navigate to Profile tab
2. Click the "Logout" button
3. Confirm logout in the dialog
4. Watch the console for debug messages

### Step 3: Analyze Console Output
Look for these key messages:

**✅ Successful Flow:**
```
🚪 Profile: Logout button pressed
👤 Profile: Current user: user@example.com
✅ Profile: User confirmed logout
🚪 Starting logout process...
🧹 Clearing user state...
📡 Calling Supabase signOut...
✅ Supabase signOut successful
🎉 Logout process completed
🧭 Profile: Navigating to auth screen...
🛡️ AuthGuard: Redirecting to auth - user not logged in
```

**❌ Error Indicators:**
```
❌ Supabase logout error: [error details]
❌ Profile: Logout failed: [error message]
❌ Unexpected error during logout: [error details]
```

### Step 4: Check Network Tab
1. Go to "Network" tab in developer tools
2. Filter by "Fetch/XHR"
3. Look for Supabase API calls during logout
4. Check for failed requests or timeouts

### Step 5: Verify Auth State Changes
Watch for auth state change messages:
```
🔄 Auth state changed: SIGNED_OUT
🚪 User signed out - clearing user state
```

## 🔍 Common Issues and Solutions

### Issue 1: Button Not Responding
**Symptoms:** No console logs when clicking logout
**Solution:** Check if button is disabled or has event handler attached

### Issue 2: Supabase SignOut Fails
**Symptoms:** `❌ Supabase logout error` in console
**Possible Causes:**
- Network connectivity issues
- Invalid session token
- Supabase service interruption

**Solution:** The app now handles this gracefully by clearing local state

### Issue 3: Navigation Not Working
**Symptoms:** User state cleared but still on profile screen
**Solution:** Check AuthGuard implementation and router.replace calls

### Issue 4: Partial Logout
**Symptoms:** Some user data remains after logout
**Solution:** Verify all state clearing mechanisms

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Logout button is visible and clickable
- [ ] Confirmation dialog appears
- [ ] Loading state shows during logout
- [ ] User is redirected to login screen
- [ ] User cannot access protected routes after logout

### Error Scenarios
- [ ] Network disconnection during logout
- [ ] Multiple rapid logout attempts
- [ ] Logout while other operations are running

### Cross-Platform Testing
- [ ] Web browser (Chrome, Firefox, Safari)
- [ ] Mobile web browser
- [ ] Expo Go app (if applicable)

## 📊 Performance Monitoring

### Expected Timing
- Logout initiation: Immediate
- Supabase signOut: < 2 seconds
- Navigation redirect: < 1 second
- Total logout time: < 3 seconds

### Performance Issues
If logout takes longer than expected:
1. Check network connectivity
2. Monitor Supabase dashboard for service issues
3. Look for JavaScript errors blocking execution

## 🔧 Additional Debug Commands

### Manual State Check
Add this to console to check current auth state:
```javascript
// Check current user
console.log('Current user:', window.__EXPO_AUTH_USER__);

// Check Supabase session
supabase.auth.getSession().then(({data, error}) => {
  console.log('Supabase session:', data.session);
});
```

### Force Logout (Emergency)
If normal logout fails, use this in console:
```javascript
// Clear all local storage
localStorage.clear();
sessionStorage.clear();

// Force reload
window.location.reload();
```

## 📝 Reporting Issues

When reporting logout issues, include:

1. **Console Logs:** Copy all logout-related console messages
2. **Network Requests:** Screenshot of failed network requests
3. **User Context:** User role, account age, browser/device
4. **Steps to Reproduce:** Exact sequence of actions
5. **Expected vs Actual:** What should happen vs what happened

## 🎯 Success Criteria

Logout is working correctly when:
- ✅ Console shows complete successful flow
- ✅ User is redirected to login screen
- ✅ No errors in console or network tab
- ✅ User cannot access protected routes
- ✅ Fresh login is required to access app
- ✅ Process completes within 3 seconds