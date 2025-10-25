// Check if RHAPSODYLANGUAGES_API is available from env
const RHAPSODYLANGUAGES_API = process.env.EXPO_PUBLIC_API_BASE_URL;
const RHAPSODYLANGUAGES_URL = process.env.EXPO_PUBLIC_BASE_URL;

const allMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export type MediaType = 'read' | 'listen' | 'watch';

export interface FetchMediaParams {
    user_id: string;
    type: MediaType;
    language: string;
    month?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
}

export class MediaAPI {
    /**
     * Fetch daily media file name from backend
     * This method automatically calculates current day and returns the appropriate daily file
     * @param params - Object containing user_id, type, language, and optional month
     * @returns Promise<string> - The filename for today's media
     */
    static async fetchDailyMediaFile(params: FetchMediaParams): Promise<string> {
        try {
            // Calculate current month if not provided
            const currentMonth = params.month || allMonths[new Date().getMonth()];

            console.log('Fetching daily media file with params:', { ...params, month: currentMonth });
            console.log('API URL:', `${RHAPSODYLANGUAGES_API}/listenRhapsody`);

            const formData = new FormData();
            formData.append('user_id', params.user_id);
            formData.append('type', params.type);
            formData.append('language', params.language);
            formData.append('month', currentMonth);

            const response = await fetch(`${RHAPSODYLANGUAGES_API}/listenRhapsody`, {
                method: 'POST',
                body: formData,
            });

            console.log('Media File Response Status:', response.status, response.statusText);

            // Read the response body once and handle both success and error cases
            let jsonData: ApiResponse<string>;
            try {
                jsonData = await response.json();
            } catch (parseError) {
                console.error('Failed to parse media file response as JSON:', parseError);
                throw new Error('Invalid JSON response from media file service');
            }

            console.log('Media File Parsed Response:', jsonData);

            if (!response.ok) {
                console.error('Media File Error Response:', jsonData);
                
                const errorMessage = jsonData?.message || 
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
            console.error('Fetch Daily Media File Error:', {
                message: error.message,
                name: error.name,
                type: params.type,
                language: params.language,
            });
            
            // Provide more specific error messages
            if (error.message === 'Network request failed') {
                throw new Error('Unable to connect to the server. Please check your internet connection.');
            }
            
            throw error;
        }
    }

    /**
     * Generate remote media URL based on type and filename
     * @param type - Media type (read, listen, watch)
     * @param filename - The filename returned from fetchDailyMediaFile
     * @returns string - Complete URL to the remote media file
     */
    static generateRemoteMediaUrl(type: MediaType, filename: string): string {
        switch (type) {
            case 'read':
                return `${RHAPSODYLANGUAGES_URL}/read/${filename}`;
            case 'listen':
                return `${RHAPSODYLANGUAGES_URL}/listen/${filename}`;
            case 'watch':
                return `${RHAPSODYLANGUAGES_URL}/watch/${filename}`;
            default:
                throw new Error(`Unsupported media type: ${type}`);
        }
    }

    /**
     * Convenience method to fetch daily audio file
     * @param user_id - User ID
     * @param language - Language code
     * @returns Promise<{filename: string, url: string}> - Audio filename and URL
     */
    static async fetchDailyAudio(user_id: string, language: string): Promise<{filename: string, url: string}> {
        const filename = await this.fetchDailyMediaFile({
            user_id,
            type: 'listen',
            language,
        });
        
        const url = this.generateRemoteMediaUrl('listen', filename);
        
        return { filename, url };
    }

    /**
     * Convenience method to fetch daily video file
     * @param user_id - User ID
     * @param language - Language code
     * @returns Promise<{filename: string, url: string}> - Video filename and URL
     */
    static async fetchDailyVideo(user_id: string, language: string): Promise<{filename: string, url: string}> {
        const filename = await this.fetchDailyMediaFile({
            user_id,
            type: 'watch',
            language,
        });
        
        const url = this.generateRemoteMediaUrl('watch', filename);
        
        return { filename, url };
    }

    /**
     * Convenience method to fetch daily PDF file
     * @param user_id - User ID
     * @param language - Language code
     * @returns Promise<{filename: string, url: string}> - PDF filename and URL
     */
    static async fetchDailyPdf(user_id: string, language: string): Promise<{filename: string, url: string}> {
        const filename = await this.fetchDailyMediaFile({
            user_id,
            type: 'read',
            language,
        });
        
        const url = this.generateRemoteMediaUrl('read', filename);
        
        return { filename, url };
    }
    /**
     * Fetch a file from the backend as a blob
     * @param filePath - The path to the file on the server
     * @param userId - The user ID for authentication
     * @returns Promise<Blob> - The file as a blob
     */
    static async fetchFileAsBlob(filePath: string, userId: string): Promise<Blob> {
        try {
            const response = await fetch(`${RHAPSODYLANGUAGES_API}/media/file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    file_path: filePath,
                    user_id: userId,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            return blob;
        } catch (error) {
            console.error('Error fetching file as blob:', error);
            throw error;
        }
    }

    /**
     * Fetch a PDF file and convert it to a data URI for display
     * @param filePath - The path to the PDF file on the server
     * @param userId - The user ID for authentication
     * @returns Promise<string> - The PDF as a data URI
     */
    static async fetchPdfAsDataUri(filePath: string, userId: string): Promise<string> {
        try {
            const blob = await this.fetchFileAsBlob(filePath, userId);
            
            // Convert blob to data URI
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        resolve(reader.result);
                    } else {
                        reject(new Error('Failed to convert blob to data URI'));
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error fetching PDF as data URI:', error);
            throw error;
        }
    }

    /**
     * Download a file and save it to local storage
     * @param filePath - The path to the file on the server
     * @param userId - The user ID for authentication
     * @param localFileName - The name to save the file as locally
     * @returns Promise<string> - The local file URI
     */
    static async downloadFile(
        filePath: string, 
        userId: string, 
        localFileName: string
    ): Promise<string> {
        try {
            const blob = await this.fetchFileAsBlob(filePath, userId);
            
            // In React Native, we would use FileSystem from expo-file-system
            // For now, this is a placeholder that returns the blob URL
            const blobUrl = URL.createObjectURL(blob);
            return blobUrl;
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    }

    /**
     * Get file metadata from the backend
     * @param filePath - The path to the file on the server
     * @param userId - The user ID for authentication
     * @returns Promise<any> - File metadata (size, type, etc.)
     */
    static async getFileMetadata(filePath: string, userId: string): Promise<any> {
        try {
            const response = await fetch(`${RHAPSODYLANGUAGES_API}/media/metadata`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    file_path: filePath,
                    user_id: userId,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const metadata = await response.json();
            return metadata;
        } catch (error) {
            console.error('Error fetching file metadata:', error);
            throw error;
        }
    }
}
