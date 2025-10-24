const RHAPSODYLANGUAGES_API = process.env.EXPO_PUBLIC_API_BASE_URL;

const TNICCADMIN_API = "https://tniccadminapi.tniglobal.org/api";
const MINISTRYPROGS_API = "https://ministryprogsapi.tniglobal.org/api";

const allMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const RhapsodyLanguagesAPI = {

  // lookup a single random meal
  fetchRegions: async () => {
    try {
      const response = await fetch(`${RHAPSODYLANGUAGES_API}/continents`);
      const jsonData = await response.json();
      return jsonData.data;
    } catch (error) {
      console.error("Error getting random meal:", error);
      return null;
    }
  },

  fetchCountriesByRegion: async (regionLabel: string) => {
    console.log("Fetching countries for region:", regionLabel);
    try {
      

      const response = await fetch(`${RHAPSODYLANGUAGES_API}/getCountriesByContinent/${regionLabel}`);
      const jsonData = await response.json();

      console.log("Countries by Region Data:", jsonData);
      return jsonData.data.countries;

    } catch (error) {
      console.error("Error getting countries by region:", error);
      return null;
    }
  },

  fetchLanguagesByAlphabetLetter: async (letter: string) => {
    console.log("Fetching languages for letter:", letter);

    try {
      const response = await fetch(`${RHAPSODYLANGUAGES_API}/rorlanguagesByName/${letter}`);
      const jsonData = await response.json();

      console.log("Languages by Alphabet Letter Data:", jsonData);
      return jsonData.data;

    } catch (error) {
      console.error("Error getting languages by alphabet letter:", error);
      return null;
    }
  },

  fetchRorlanguagesByName: async () => {
    console.log("Fetching languages by name:");

    try {
      const response = await fetch(`${RHAPSODYLANGUAGES_API}/rorlanguagesByName`);
      const jsonData = await response.json();

      console.log("Languages by Alphabet Data:", jsonData);
      return jsonData.data;

    } catch (error) {
      console.error("Error getting languages by alphabet:", error);
      return null;
    }
  },


  fetchDynamicText: async () => {
    try {
      const response = await fetch(`${TNICCADMIN_API}/programs/lingual_ror_languages_about`);
      const jsonData = await response.json();
      console.log("Dynamic Text Data:", jsonData);
      return jsonData.data;
    } catch (error) {
      console.error("Error getting dynamic text:", error);
      return null;
    }
  },

  fetchUpcomingProgram: async () => {
    try {
      const response = await fetch(`${MINISTRYPROGS_API}/upcomingProgram`);
      const jsonData = await response.json();
      return jsonData.data;
    } catch (error) {
      console.error("Error getting dynamic text:", error);
      return null;
    }
  },

  fetchWorkforceCategories: async () => {
    try {
      //const response = await fetch(`${RHAPSODYLANGUAGES_API}/workforce-categories`);
      //const data = await response.json();
      const data = [
          {
            id: 1,
            categCardsImg: "https://res.cloudinary.com/dw6qzerto/image/upload/f_auto,q_auto,c_fit/v1679320733/tniglobal/assets/ROR_LANGUAGE_SPONSORSHIP_Logo_2_s27bb9",
            categCardsUrl: "https://tniglobal.org/join",
          },
          {
            id: 2,
            categCardsImg: "https://res.cloudinary.com/dw6qzerto/image/upload/f_auto,q_auto,c_fit/v1679356492/tniglobal/assets/LWT_wk4ch8",
            categCardsUrl: "https://smiles.tniglobal.org/give",
          },
          {
            id: 3,
            categCardsImg: "https://res.cloudinary.com/dw6qzerto/image/upload/f_auto,q_auto,c_fit/v1679356495/tniglobal/assets/TNILD_yxaago",
            categCardsUrl: "https://tniglobal.org/join",
          },
          {
            id: 4,
            categCardsImg: "https://res.cloudinary.com/dw6qzerto/image/upload/f_auto,q_auto,c_fit/v1679320736/tniglobal/assets/Rhapsody_Language_Ambassador_iuimsb",
            categCardsUrl: "https://tniglobal.org/join",
          },
          {
            id: 5,
            categCardsImg: "https://res.cloudinary.com/dw6qzerto/image/upload/f_auto,q_auto,c_fit/v1679320735/tniglobal/assets/Media_Connectors_Network_Logo_jkye1o",
            categCardsUrl: "https://tniglobal.org/join",
          },
          {
            id: 6,
            categCardsImg: "https://res.cloudinary.com/dw6qzerto/image/upload/f_auto,q_auto,c_fit/v1679356497/tniglobal/assets/TNILM_xievm7",
            categCardsUrl: "https://tniglobal.org/join"
          },
          {
            id: 7,
            categCardsImg: "https://res.cloudinary.com/dw6qzerto/image/upload/f_auto,q_auto,c_fit/v1679322818/tniglobal/assets/Translations_Services_logo_wqezyi",
            categCardsUrl: "https://tniglobal.org/join"
          },
          
        ]
      return data;
    } catch (error) {
      console.error("Error getting workforce categories:", error);
      return null;
    }
  },

  fetchPackages: async () => {
    try {
      const response = await fetch(`${RHAPSODYLANGUAGES_API}/packages`);
      const jsonData = await response.json();
      return jsonData.data;
    } catch (error) {
      console.error("Error getting packages:", error);
      return null;
    }
  },

  fetchPackageDetails: async (id: string) => {
    try {
      const response = await fetch(`${RHAPSODYLANGUAGES_API}/packages/${id}`);
      const jsonData = await response.json();
      return jsonData.data;
      
    } catch (error) {
      console.error("Error getting packages:", error);
      return null;
    }
  },

  /**
   * Fetch user details from backend
   * @param token Authentication token
   * @returns User details with updated subscription information
   */
  fetchUserDetails: async (token: string | null) => {
    try {
      console.log('Fetching user details from:', `${RHAPSODYLANGUAGES_API}/users`);
      console.log('Token present:', !!token);

      const response = await fetch(`${RHAPSODYLANGUAGES_API}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      console.log('User Details Response Status:', response.status, response.statusText);

      // Read the response body once and handle both success and error cases
      let jsonData;
      try {
        jsonData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse user details response as JSON:', parseError);
        throw new Error('Invalid JSON response from user details service');
      }

      console.log('User Details Parsed Response:', jsonData);

      if (!response.ok) {
        console.error('User Details Error Response:', jsonData);
        
        const errorMessage = jsonData?.message?.text || 
                            jsonData?.message || 
                            jsonData?.error || 
                            `HTTP ${response.status}: ${response.statusText}`;
        
        throw new Error(errorMessage);
      }
      
      // Handle different response structures
      if (jsonData.success && jsonData.data) {
        return jsonData.data;
      } else if (jsonData.data) {
        return jsonData.data;
      } else {
        return jsonData;
      }
    } catch (error: any) {
      console.error('Fetch User Details Error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      
      // Provide more specific error messages
      if (error.message === 'Network request failed') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      
      throw error;
    }
  },

  /**
   * Fetch language file (PDF or audio) from backend
   * @param data Object containing user_id, type, language
   * @returns File name string
   */
  fetchLanguageFile: async (data: { user_id: string; type: 'read' | 'listen'; language: string }) => {
    try {

      // Get current month (1-12)
      const currentMonth = allMonths[new Date().getMonth()]

      console.log('Fetching language file with params:', { ...data, month: currentMonth });
      console.log('API URL:', `${RHAPSODYLANGUAGES_API}/readRhapsodyDatabase`);

      const formData = new FormData();
      formData.append('user_id', data.user_id);
      formData.append('type', data.type);
      formData.append('language', data.language);
      formData.append('month', currentMonth);

      const response = await fetch(`${RHAPSODYLANGUAGES_API}/readRhapsodyDatabase`, {
        method: 'POST',
        body: formData,
      });

      console.log('Language File Response Status:', response.status, response.statusText);

      // Read the response body once and handle both success and error cases
      let jsonData;
      try {
        jsonData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse language file response as JSON:', parseError);
        throw new Error('Invalid JSON response from language file service');
      }

      console.log('Language File Parsed Response:', jsonData);

      if (!response.ok) {
        console.error('Language File Error Response:', jsonData);
        
        const errorMessage = jsonData?.message?.text || 
                            jsonData?.message || 
                            jsonData?.error || 
                            `HTTP ${response.status}: ${response.statusText}`;
        
        throw new Error(errorMessage);
      }
      
      // Return the file name from response.data
      if (jsonData.success && jsonData.data) {
        return jsonData.data;
      } else if (jsonData.data) {
        return jsonData.data;
      } else {
        throw new Error('No file name in response');
      }
    } catch (error: any) {
      console.error('Fetch Language File Error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      
      // Provide more specific error messages
      if (error.message === 'Network request failed') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      
      throw error;
    }
  },


};