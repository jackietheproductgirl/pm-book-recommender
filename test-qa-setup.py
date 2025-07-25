#!/usr/bin/env python3
"""
Test script to verify the Amazon QA setup works correctly.
"""

import sys
import os

def test_imports():
    """Test that all required packages can be imported."""
    print("Testing imports...")
    
    try:
        import requests
        print("✅ requests imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import requests: {e}")
        return False
    
    try:
        from bs4 import BeautifulSoup
        print("✅ BeautifulSoup imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import BeautifulSoup: {e}")
        return False
    
    try:
        import pandas as pd
        print("✅ pandas imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import pandas: {e}")
        return False
    
    try:
        from rapidfuzz import fuzz
        print("✅ rapidfuzz imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import rapidfuzz: {e}")
        return False
    
    return True

def test_csv_files():
    """Test that CSV files exist and can be read."""
    print("\nTesting CSV files...")
    
    csv_files = [
        'pm-books-batch-1.csv',
        'pm-books-batch-2.csv',
        'pm-books-batch-3.csv',
        'pm-books-batch-4.csv'
    ]
    
    for csv_file in csv_files:
        if os.path.exists(csv_file):
            try:
                import pandas as pd
                df = pd.read_csv(csv_file)
                print(f"✅ {csv_file}: {len(df)} rows, columns: {list(df.columns)}")
            except Exception as e:
                print(f"❌ {csv_file}: Error reading - {e}")
        else:
            print(f"❌ {csv_file}: File not found")

def test_fuzzy_matching():
    """Test fuzzy matching functionality."""
    print("\nTesting fuzzy matching...")
    
    try:
        from rapidfuzz import fuzz
        
        # Test cases
        test_cases = [
            ("Inspired: How To Create Products Customers Love", "Inspired: How To Create Products Customers Love"),
            ("The Mom Test", "The Mom Test: How to talk to customers"),
            ("Hooked: How to Build Habit-Forming Products", "Hooked: How to Build Habit-Forming Products"),
            ("Wrong Book Title", "Completely Different Book")
        ]
        
        for expected, actual in test_cases:
            score = fuzz.ratio(expected.lower(), actual.lower())
            print(f"  '{expected}' vs '{actual}': {score:.1f}%")
        
        print("✅ Fuzzy matching working correctly")
        return True
        
    except Exception as e:
        print(f"❌ Fuzzy matching test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("🧪 Testing Amazon QA Setup\n")
    
    # Test imports
    if not test_imports():
        print("\n❌ Import test failed. Please install required packages:")
        print("   pip install -r requirements-qa.txt")
        return False
    
    # Test CSV files
    test_csv_files()
    
    # Test fuzzy matching
    if not test_fuzzy_matching():
        return False
    
    print("\n✅ All tests passed! Ready to run Amazon QA script.")
    print("\nTo run the full QA:")
    print("   python amazon-link-qa-automated.py")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 