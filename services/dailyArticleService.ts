/**
 * PDF Article Service
 * Handles daily article calculation and PDF page management for Rhapsody documents
 */

export interface ArticleInfo {
  dayNumber: number;
  startPage: number;
  endPage: number;
  currentDate: Date;
  isValidDay: boolean;
}

export interface DailyArticleService {
  getCurrentDayArticle: () => ArticleInfo;
  getArticleForDay: (day: number) => ArticleInfo;
  getDaysInCurrentMonth: () => number;
  isValidDayForCurrentMonth: (day: number) => boolean;
}

/**
 * Service for handling daily articles in Rhapsody PDF documents
 * 
 * Document structure:
 * - Pages 1-5: Introduction
 * - Page 6-7: Day 1 article
 * - Page 8-9: Day 2 article
 * - ...and so on (2 pages per day)
 */
export const useDailyArticleService = (): DailyArticleService => {
  const INTRO_PAGES = 5;
  const PAGES_PER_ARTICLE = 2;

  /**
   * Calculate the page range for a specific day's article
   */
  const getArticleForDay = (day: number): ArticleInfo => {
    const currentDate = new Date();
    const daysInMonth = getDaysInCurrentMonth();
    const isValidDay = day >= 1 && day <= daysInMonth;

    // Calculate pages: Introduction (5 pages) + (day-1) * 2 pages per article
    const startPage = INTRO_PAGES + ((day - 1) * PAGES_PER_ARTICLE) + 1;
    const endPage = startPage + 1;

    return {
      dayNumber: day,
      startPage,
      endPage,
      currentDate,
      isValidDay
    };
  };

  /**
   * Get the article for the current day
   */
  const getCurrentDayArticle = (): ArticleInfo => {
    const today = new Date();
    const currentDay = today.getDate();
    return getArticleForDay(currentDay);
  };

  /**
   * Get the number of days in the current month
   */
  const getDaysInCurrentMonth = (): number => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Get the last day of the current month
    const lastDay = new Date(year, month + 1, 0);
    return lastDay.getDate();
  };

  /**
   * Check if a day is valid for the current month
   */
  const isValidDayForCurrentMonth = (day: number): boolean => {
    const daysInMonth = getDaysInCurrentMonth();
    return day >= 1 && day <= daysInMonth;
  };

  return {
    getCurrentDayArticle,
    getArticleForDay,
    getDaysInCurrentMonth,
    isValidDayForCurrentMonth
  };
};

/**
 * Utility functions for PDF handling
 */
export const PdfUtils = {
  /**
   * Calculate total pages needed for a month
   */
  getTotalPagesForMonth: (daysInMonth: number): number => {
    const INTRO_PAGES = 5;
    const PAGES_PER_ARTICLE = 2;
    return INTRO_PAGES + (daysInMonth * PAGES_PER_ARTICLE);
  },

  /**
   * Format article title based on day
   */
  getArticleTitle: (day: number): string => {
    const today = new Date();
    const month = today.toLocaleString('en-US', { month: 'long' });
    const year = today.getFullYear();
    
    const ordinal = (n: number): string => {
      const suffixes = ['th', 'st', 'nd', 'rd'];
      const value = n % 100;
      return n + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
    };

    return `${month} ${ordinal(day)}, ${year}`;
  },

  /**
   * Get reading progress as percentage
   */
  getReadingProgress: (currentDay: number, daysInMonth: number): number => {
    return Math.round((currentDay / daysInMonth) * 100);
  },

  /**
   * Get navigation info for prev/next days
   */
  getNavigationInfo: (currentDay: number, daysInMonth: number) => {
    return {
      hasPrevious: currentDay > 1,
      hasNext: currentDay < daysInMonth,
      previousDay: currentDay > 1 ? currentDay - 1 : null,
      nextDay: currentDay < daysInMonth ? currentDay + 1 : null
    };
  }
};

/**
 * Hook for managing PDF reading state
 */
export const usePdfReaderState = (initialDay?: number) => {
  const articleService = useDailyArticleService();
  const today = new Date().getDate();
  const currentDay = initialDay || today;

  const [selectedDay, setSelectedDay] = React.useState(currentDay);
  const [currentPage, setCurrentPage] = React.useState(1); // 1 or 2 (for the 2-page article)

  const currentArticle = articleService.getArticleForDay(selectedDay);
  const daysInMonth = articleService.getDaysInCurrentMonth();
  const navigation = PdfUtils.getNavigationInfo(selectedDay, daysInMonth);

  const goToPreviousDay = () => {
    if (navigation.hasPrevious && navigation.previousDay) {
      setSelectedDay(navigation.previousDay);
      setCurrentPage(1); // Reset to first page of new article
    }
  };

  const goToNextDay = () => {
    if (navigation.hasNext && navigation.nextDay) {
      setSelectedDay(navigation.nextDay);
      setCurrentPage(1); // Reset to first page of new article
    }
  };

  const goToDay = (day: number) => {
    if (articleService.isValidDayForCurrentMonth(day)) {
      setSelectedDay(day);
      setCurrentPage(1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < 2) {
      setCurrentPage(2);
    } else if (navigation.hasNext) {
      goToNextDay();
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(1);
    } else if (navigation.hasPrevious) {
      goToPreviousDay();
      setCurrentPage(2); // Go to last page of previous article
    }
  };

  // Calculate actual PDF page number
  const actualPdfPage = currentArticle.startPage + (currentPage - 1);

  return {
    selectedDay,
    currentPage,
    currentArticle,
    daysInMonth,
    navigation,
    actualPdfPage,
    goToPreviousDay,
    goToNextDay,
    goToDay,
    goToNextPage,
    goToPreviousPage,
    setCurrentPage
  };
};

// Import React for useState
import React from 'react';
