import { DailyReadingPageInfo } from '@/types';

export class DailyReadingUtils {
    /**
     * Calculate which pages to display for today's daily reading
     * NEW SPECIFICATION:
     * - Each day has exactly 2 pages for the article
     * - Day 1: pages 6-7, Day 2: pages 8-9, Day 3: pages 10-11, etc.
     * - We show 3 pages total: Cover page (1) + 2 article pages for current day
     */
    static getDailyReadingPages(): DailyReadingPageInfo {
        const today = new Date();
        const dayOfMonth = today.getDate();
        
        // Cover page is always page 1
        const coverPage = 1;
        
        // Daily articles start from page 6
        // Day 1: pages 6-7, Day 2: pages 8-9, Day 3: pages 10-11, etc.
        const startPage = 4 + (dayOfMonth * 2); // Day 1 -> 4 + (1*2) = 6, Day 2 -> 4 + (2*2) = 8
        const endPage = startPage + 1;
        
        // Always show exactly 3 pages: cover + 2 article pages
        const totalPages = 3;
        
        console.log('Daily reading calculation:', {
            dayOfMonth,
            coverPage,
            startPage,
            endPage,
            totalPages
        });
        
        return {
            coverPage,
            startPage,
            endPage,
            totalPages,
            dayOfMonth
        };
    }

    /**
     * Get array of page numbers that should be displayed for daily reading
     * @returns [coverPage, articlePage1, articlePage2] - exactly 3 pages
     */
    static getDailyReadingPageNumbers(): number[] {
        const { coverPage, startPage, endPage } = this.getDailyReadingPages();
        const pages = [coverPage, startPage, endPage];
        console.log('Daily reading page numbers:', pages);
        return pages;
    }

    /**
     * Build PDF URL from file name
     * @param fileName - File name from backend
     * @returns Properly encoded PDF URL
     */
    static buildPdfUrl(fileName: string): string {
        const baseUrl = process.env.EXPO_PUBLIC_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL;
        const encodedFileName = encodeURIComponent(fileName);
        return `${baseUrl}/read/${encodedFileName}`;
    }

    /**
     * Check if user has access to a language based on subscription
     * @param language - The language to check
     * @param subscriptionLanguages - Array of subscribed languages
     * @param subscriptionStatus - User's subscription status
     * @returns Object with access status and reason
     */
    static checkLanguageAccess(
        language: { type: 'open' | 'subscription'; label: string },
        subscriptionLanguages: string[] = [],
        subscriptionStatus?: string
    ): { hasAccess: boolean; reason: string; actionType?: 'free-trial' | 'purchase' | 'none' } {
        // Free languages are always accessible
        if (language.type === 'open') {
            return { hasAccess: true, reason: 'Free language', actionType: 'none' };
        }

        // Premium language - check subscription
        if (language.type === 'subscription') {
            // Check for free trial wildcard
            if (subscriptionLanguages.includes('*')) {
                return { hasAccess: true, reason: 'Free trial access', actionType: 'none' };
            }

            // Check if language is in subscription
            if (subscriptionLanguages.includes(language.label)) {
                return { hasAccess: true, reason: 'Subscribed language', actionType: 'none' };
            }

            // No access - determine action type based on subscription status
            if (subscriptionStatus === 'standard' || !subscriptionStatus) {
                return { 
                    hasAccess: false, 
                    reason: 'Premium language - Start free trial to access all languages',
                    actionType: 'free-trial'
                };
            } else {
                return { 
                    hasAccess: false, 
                    reason: 'Language not in your subscription - Purchase as additional language',
                    actionType: 'purchase'
                };
            }
        }

        return { hasAccess: false, reason: 'Unknown language type', actionType: 'none' };
    }

    /**
     * Format day display text
     * @param dayOfMonth - Current day of month
     * @returns Formatted string like "Day 15"
     */
    static formatDayDisplay(dayOfMonth: number): string {
        return `Day ${dayOfMonth}`;
    }

    /**
     * Get reading progress for current month
     * @param dayOfMonth - Current day of month
     * @returns Progress percentage (0-100)
     */
    static getMonthlyProgress(dayOfMonth: number): number {
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        return Math.round((dayOfMonth / daysInMonth) * 100);
    }
}

export default DailyReadingUtils;