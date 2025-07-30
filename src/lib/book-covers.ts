interface GoogleBooksResponse {
  items?: Array<{
    volumeInfo: {
      title: string;
      authors?: string[];
      imageLinks?: {
        thumbnail?: string;
        smallThumbnail?: string;
        small?: string;
        medium?: string;
        large?: string;
      };
      industryIdentifiers?: Array<{
        type: string;
        identifier: string;
      }>;
    };
  }>;
}

export async function getBookCoverImage(title: string, author?: string): Promise<string | null> {
  try {
    // Search Google Books API
    const searchQuery = encodeURIComponent(`${title} ${author || ''}`.trim());
    const url = `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&maxResults=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }
    
    const data: GoogleBooksResponse = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.warn(`No book found for: ${title} by ${author}`);
      return null;
    }
    
    const book = data.items[0];
    const imageLinks = book.volumeInfo.imageLinks;
    
    // Return the best available image
    if (imageLinks?.large) {
      return imageLinks.large;
    } else if (imageLinks?.medium) {
      return imageLinks.medium;
    } else if (imageLinks?.small) {
      return imageLinks.small;
    } else if (imageLinks?.thumbnail) {
      return imageLinks.thumbnail;
    } else if (imageLinks?.smallThumbnail) {
      return imageLinks.smallThumbnail;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching book cover from Google Books:', error);
    return null;
  }
}

export async function getBookCoverByISBN(isbn: string): Promise<string | null> {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }
    
    const data: GoogleBooksResponse = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.warn(`No book found for ISBN: ${isbn}`);
      return null;
    }
    
    const book = data.items[0];
    const imageLinks = book.volumeInfo.imageLinks;
    
    // Return the best available image
    if (imageLinks?.large) {
      return imageLinks.large;
    } else if (imageLinks?.medium) {
      return imageLinks.medium;
    } else if (imageLinks?.small) {
      return imageLinks.small;
    } else if (imageLinks?.thumbnail) {
      return imageLinks.thumbnail;
    } else if (imageLinks?.smallThumbnail) {
      return imageLinks.smallThumbnail;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching book cover by ISBN:', error);
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

// Batch process books to get cover images
export async function updateBookCovers(books: Array<{ title: string; author: string; amazonLink: string; coverImage?: string }>): Promise<Array<{ title: string; author: string; amazonLink: string; coverImage: string | undefined }>> {
  const updatedBooks = [];
  
  for (const book of books) {
    let coverImage = book.coverImage;
    
    // If no cover image exists, try to fetch one
    if (!coverImage) {
      // First try by ISBN from Amazon URL
      const isbn = extractISBNFromAmazonUrl(book.amazonLink);
      if (isbn) {
        const isbnCover = await getBookCoverByISBN(isbn);
        if (isbnCover) {
          coverImage = isbnCover;
        }
      }
      
      // If still no cover, try by title and author
      if (!coverImage) {
        const titleCover = await getBookCoverImage(book.title, book.author);
        if (titleCover) {
          coverImage = titleCover;
        }
      }
    }
    
    updatedBooks.push({
      ...book,
      coverImage: coverImage || undefined
    });
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return updatedBooks;
} 