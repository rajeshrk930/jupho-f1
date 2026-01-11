# Lead Form Debugging Guide

## ✅ Implementation Complete

I've added comprehensive logging to diagnose and fix the Lead Form creation issue. Here's what was added:

### 🔍 Changes Made

#### 1. **Agent Service Logging** ([agent.service.ts](backend/src/services/agent.service.ts))
- ✅ Logs `conversionMethod` at the start of campaign creation
- ✅ Shows detailed Lead Form creation flow with success/failure
- ✅ Validates Lead Form ID before proceeding to creative creation
- ✅ Comprehensive error handling with full Facebook API error details
- ✅ Final summary showing all created IDs (Campaign, Ad Set, Creative, Ad, Lead Form)

#### 2. **Facebook Service Logging** ([facebook.service.ts](backend/src/services/facebook.service.ts))
- ✅ Detailed Lead Form creation payload logging
- ✅ Shows Facebook API URL, request payload, and response
- ✅ Enhanced error messages with Facebook error codes and types
- ✅ Lead Form Creative creation validation
- ✅ Ad Set configuration logging (optimization_goal, destination_type)

### 📋 How to Test

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Create a test ad with "Meta Instant Lead Form" option**
   - Go through your app's flow
   - Select "Meta Instant Lead Form" when asked "How Should Customers Respond?"
   - Upload an image and click "Launch Campaign"

3. **Check the console logs** - You'll see detailed output like:

   ```
   ========================================
   [AgentService] 🚀 Starting Campaign Creation
   [AgentService] Task ID: abc-123
   [AgentService] Conversion Method: lead_form
   [AgentService] Brand: YourBrand
   ========================================

   🎯 [AgentService] === LEAD FORM CONVERSION METHOD ===
   [AgentService] Creating Meta Instant Lead Form...
   [AgentService] Facebook Page ID: 123456789
   [AgentService] Lead Form Name: YourBrand - Lead Form

   📋 [Facebook] Creating Lead Generation Form...
   [Facebook] Page ID: 123456789
   [Facebook] Form Name: YourBrand - Lead Form
   [Facebook] Questions: FULL_NAME, EMAIL, PHONE
   [Facebook] API URL: https://graph.facebook.com/v19.0/123456789/leadgen_forms
   [Facebook] Payload: { ... }

   ✅ [Facebook] Lead Form Created Successfully!
   [Facebook] Lead Form ID: 987654321

   🎨 [Facebook] Creating Ad Creative with Lead Form...
   [Facebook] Lead Form ID: 987654321
   ✅ [Facebook] Lead Form Creative Created: 456789123

   📊 [Facebook] Creating Ad Set...
   [Facebook] Ad Set Config:
     - optimization_goal: LEAD_GENERATION
     - destination_type: ON_AD  ← This MUST be "ON_AD" for Instant Forms
     - promoted_object.page_id: 123456789

   ========================================
   🎉 [AgentService] CAMPAIGN CREATED SUCCESSFULLY!
   ========================================
   Campaign ID: 111
   Ad Set ID: 222
   Creative ID: 333
   Ad ID: 444
   Conversion Method: lead_form
   ✅ Lead Form ID: 987654321
   👉 Check Facebook Ads Manager → Forms Library
   ========================================
   ```

### 🔍 What to Look For

#### ✅ **Success Indicators:**
- `Conversion Method: lead_form` appears at the start
- `✅ [Facebook] Lead Form Created Successfully!` with a valid ID
- `destination_type: ON_AD` in Ad Set config
- No errors about missing pixel or website conversion issues
- Final summary shows all IDs including `Lead Form ID`

#### ❌ **Error Indicators:**
- `❌ [Facebook] Lead Form Creation FAILED` - Check the error details below it
- Error codes like `190`, `100`, `200`, `368` indicate permission or configuration issues
- Missing `FACEBOOK_PAGE_ID` error
- "Lead Form ID is required but was not provided" means Lead Form creation failed silently

### 🐛 Common Issues & Solutions

#### Issue 1: Permission Error (Error Code 190 or 200)
**Error:** "Invalid OAuth 2.0 Access Token" or "Permissions required"

**Solution:**
- Re-connect your Facebook account
- Ensure you have `pages_manage_ads` and `leads_retrieval` permissions
- Check that the access token hasn't expired

#### Issue 2: Missing Page ID
**Error:** "FACEBOOK_PAGE_ID not configured"

**Solution:**
```bash
# Add to backend/.env
FACEBOOK_PAGE_ID=your_facebook_page_id
```

#### Issue 3: Lead Form Created But Ad Fails
**Check logs for:**
- Is `Lead Form ID: xxx` shown?
- Does Creative creation succeed?
- Is `destination_type: ON_AD` set in Ad Set?

**Solution:** The issue is in the ad/creative linking, not Lead Form creation. Check the creative payload logs.

#### Issue 4: Ad Set Shows "Website" Instead of "Instant forms"
**This means:**
- `destination_type` is set to `WEBSITE` instead of `ON_AD`
- OR Lead Form ID is not attached to the creative

**Solution:** Check the Ad Set logs - it should show `destination_type: ON_AD`

### 📊 Verify in Facebook Ads Manager

1. **Go to Facebook Ads Manager**
2. **Navigate to:** Forms Library (left sidebar)
3. **Check:** Your form should appear with the name `YourBrand - Lead Form`
4. **Click on it:** You should see:
   - Fields: Name, Email, Phone
   - Context card with your primary text
   - Thank you page

5. **Go to your Ad Set:**
   - **Conversion location** should show "Instant forms" (NOT "Website")
   - **Performance goal** should show "Maximize number of leads"

### 🚀 Next Steps After Testing

1. **If Lead Form creation succeeds:**
   - The logging has confirmed everything works correctly
   - You can reduce log verbosity if desired

2. **If Lead Form creation fails:**
   - Share the console logs (especially the error section)
   - Check Facebook permissions
   - Verify `FACEBOOK_PAGE_ID` is correct

3. **If you want to support "Send to Website" option:**
   - That requires additional changes (Meta Pixel configuration)
   - For now, focus on getting "Meta Instant Lead Form" working

### 💡 Key Insight

**The website URL you collect is ONLY for:**
- AI to understand the business context
- Scraping business information
- Generating better ad copy

**It is NOT used for:**
- Creating website conversion ads (when "Meta Instant Lead Form" is selected)
- Sending traffic to the website (Lead Form captures leads on Facebook/Instagram)

When users select "Meta Instant Lead Form", the system creates a Facebook Instant Form that captures leads directly on the platform - no website needed!

---

## 📝 Summary

Your app now has:
- ✅ Comprehensive logging at every step
- ✅ Clear error messages with Facebook API details
- ✅ Validation of Lead Form ID before proceeding
- ✅ Final summary showing all created components
- ✅ Easy debugging with emoji indicators (🎯, ✅, ❌)

**Run a test and check the console logs to see exactly what's happening!**
