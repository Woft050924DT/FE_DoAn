import apiClient from './apiClient';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface MediaFile {
  filename: string;
  url: string;
}

export const mediaService = {
  resolveUrl(pathOrUrl: string): string {
    if (!pathOrUrl) return '';
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
      return pathOrUrl;
    }
    if (pathOrUrl.startsWith('/')) {
      return `${API_BASE}${pathOrUrl}`;
    }
    return pathOrUrl;
  },

  async listFiles(): Promise<MediaFile[]> {
    const response = await apiClient.get<{ files: MediaFile[] }>('/api/media/files');
    return response.data.files.map((f) => ({
      ...f,
      url: mediaService.resolveUrl(f.url),
    }));
  },
};
