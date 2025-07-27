# 📚 Airtable Import Instructions: PM Book Recommender

## Overview
This guide will help you set up your Airtable base to receive high-quality product management books from the `quality_book_scraper.py` script. The schema is designed to work with fresh, curated data from trusted sources like Lenny's podcast, Ken Norton's blog, and Y Combinator.

## 🎯 Purpose
The goal is to build a high-quality, schema-aligned book dataset for your PM Book Recommender app using fresh inputs only.

---

## 📋 Airtable Schema Specification

### Required Fields (Must be created in Airtable)
| Field Name | Field Type | Description | Options/Constraints |
|------------|------------|-------------|-------------------|
| `title` | Single line text | Book title | Required |
| `author` | Single line text | Book author(s) | Required |
| `summary` | Long text | 1-sentence book summary | Required |
| `goodreads_rating` | Number | Goodreads rating | 0-5 range |
| `amazon_link` | URL | Amazon purchase link | Required |
| `cover_image` | URL | Book cover image URL | Required |
| `difficulty_level` | Single select | Book difficulty | Beginner, Intermediate, Advanced |
| `tags` | Multiple select | Book categories | See options below |
| `industry_focus` | Single select | Target industry | See options below |
| `learning_style` | Single select | Learning approach | See options below |
| `source` | Multiple select | Data source | See options below |
| `reason_for_inclusion` | Long text | Why this book was included | Required |
| `published_year` | Number | Publication year | 1900-current year |
| `number_of_reviews` | Number | Goodreads review count | Non-negative integer |
| `record_id` | Formula | Auto-generated ID | `RECORD_ID()` |

---

## 🚀 Step-by-Step Setup Process

### Step 1: Prepare Your Airtable Base
1. **Open your Airtable base** (PM Book Recommender)
2. **Navigate to the "books" table** (or create one)
3. **Verify field structure** matches the schema above

### Step 2: Create Required Fields (if missing)

#### Single Select Fields
- **`difficulty_level`**
  - Options: `Beginner`, `Intermediate`, `Advanced`

- **`industry_focus`**
  - Options: `General`, `B2B`, `B2C`, `Health Tech`, `Fintech`, `AI / ML`, `GovTech`, `EdTech`, `Marketplace`, `E-commerce`

- **`learning_style`**
  - Options: `Narrative`, `Framework-driven`, `Reference-style`, `Case Studies`

#### Multiple Select Fields
- **`tags`** - Add these options:
  ```
  fundamentals, product strategy, stakeholder management, 
  technical skills, growth, data & analytics, design & ux, 
  leadership, ai & emerging tech, career navigation, 
  discovery, delivery & execution, ethics & accessibility, 
  communication
  ```

- **`source`** - Add these options:
  ```
  ken norton, lenny's podcast, mind the product, 
  y combinator, goodreads
  ```

#### Other Fields
- **`record_id`** - Create as a formula field with: `RECORD_ID()`
- **`goodreads_rating`** - Set field type to "Number" with decimal places
- **`published_year`** - Set field type to "Number" (whole numbers)
- **`number_of_reviews`** - Set field type to "Number" (whole numbers)

---

## 🔄 Data Import Process

### Using quality_book_scraper.py
1. **Run the scraper**: `python quality_book_scraper.py`
2. **Export data**: Use the script's export functions
3. **Import to Airtable**: Use Airtable's API or import features

### Manual Import (if needed)
1. **Prepare data** in the correct format
2. **Use Airtable's import feature** or API
3. **Map fields** according to the schema above
4. **Verify data** after import

---

## ✅ Validation Checklist

### Before Import
- [ ] All required fields created in Airtable
- [ ] Field types match schema specification
- [ ] Multiple select options configured
- [ ] Formula field for record_id created

### After Import
- [ ] Data validates against schema
- [ ] URLs working (Amazon links, cover images)
- [ ] Filtering working (by difficulty, tags, industry)
- [ ] No duplicate entries
- [ ] Test quiz flow with new data

---

## 🎯 Schema Benefits

### Data Quality
- **Validated inputs**: All data validated against schema
- **Consistent format**: Standardized field types and values
- **Multi-select support**: Proper handling of tags and sources
- **URL validation**: Amazon links and cover images verified

### Flexibility
- **Scalable**: Easy to add new books
- **Maintainable**: Clear schema documentation
- **Extensible**: Can add new fields as needed
- **Source tracking**: Know where each book came from

---

## 🔧 Troubleshooting

### Common Issues & Solutions

**Issue**: "Field not found" error during import
- **Solution**: Create the missing field in Airtable first

**Issue**: Multiple select fields not importing correctly
- **Solution**: Ensure the values match exactly with Airtable options (case-sensitive)

**Issue**: URLs not working
- **Solution**: Check that the URL field type is set to "URL" in Airtable

**Issue**: Validation errors from quality_book_scraper.py
- **Solution**: Check the script's validation rules and fix data format

**Issue**: Duplicate books
- **Solution**: Use Airtable's duplicate detection or manually review

---

## 📞 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify your Airtable field types match the specifications
3. Run the quality_book_scraper.py validation
4. Test with a small dataset first

---

## 📸 TODO: Add Book Cover Images

Cover images are currently not included in the database due to unstable external image hosting (Amazon and Goodreads block hotlinking).

### Manual Approach

To populate the `cover_image` field reliably:

1. After the book list is finalized, download cover images manually or with a script using Amazon or Goodreads links.
2. Save each image with a consistent filename, like `inspired.jpg` or a slugified version of the book title.
3. Upload all images to a stable hosting provider (e.g., Cloudinary, Imgur, or S3).
4. Construct the full URL for each image (e.g., `https://res.cloudinary.com/yourname/image/upload/v1/inspired.jpg`).
5. Update the `cover_image` field in Airtable by matching filenames to book titles. This can be automated using a script or done via CSV import.

### ⚙️ Alternative (Preferred) Approach: Automate Cover Images via Google Books API

To avoid manual image uploads and unreliable external URLs, you can automate population of the `cover_image` field using the Google Books API.

#### ✅ Steps:

1. Ensure each book record includes an `isbn_13` field.
2. Use the following API query:
   https://www.googleapis.com/books/v1/volumes?q=isbn:<isbn_13>
3. From the response, extract:
   - `volumeInfo.imageLinks.thumbnail` → store in `cover_image`
4. These URLs are stable, public, and suitable for Airtable or app usage.

> If ISBN is not available, fallback search using title + author is possible, but may introduce noise.

#### 🚀 Post-MVP Enhancement

This same enrichment process can be extended to populate:
- `isbn_13` (if missing)
- `averageRating` and `ratingsCount`
- Fallback `summary` from `description`

This creates a robust, scalable enrichment pipeline with minimal manual effort.

---

Note: This step is optional and can be deferred until final review or post-MVP.

---

## 🎉 Success!

Once set up, your Airtable base will be ready to receive:
- **High-quality PM books** from trusted sources
- **Schema-validated data** ensuring consistency
- **Comprehensive metadata** for hybrid matching
- **Diverse difficulty levels** for different experience levels
- **Industry-specific books** for various domains

Your PM Book Recommender will have a robust, scalable data pipeline! 