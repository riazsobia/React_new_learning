import { useCallback } from 'react';

export const useDownloadAttachment = () => {
    const downloadAttachment = useCallback((url, filename) => {
      fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          link.click();
          URL.revokeObjectURL(link.href);
        })
        .catch((error) => {
          console.error('Error downloading attachment:', error);
        });
    }, []);
  
    return downloadAttachment;
  };

export const CATEGORIES_DICT = {
    0: 'Backend',
    1: 'Frontend',
    2: 'Database',
    3: 'Python',
    4: 'Javascript',
};