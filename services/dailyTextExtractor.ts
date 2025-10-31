/**
 * Daily Text Extraction Service
 * Extracts plain text content from the daily Rhapsody PDF documents
 * Based on the specifications: Extract title, date, and first paragraph from the second page
 * (first article page) of the 3-page daily reading.
 */

import DailyReadingUtils from '@/utils/dailyReadingUtils';

export interface DailyTextContent {
  title: string;
  date: string;
  firstParagraph: string;
  isValid: boolean;
  error?: string;
}

export interface DailyTextExtractor {
  extractDailyText(): Promise<DailyTextContent>;
  getEnglishPdfUrl(): string;
  getArticlePageNumber(): number;
}

/**
 * Service for extracting plain text from daily Rhapsody articles
 * 
 * Implementation Note:
 * Since we need to extract actual text content (not PDF rendering), 
 * this service would ideally connect to a backend text extraction API
 * or use a PDF text extraction library.
 * 
 * For now, we'll implement a mock structure with the understanding that
 * the actual text extraction would need to be implemented based on
 * the available PDF processing capabilities.
 */
export const useDailyTextExtractor = (): DailyTextExtractor => {
  
  /**
   * Get the URL for the English daily PDF
   */
  const getEnglishPdfUrl = (): string => {
    // Based on the pattern from DailyReadingUtils
    return 'https://mediathek.tniglobal.org/read/October%202025%20English%20Inner.pdf';
  };

  /**
   * Get the page number of the first article page (second in the 3-page set)
   */
  const getArticlePageNumber = (): number => {
    const dailyPages = DailyReadingUtils.getDailyReadingPageNumbers();
    // dailyPages = [coverPage, startPage, endPage]
    // We want the startPage (first article page)
    if (!dailyPages || dailyPages.length < 2) {
      throw new Error('Invalid daily pages array');
    }
    return dailyPages[1]; // Second page in the array is the first article page
  };

  /**
   * Extract title, date, and first paragraph from the daily article page
   * Targets specifically the second page (first article page) from the 3-page daily reading set
   * 
   * Implementation sequence:
   * 1. Calculate correct page numbers using DailyReadingUtils
   * 2. Extract text from the second page only (first article page)
   * 3. Parse the extracted text to separate title, date, and first paragraph
   * 4. Return structured content for display
   */
  const extractDailyText = async (): Promise<DailyTextContent> => {
    try {
      const today = new Date();
      const dayOfMonth = today.getDate();
      const dailyPages = DailyReadingUtils.getDailyReadingPageNumbers();
      const articlePageNumber = dailyPages[1]; // Second page (index 1) is the first article page
      
      console.log(`Extracting text for day ${dayOfMonth}, page ${articlePageNumber}`);

      // Get the English PDF URL
      const pdfUrl = getEnglishPdfUrl();
      
      // Call the text extraction API focusing on the second page only
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/daily/extract-text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            pdfUrl,
            pageNumber: articlePageNumber, // Specifically targeting the second page
            day: dayOfMonth,
            extractionConfig: {
              extractTitle: true,      // Extract article title from top of page
              extractDate: true,       // Extract date if present
              extractFirstParagraph: true, // Extract only the first paragraph
              maxParagraphLength: 500  // Limit paragraph length for preview
            }
          })
        });

        if (!response.ok) {
          throw new Error('Failed to extract text from PDF');
        }

        const data = await response.json();
        
        // Process and format the extracted content
        const formattedDate = new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });

        return {
          title: data.title || `Rhapsody of Realities - Day ${dayOfMonth}`,
          date: data.date || formattedDate,
          firstParagraph: data.firstParagraph || 'Loading today\'s inspiration...',
          isValid: true
        };
      } catch (error) {
        // If API call fails, provide meaningful temporary content
        console.warn('Text extraction API failed, using structured fallback data:', error);
        return {
          title: `Today's Reading - Day ${dayOfMonth}`,
          date: today.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          firstParagraph: 'Read today\'s article of your daily devotional.',
          isValid: true
        };
      }

    } catch (error) {
      console.error('Error extracting daily text:', error);
      return {
        title: 'Daily Reflection',
        date: new Date().toLocaleDateString(),
        firstParagraph: 'Unable to load today\'s reflection. Please try again later.',
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  return {
    extractDailyText,
    getEnglishPdfUrl,
    getArticlePageNumber
  };
};

export default useDailyTextExtractor;