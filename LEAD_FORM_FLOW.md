# Lead Form Creation Flow

## 📊 How It Works: Meta Instant Lead Form

```
┌─────────────────────────────────────────────────────────────┐
│                    USER JOURNEY                              │
└─────────────────────────────────────────────────────────────┘

1. User enters website URL (e.g., https://example.com)
   └─> AI scrapes to understand business
   └─> NOT used for ad destination

2. User selects: "Meta Instant Lead Form" ✅
   (vs "Send to Website" - requires Pixel setup)

3. AI generates ad copy based on business data
   └─> Headlines, Primary Text, Description, CTA

4. User uploads creative image

5. User clicks "Launch Campaign"


┌─────────────────────────────────────────────────────────────┐
│              BACKEND FLOW (What Happens Now)                │
└─────────────────────────────────────────────────────────────┘

Step 1: Agent Service starts
   └─> Reads conversionMethod = "lead_form" from task
   └─> Logs: "🚀 Starting Campaign Creation"

Step 2: Upload image to Facebook
   └─> Returns imageHash for creative

Step 3: Create Facebook Campaign
   └─> objective: "OUTCOME_LEADS"
   └─> status: "PAUSED"

Step 4: Create Facebook Ad Set
   ┌─────────────────────────────────────┐
   │  ✅ CRITICAL SETTINGS FOR LEAD FORM│
   ├─────────────────────────────────────┤
   │ optimization_goal: LEAD_GENERATION  │
   │ destination_type: ON_AD  ← KEY!     │
   │ promoted_object: { page_id }        │
   │ (NO pixel_id needed)                │
   └─────────────────────────────────────┘

Step 5: Create Meta Instant Lead Form 🎯
   API: POST /v19.0/{page_id}/leadgen_forms
   
   Payload:
   {
     name: "BrandName - Lead Form",
     questions: [
       { type: "FULL_NAME" },
       { type: "EMAIL" },
       { type: "PHONE" }
     ],
     context_card: {
       content: ["Your primary text here..."],
       button_text: "Get Started"
     },
     thank_you_page: {
       title: "You are all set!",
       body: "Thank you! We'll contact you soon."
     }
   }
   
   Returns: leadFormId (e.g., "123456789")
   
   ✅ Verify: Check Facebook Ads Manager → Forms Library

Step 6: Create Ad Creative WITH Lead Form
   API: POST /v19.0/act_{ad_account_id}/adcreatives
   
   Payload:
   {
     object_story_spec: {
       page_id: "...",
       link_data: {
         image_hash: "...",
         message: "Primary text",
         name: "Headline",
         call_to_action: {
           type: "SIGN_UP",
           value: {
             lead_gen_form_id: "123456789"  ← Links to Lead Form!
           }
         }
       }
     }
   }

Step 7: Create Ad
   └─> Links Ad Set + Creative
   └─> Status: PAUSED

Step 8: Save to Database
   └─> campaignId, adSetId, creativeId, adId, leadFormId


┌─────────────────────────────────────────────────────────────┐
│                 WHAT USER SEES ON FACEBOOK                   │
└─────────────────────────────────────────────────────────────┘

When ad runs:
1. User sees ad in Facebook/Instagram feed
2. Clicks "Sign Up" button
3. Lead Form opens IN FACEBOOK (no website redirect)
4. Form shows: Name, Email, Phone fields
5. User submits
6. Thank you message appears
7. Lead saved to Facebook → Your Forms Library


┌─────────────────────────────────────────────────────────────┐
│                     WHY IT WORKS                             │
└─────────────────────────────────────────────────────────────┘

✅ destination_type: ON_AD
   → Tells Facebook: "Capture leads ON the ad itself"
   → No external website needed
   → No pixel required

✅ optimization_goal: LEAD_GENERATION
   → Facebook optimizes for form submissions
   → NOT for website clicks

✅ promoted_object: { page_id }
   → Links to your Facebook Page
   → NO pixel_id needed

✅ call_to_action.value.lead_gen_form_id
   → Links creative to the Lead Form
   → When user clicks CTA, form opens


┌─────────────────────────────────────────────────────────────┐
│              WHY WEBSITE URL IS COLLECTED                    │
└─────────────────────────────────────────────────────────────┘

Purpose:
1. Scrape business information (name, description, products)
2. AI generates better ad copy based on website content
3. Understand target audience
4. Saved to database for future reference

NOT used for:
❌ Creating website conversion ads
❌ Sending traffic to website
❌ Ad destination (when Lead Form is selected)

The website URL is PURELY for AI context, not ad delivery!


┌─────────────────────────────────────────────────────────────┐
│                  COMPARISON TABLE                            │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┬─────────────────┬─────────────────┐
│      Setting         │  Lead Form      │  Website        │
├──────────────────────┼─────────────────┼─────────────────┤
│ destination_type     │ ON_AD ✅        │ WEBSITE         │
│ optimization_goal    │ LEAD_GENERATION │ LINK_CLICKS     │
│ promoted_object      │ { page_id }     │ { pixel_id }    │
│ Pixel Required?      │ NO ✅           │ YES (required)  │
│ Creative Type        │ Lead Form       │ Link to website │
│ User Experience      │ Form on FB/IG   │ Opens website   │
│ Lead Capture         │ Facebook saves  │ Your website    │
└──────────────────────┴─────────────────┴─────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                   FACEBOOK API FLOW                          │
└─────────────────────────────────────────────────────────────┘

Campaign
   ├─ objective: OUTCOME_LEADS
   └─ status: PAUSED
        │
        └─> Ad Set
               ├─ optimization_goal: LEAD_GENERATION
               ├─ destination_type: ON_AD  🎯
               ├─ promoted_object: { page_id: "123" }
               └─ targeting: { ... }
                    │
                    └─> Creative
                           ├─ image_hash: "abc123"
                           ├─ headline: "..."
                           ├─ body: "..."
                           └─ call_to_action:
                                 ├─ type: SIGN_UP
                                 └─ value:
                                       └─ lead_gen_form_id: "789" 🎯
                                            │
                                            └─> Lead Form (separate object)
                                                   ├─ name: "Brand - Lead Form"
                                                   ├─ questions: [...]
                                                   ├─ context_card: {...}
                                                   └─ thank_you_page: {...}


┌─────────────────────────────────────────────────────────────┐
│                    KEY TAKEAWAYS                             │
└─────────────────────────────────────────────────────────────┘

1. ✅ "Meta Instant Lead Form" = destination_type: ON_AD
2. ✅ Lead Form is created SEPARATELY, then linked to Creative
3. ✅ Ad Set MUST use optimization_goal: LEAD_GENERATION
4. ✅ NO pixel required for Lead Forms
5. ✅ Website URL is for AI context, NOT ad destination
6. ✅ All logging now shows exact values at each step
7. ✅ Easy to debug with console logs showing full payloads

The implementation is correct - comprehensive logging will show
you exactly what's being sent to Facebook and what's returned!
