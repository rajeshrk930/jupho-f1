# CSV Template Upload Guide

## Overview
Bulk upload ad templates via CSV file instead of coding them manually. Upload 50+ templates in minutes.

## Setup

### 1. Set Admin Email
Add your admin email to environment variables:

**Backend (.env):**
```bash
ADMIN_EMAILS=your-email@example.com
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com
```

For multiple admins, separate with commas:
```bash
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### 2. Access Upload UI
1. Login with your admin email
2. Visit `/templates` page
3. You'll see "Admin: Bulk Upload Templates" section at the top

## CSV Format

### Required Columns
- `TemplateName` - Name of the template (unique per category)
- `Industry` - Industry type (used for auto-categorization)
- `Goal` - Campaign goal description
- `PrimaryText` - Main ad copy (max 125 characters)
- `Headline` - Primary headline (max 40 characters)
- `CTA` - Call to action button

### Optional Columns
- `Headline2`, `Headline3` - Additional headline variations
- `Description`, `Description2`, `Description3` - Short taglines (30 chars)
- `PrimaryText2`, `PrimaryText3` - Additional ad copy variations
- `Budget` - Daily budget (default: 500)
- `Currency` - Currency code (default: INR)
- `AgeMin` - Minimum age (default: 25)
- `AgeMax` - Maximum age (default: 45)
- `Interests` - Comma-separated keywords
- `IsLocal` - true/false (default: true)
- `Radius` - Targeting radius in km (default: 10)
- `Objective` - OUTCOME_LEADS, OUTCOME_SALES, or OUTCOME_TRAFFIC (default: OUTCOME_LEADS)
- `ConversionMethod` - lead_form or website (default: lead_form)
- `ImageUrl` - Optional template image URL

### Valid CTA Values
- SIGN_UP
- LEARN_MORE
- SHOP_NOW
- CONTACT_US
- APPLY_NOW
- GET_STARTED
- BOOK_NOW
- CALL_NOW
- DOWNLOAD
- GET_QUOTE

## Auto-Categorization

The system automatically assigns categories based on keywords in the template name and text:

| Keywords | Category |
|----------|----------|
| restaurant, food, cafe, pizza, delivery | RESTAURANT |
| gym, fitness, workout, training | GYM |
| salon, beauty, hair, spa, makeup | SALON |
| real estate, property, apartment, house | REAL_ESTATE |
| ecommerce, store, shop | ECOMMERCE |
| plumb, electric, repair, home service | HOME_SERVICES |
| dental, clinic, hospital, healthcare | HEALTHCARE |
| education, course, training, school | EDUCATION |
| car, auto, vehicle, dealership | AUTOMOTIVE |
| hotel, resort, travel, vacation | HOSPITALITY |
| agency, marketing, consulting | AGENCY |
| Everything else | GENERAL |

## Validation Rules

1. **Character Limits:**
   - Headline: 40 characters max
   - PrimaryText: 125 characters max

2. **Duplicate Protection:**
   - Templates with same name + category are rejected
   - Prevents duplicate entries

3. **Batch Limits:**
   - Max 100 templates per upload
   - Larger files will be rejected

## Example CSV

See [template-upload-example.csv](./template-upload-example.csv) for a complete example with 10 templates.

Quick example:
```csv
TemplateName,Industry,Goal,PrimaryText,Headline,CTA,Budget
Pizza Special,Restaurant,Get Orders,Order now get 20% off! Fresh pizza delivered hot.,Order & Save 20%,Sign Up,500
Gym Free Trial,Fitness,Get Members,Join today first month FREE! Premium equipment included.,First Month Free!,Sign Up,800
```

## Upload Process

1. **Prepare CSV** - Use Excel/Google Sheets with required columns
2. **Download Example** - Click "Download Example CSV" button in UI
3. **Upload File** - Select your CSV file
4. **Click Import** - System validates and imports
5. **Review Results** - See imported count and any skipped rows

## Error Handling

### Common Errors

**"Missing required field: X"**
- Ensure all required columns are present and not empty

**"PrimaryText exceeds 125 characters"**
- Shorten your ad copy to fit Facebook's limit

**"Headline exceeds 40 characters"**
- Shorten your headline

**"Duplicate template"**
- Template with same name + category already exists
- Change the name or delete the existing one first

**"Invalid CTA"**
- Use one of the valid CTA values listed above

### Skipped Rows
If rows are skipped during import:
1. Check the error message for each skipped row
2. Fix the issues in your CSV
3. Re-upload (only new rows will be imported)

## API Endpoint

```typescript
POST /api/templates/import
Content-Type: multipart/form-data

// Response
{
  message: "Import complete. X templates imported, Y skipped.",
  imported: 10,
  skipped: [
    {
      row: 5,
      name: "Template Name",
      reason: "Headline exceeds 40 characters"
    }
  ]
}
```

## Security

- Only users with emails in `ADMIN_EMAILS` can upload
- Returns 403 Forbidden for non-admin users
- CSV files are deleted after processing
- All templates created as system templates (userId: null, isPublic: true)

## Tips

1. **Start Small** - Test with 5-10 templates first
2. **Use Excel** - Easier to manage columns and character counts
3. **Copy Format** - Start from the example CSV
4. **Check Lengths** - Use Excel formulas to validate character counts
5. **Batch Process** - Upload in batches of 50 for easier error handling

## Troubleshooting

**"Admin access required"**
- Check that your email is in ADMIN_EMAILS env variable
- Restart backend after adding email
- Verify you're logged in with admin email

**"CSV file is empty"**
- Ensure CSV has both header row and data rows
- Check file encoding (use UTF-8)

**"Maximum 100 templates per upload"**
- Split your CSV into smaller files
- Upload in multiple batches

## Maintenance

To add more templates:
1. Export existing templates to CSV (future feature)
2. Add new rows
3. Upload the updated CSV
4. Duplicates will be automatically skipped
