import crypto from 'crypto';

interface AmazonProductResponse {
  Items: {
    Item: {
      ASIN: string;
      DetailPageURL: string;
      ItemAttributes?: {
        Title?: string;
        Author?: string;
      };
      LargeImage?: {
        URL: string;
      };
      MediumImage?: {
        URL: string;
      };
      SmallImage?: {
        URL: string;
      };
    };
  }[];
}

export async function getAmazonCoverImage(amazonUrl: string): Promise<string | null> {
  try {
    // Extract ASIN from Amazon URL
    const asinMatch = amazonUrl.match(/\/dp\/([A-Z0-9]{10})/);
    if (!asinMatch) {
      console.warn('Could not extract ASIN from Amazon URL:', amazonUrl);
      return null;
    }
    
    const asin = asinMatch[1];
    
    // Use Amazon Product Advertising API
    const accessKey = process.env.AWS_ACCESS_KEY_ID;
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
    const associateTag = process.env.AMAZON_ASSOCIATE_TAG;
    
    if (!accessKey || !secretKey || !associateTag) {
      console.warn('Amazon API credentials not configured');
      return null;
    }
    
    const timestamp = new Date().toISOString();
    const queryParams = new URLSearchParams({
      'Service': 'AWSECommerceService',
      'Version': '2013-08-01',
      'Operation': 'ItemLookup',
      'ItemId': asin,
      'IdType': 'ASIN',
      'ResponseGroup': 'Images,ItemAttributes',
      'AssociateTag': associateTag,
      'AWSAccessKeyId': accessKey,
      'Timestamp': timestamp,
    });
    
    const stringToSign = `GET\necs.amazonaws.com\n/onca/xml\n${queryParams.toString()}`;
    const signature = crypto.createHmac('sha256', secretKey).update(stringToSign).digest('base64');
    
    const url = `https://ecs.amazonaws.com/onca/xml?${queryParams.toString()}&Signature=${encodeURIComponent(signature)}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Amazon API error: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Extract image URL from XML response
    const largeImage = xmlDoc.querySelector('LargeImage URL');
    const mediumImage = xmlDoc.querySelector('MediumImage URL');
    const smallImage = xmlDoc.querySelector('SmallImage URL');
    
    return largeImage?.textContent || mediumImage?.textContent || smallImage?.textContent || null;
    
  } catch (error) {
    console.error('Error fetching Amazon cover image:', error);
    return null;
  }
}

// Fallback function using Open Library API (free, no API key required)
export async function getOpenLibraryCoverImage(isbn: string): Promise<string | null> {
  try {
    const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status}`);
    }
    
    const data = await response.json();
    const bookData = data[`ISBN:${isbn}`];
    
    if (bookData?.cover?.large) {
      return bookData.cover.large;
    } else if (bookData?.cover?.medium) {
      return bookData.cover.medium;
    } else if (bookData?.cover?.small) {
      return bookData.cover.small;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Open Library cover image:', error);
    return null;
  }
}

// Extract ISBN from Amazon URL
export function extractISBNFromAmazonUrl(amazonUrl: string): string | null {
  // Try to extract ISBN from various Amazon URL formats
  const patterns = [
    /\/dp\/([0-9X]{10,13})/, // Standard ASIN/ISBN format
    /\/product\/([0-9X]{10,13})/, // Product format
    /isbn=([0-9X]{10,13})/, // ISBN parameter
  ];
  
  for (const pattern of patterns) {
    const match = amazonUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
} 