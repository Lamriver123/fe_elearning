import { httpClient } from '../../../shared/lib/httpClient';

export const aiApi = {
  generateVocabularyExcel(words: string[]): Promise<Blob> {
    return httpClient.post('/ai/generate-vocabulary-excel', { words }, {
      responseType: 'blob',
    }) as Promise<Blob>;
  },
};
