import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { ApiError } from '../../../shared/lib/httpClient'
import { uploadVocabularyAudio } from './vocabularyUseCases'

export function useVocabularyAudioUpload() {
  const [isUploading, setIsUploading] = useState(false)

  const uploadAudio = async (file: File): Promise<string | null> => {
    setIsUploading(true)
    try {
      const response = await uploadVocabularyAudio(file)
      toast.success(response.message)
      return response.url
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Không thể upload audio'
      toast.error(message)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return { uploadAudio, isUploading }
}
