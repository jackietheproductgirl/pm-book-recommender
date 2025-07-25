#!/usr/bin/env python3
"""
Automated Amazon Link QA Script
Uses fuzzy matching to validate that Amazon links point to the correct books.
"""

import csv
import time
import random
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import pandas as pd
from rapidfuzz import fuzz
import logging
from typing import Dict, List, Optional, Tuple
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('amazon_qa.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class AmazonLinkQA:
    def __init__(self, csv_files: List[str], output_file: str = 'amazon_link_validation.csv'):
        self.csv_files = csv_files
        self.output_file = output_file
        self.session = self._create_session()
        self.results = []
        
        # Configuration
        self.match_threshold = 80  # 80% similarity threshold
        self.max_retries = 3
        self.timeout = 15
        self.delay_range = (2, 5)  # Random delay between requests
        
    def _create_session(self) -> requests.Session:
        """Create a requests session with proper headers to avoid bot detection."""
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        })
        return session
    
    def _extract_amazon_title(self, html: str) -> Optional[str]:
        """
        Extract the product title from Amazon page HTML.
        Uses multiple selectors to handle different page layouts.
        """
        try:
            soup = BeautifulSoup(html, 'html.parser')
            
            # Multiple selectors for product title
            title_selectors = [
                'span#productTitle',
                'h1#title',
                'h1.a-size-large',
                'span.a-size-large',
                'h1[data-automation-id="product-title"]',
                'span[data-automation-id="product-title"]'
            ]
            
            for selector in title_selectors:
                element = soup.select_one(selector)
                if element and element.get_text().strip():
                    title = element.get_text().strip()
                    logger.debug(f"Found title using selector '{selector}': {title}")
                    return title
            
            # Fallback: look for title in JSON-LD structured data
            json_ld_scripts = soup.find_all('script', type='application/ld+json')
            for script in json_ld_scripts:
                try:
                    import json
                    data = json.loads(script.string)
                    if isinstance(data, dict) and 'name' in data:
                        title = data['name'].strip()
                        if title:
                            logger.debug(f"Found title in JSON-LD: {title}")
                            return title
                except (json.JSONDecodeError, AttributeError):
                    continue
            
            # Fallback: look for title in page title
            title_tag = soup.find('title')
            if title_tag:
                title = title_tag.get_text().strip()
                # Clean up Amazon page title (remove "Amazon.com:" prefix)
                if 'Amazon.com:' in title:
                    title = title.split('Amazon.com:', 1)[1].strip()
                if title and len(title) > 10:  # Basic validation
                    logger.debug(f"Found title in page title: {title}")
                    return title
            
            logger.warning("No title found in HTML")
            return None
            
        except Exception as e:
            logger.error(f"Error extracting title from HTML: {e}")
            return None
    
    def _is_bot_detection(self, html: str) -> bool:
        """Check if Amazon is showing bot detection page."""
        bot_indicators = [
            'Robot Check',
            'captcha',
            'Access Denied',
            'Sorry, we just need to make sure you\'re not a robot',
            'Type the characters you see in this image',
            'Enter the characters you see below'
        ]
        
        html_lower = html.lower()
        return any(indicator.lower() in html_lower for indicator in bot_indicators)
    
    def _fetch_amazon_page(self, url: str) -> Tuple[bool, Optional[str], str]:
        """
        Fetch Amazon page with retry logic and error handling.
        Returns: (success, html_content, error_message)
        """
        for attempt in range(self.max_retries):
            try:
                logger.info(f"Fetching {url} (attempt {attempt + 1}/{self.max_retries})")
                
                response = self.session.get(
                    url, 
                    timeout=self.timeout,
                    allow_redirects=True
                )
                
                # Check for successful response
                if response.status_code == 200:
                    html = response.text
                    
                    # Check for bot detection
                    if self._is_bot_detection(html):
                        logger.warning(f"Bot detection triggered for {url}")
                        return False, None, "Bot detection"
                    
                    return True, html, ""
                
                elif response.status_code in [301, 302, 307, 308]:
                    # Handle redirects
                    final_url = response.url
                    logger.info(f"Redirected to: {final_url}")
                    if 'amazon.com' in final_url:
                        # Follow the redirect
                        response = self.session.get(final_url, timeout=self.timeout)
                        if response.status_code == 200:
                            return True, response.text, ""
                        else:
                            return False, None, f"Redirect failed: {response.status_code}"
                    else:
                        return False, None, f"Redirected to non-Amazon URL: {final_url}"
                
                else:
                    return False, None, f"HTTP {response.status_code}"
                    
            except requests.exceptions.Timeout:
                error_msg = f"Timeout on attempt {attempt + 1}"
                logger.warning(error_msg)
                if attempt == self.max_retries - 1:
                    return False, None, error_msg
                    
            except requests.exceptions.ConnectionError as e:
                error_msg = f"Connection error on attempt {attempt + 1}: {e}"
                logger.warning(error_msg)
                if attempt == self.max_retries - 1:
                    return False, None, error_msg
                    
            except Exception as e:
                error_msg = f"Unexpected error on attempt {attempt + 1}: {e}"
                logger.error(error_msg)
                if attempt == self.max_retries - 1:
                    return False, None, error_msg
            
            # Wait before retry
            if attempt < self.max_retries - 1:
                time.sleep(random.uniform(1, 3))
        
        return False, None, "Max retries exceeded"
    
    def _calculate_similarity(self, expected_title: str, actual_title: str) -> float:
        """
        Calculate similarity score between expected and actual titles.
        Uses multiple fuzzy matching algorithms and returns the best score.
        """
        if not expected_title or not actual_title:
            return 0.0
        
        # Clean titles for comparison
        expected_clean = expected_title.lower().strip()
        actual_clean = actual_title.lower().strip()
        
        # Calculate different similarity scores
        ratio_score = fuzz.ratio(expected_clean, actual_clean)
        partial_ratio_score = fuzz.partial_ratio(expected_clean, actual_clean)
        token_sort_ratio_score = fuzz.token_sort_ratio(expected_clean, actual_clean)
        token_set_ratio_score = fuzz.token_set_ratio(expected_clean, actual_clean)
        
        # Return the best score
        best_score = max(ratio_score, partial_ratio_score, token_sort_ratio_score, token_set_ratio_score)
        
        logger.debug(f"Similarity scores for '{expected_title}' vs '{actual_title}': "
                    f"ratio={ratio_score}, partial={partial_ratio_score}, "
                    f"token_sort={token_sort_ratio_score}, token_set={token_set_ratio_score}, "
                    f"best={best_score}")
        
        return best_score
    
    def _determine_link_status(self, similarity_score: float, error_message: str) -> str:
        """Determine the status of the link based on similarity score and errors."""
        if error_message:
            if "Bot detection" in error_message:
                return "bot_detection"
            elif "Timeout" in error_message:
                return "timeout"
            elif "Connection error" in error_message:
                return "connection_error"
            else:
                return "broken"
        elif similarity_score >= self.match_threshold:
            return "match"
        else:
            return "mismatch"
    
    def load_book_data(self) -> List[Dict]:
        """Load book data from CSV files."""
        all_books = []
        
        for csv_file in self.csv_files:
            logger.info(f"Loading data from {csv_file}")
            try:
                df = pd.read_csv(csv_file)
                
                # Validate required columns
                required_columns = ['title', 'amazon_link']
                missing_columns = [col for col in required_columns if col not in df.columns]
                if missing_columns:
                    logger.error(f"Missing required columns in {csv_file}: {missing_columns}")
                    continue
                
                # Filter out rows with missing data
                df = df.dropna(subset=['title', 'amazon_link'])
                
                for _, row in df.iterrows():
                    all_books.append({
                        'title': row['title'].strip(),
                        'amazon_link': row['amazon_link'].strip(),
                        'source_file': csv_file
                    })
                
                logger.info(f"Loaded {len(df)} books from {csv_file}")
                
            except Exception as e:
                logger.error(f"Error loading {csv_file}: {e}")
        
        logger.info(f"Total books loaded: {len(all_books)}")
        return all_books
    
    def validate_links(self, books: List[Dict]) -> None:
        """Validate all Amazon links using fuzzy matching."""
        logger.info(f"Starting validation of {len(books)} Amazon links")
        
        for i, book in enumerate(books, 1):
            logger.info(f"Processing {i}/{len(books)}: {book['title']}")
            
            # Fetch Amazon page
            success, html, error_message = self._fetch_amazon_page(book['amazon_link'])
            
            if success and html:
                # Extract title from Amazon page
                actual_title = self._extract_amazon_title(html)
                
                if actual_title:
                    # Calculate similarity
                    similarity_score = self._calculate_similarity(book['title'], actual_title)
                    link_status = self._determine_link_status(similarity_score, "")
                    
                    logger.info(f"  ✅ Found title: '{actual_title}' (similarity: {similarity_score:.1f}%)")
                else:
                    similarity_score = 0.0
                    actual_title = ""
                    link_status = "no_title_found"
                    logger.warning(f"  ⚠️  No title found on Amazon page")
            else:
                similarity_score = 0.0
                actual_title = ""
                link_status = self._determine_link_status(0.0, error_message)
                logger.error(f"  ❌ Failed to fetch page: {error_message}")
            
            # Store result
            result = {
                'title': book['title'],
                'amazon_link': book['amazon_link'],
                'actual_amazon_title': actual_title,
                'match_score': similarity_score,
                'link_status': link_status,
                'source_file': book['source_file']
            }
            self.results.append(result)
            
            # Random delay to avoid rate limiting
            delay = random.uniform(*self.delay_range)
            logger.debug(f"Waiting {delay:.1f} seconds before next request")
            time.sleep(delay)
    
    def save_results(self) -> None:
        """Save validation results to CSV file."""
        logger.info(f"Saving results to {self.output_file}")
        
        try:
            df = pd.DataFrame(self.results)
            df.to_csv(self.output_file, index=False)
            logger.info(f"Results saved successfully")
            
            # Print summary
            self.print_summary()
            
        except Exception as e:
            logger.error(f"Error saving results: {e}")
    
    def print_summary(self) -> None:
        """Print a summary of validation results."""
        if not self.results:
            logger.warning("No results to summarize")
            return
        
        df = pd.DataFrame(self.results)
        
        print("\n" + "="*80)
        print("AMAZON LINK VALIDATION SUMMARY")
        print("="*80)
        
        # Status counts
        status_counts = df['link_status'].value_counts()
        print(f"\n📊 Status Distribution:")
        for status, count in status_counts.items():
            percentage = (count / len(df)) * 100
            print(f"   {status}: {count} ({percentage:.1f}%)")
        
        # Match score statistics
        match_scores = df[df['match_score'] > 0]['match_score']
        if len(match_scores) > 0:
            print(f"\n📈 Match Score Statistics:")
            print(f"   Average: {match_scores.mean():.1f}%")
            print(f"   Median: {match_scores.median():.1f}%")
            print(f"   Min: {match_scores.min():.1f}%")
            print(f"   Max: {match_scores.max():.1f}%")
        
        # High confidence matches
        high_matches = df[df['match_score'] >= self.match_threshold]
        print(f"\n✅ High Confidence Matches (≥{self.match_threshold}%): {len(high_matches)}")
        
        # Mismatches
        mismatches = df[df['link_status'] == 'mismatch']
        print(f"❌ Mismatches: {len(mismatches)}")
        
        # Broken links
        broken = df[df['link_status'].isin(['broken', 'timeout', 'connection_error'])]
        print(f"🔗 Broken/Error Links: {len(broken)}")
        
        print(f"\n📄 Detailed results saved to: {self.output_file}")
        print("="*80)

def main():
    """Main execution function."""
    # CSV files to process
    csv_files = [
        'pm-books-batch-1.csv',
        'pm-books-batch-2.csv', 
        'pm-books-batch-3.csv',
        'pm-books-batch-4.csv'
    ]
    
    # Initialize QA tool
    qa = AmazonLinkQA(csv_files)
    
    try:
        # Load book data
        books = qa.load_book_data()
        
        if not books:
            logger.error("No books loaded. Exiting.")
            return
        
        # Validate links
        qa.validate_links(books)
        
        # Save results
        qa.save_results()
        
    except KeyboardInterrupt:
        logger.info("Validation interrupted by user")
        if qa.results:
            qa.save_results()
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        if qa.results:
            qa.save_results()

if __name__ == "__main__":
    main() 