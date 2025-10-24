import { RHAPSODYLANGUAGES_API_URL } from '@/constants/api';

export class MediaAPI {
    /**
     * Fetch a file from the backend as a blob
     * @param filePath - The path to the file on the server
     * @param userId - The user ID for authentication
     * @returns Promise<Blob> - The file as a blob
     */
    static async fetchFileAsBlob(filePath: string, userId: string): Promise<Blob> {
        try {
            const response = await fetch(`${RHAPSODYLANGUAGES_API_URL}/media/file`, {
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
            const response = await fetch(`${RHAPSODYLANGUAGES_API_URL}/media/metadata`, {
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
