# Automated Amazon Link QA Script

This script automatically validates Amazon book links using fuzzy matching to ensure they point to the correct books.

## Features

- ✅ **Fuzzy Matching**: Uses `rapidfuzz` for intelligent title comparison
- ✅ **Robust HTML Parsing**: Multiple selectors to extract titles from Amazon pages
- ✅ **Error Handling**: Handles timeouts, redirects, and bot detection
- ✅ **Rate Limiting**: Random delays to avoid triggering Amazon's anti-bot measures
- ✅ **Comprehensive Logging**: Detailed logs for debugging and monitoring
- ✅ **CSV Output**: Results saved to `amazon_link_validation.csv`

## Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements-qa.txt
   ```

2. **Test the setup:**
   ```bash
   python test-qa-setup.py
   ```

## Usage

### Quick Start
```bash
python amazon-link-qa-automated.py
```

### What the script does:
1. **Loads book data** from all 4 CSV files (`pm-books-batch-*.csv`)
2. **Fetches each Amazon page** with proper headers and error handling
3. **Extracts the actual book title** from the Amazon page HTML
4. **Compares titles** using fuzzy matching (80% similarity threshold)
5. **Categorizes results** as: `match`, `mismatch`, `broken`, `timeout`, etc.
6. **Saves results** to `amazon_link_validation.csv`

### Output Files

- **`amazon_link_validation.csv`**: Main results with columns:
  - `title`: Expected book title from CSV
  - `amazon_link`: Amazon URL
  - `actual_amazon_title`: Title found on Amazon page
  - `match_score`: Similarity percentage (0-100)
  - `link_status`: `match`, `mismatch`, `broken`, `timeout`, etc.
  - `source_file`: Which CSV file the book came from

- **`amazon_qa.log`**: Detailed execution log

## Configuration

You can modify these settings in the script:

```python
self.match_threshold = 80      # 80% similarity threshold
self.max_retries = 3          # Retry failed requests
self.timeout = 15             # Request timeout in seconds
self.delay_range = (2, 5)     # Random delay between requests
```

## Link Status Categories

- **`match`**: Title similarity ≥ 80% - Link points to correct book
- **`mismatch`**: Title similarity < 80% - Link points to wrong book
- **`broken`**: HTTP error or invalid response
- **`timeout`**: Request timed out
- **`connection_error`**: Network connection failed
- **`bot_detection`**: Amazon blocked the request
- **`no_title_found`**: Page loaded but no title could be extracted

## Example Output

```
================================================================================
AMAZON LINK VALIDATION SUMMARY
================================================================================

📊 Status Distribution:
   match: 180 (83.3%)
   mismatch: 25 (11.6%)
   broken: 8 (3.7%)
   timeout: 3 (1.4%)

📈 Match Score Statistics:
   Average: 85.2%
   Median: 92.1%
   Min: 12.3%
   Max: 100.0%

✅ High Confidence Matches (≥80%): 180
❌ Mismatches: 25
🔗 Broken/Error Links: 11

📄 Detailed results saved to: amazon_link_validation.csv
================================================================================
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Install dependencies with `pip install -r requirements-qa.txt`
2. **Bot Detection**: The script includes delays and proper headers, but Amazon may still block it
3. **Timeouts**: Increase `timeout` value if you have slow internet
4. **Memory Issues**: Process books in smaller batches if you have many books

### Manual Verification

For links flagged as `mismatch` or `broken`, you can:
1. Open the `amazon_link_validation.csv` file
2. Filter by `link_status` column
3. Manually check the flagged links
4. Update the CSV files with corrected Amazon links

## Performance

- **Processing Speed**: ~2-5 seconds per book (due to rate limiting)
- **Total Time**: ~10-15 minutes for 216 books
- **Memory Usage**: Low (processes one book at a time)

## Safety Features

- **Rate Limiting**: Random delays prevent overwhelming Amazon's servers
- **Retry Logic**: Automatically retries failed requests
- **Error Recovery**: Continues processing even if some links fail
- **Graceful Interruption**: Saves partial results if interrupted

## Next Steps

After running the script:

1. **Review results** in `amazon_link_validation.csv`
2. **Fix incorrect links** by updating the CSV files
3. **Re-run validation** to confirm fixes
4. **Consider setting up periodic validation** for ongoing maintenance 