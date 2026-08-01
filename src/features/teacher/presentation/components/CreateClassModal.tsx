import { useState, useRef, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { classesApi } from '../../infrastructure/classesApi'
import { ApiError } from '../../../../shared/lib/httpClient'

type CreateClassModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateClassModal({ isOpen, onClose, onSuccess }: CreateClassModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('')
      setDescription('')
      setPosterFile(null)
      setPosterPreview(null)
    }
  }, [isOpen])

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (posterPreview) {
        URL.revokeObjectURL(posterPreview)
      }
    }
  }, [posterPreview])

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Allow only images
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WEBP)')
        return
      }
      
      // Limit size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB')
        return
      }

      setPosterFile(file)
      // Create preview URL
      const objectUrl = URL.createObjectURL(file)
      if (posterPreview) {
        URL.revokeObjectURL(posterPreview)
      }
      setPosterPreview(objectUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('Tên lớp không được để trống')
      return
    }

    try {
      setIsSubmitting(true)
      
      // Construct FormData
      const formData = new FormData()
      formData.append('name', name)
      if (description) {
        formData.append('description', description)
      }
      if (posterFile) {
        formData.append('poster', posterFile)
      }

      // Call API
      const result = await classesApi.createClass(formData)
      
      toast.success(result.message || 'Tạo lớp học thành công!')
      onSuccess() // Refresh list & close modal
      onClose()
      
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Lỗi không xác định khi tạo lớp học'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="teacher-modal-overlay" onClick={onClose}>
      <div className="teacher-modal" onClick={(e) => e.stopPropagation()}>
        <div className="teacher-modal__header">
          <h2>Tạo Lớp Học Mới</h2>
          <button className="teacher-modal__close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="teacher-modal__body">
          <div className="teacher-modal__form-group">
            <label htmlFor="className">Tên lớp học <span className="text-error">*</span></label>
            <input
              id="className"
              type="text"
              placeholder="Nhập tên lớp học (VD: Toán nâng cao lớp 10)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="teacher-modal__form-group">
            <label htmlFor="classDesc">Mô tả chi tiết</label>
            <textarea
              id="classDesc"
              placeholder="Nhập mô tả về lớp học của bạn..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="teacher-modal__form-group">
            <label>Ảnh đại diện lớp (Poster)</label>
            
            <input 
              type="file" 
              accept="image/jpeg, image/png, image/webp"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
            
            {!posterPreview ? (
              <div 
                className="teacher-modal__upload-area" 
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="material-symbols-outlined teacher-modal__upload-icon">add_photo_alternate</span>
                <p>Nhấp để tải lên hình ảnh (Tối đa 5MB)</p>
                <span className="teacher-modal__upload-hint">Định dạng hỗ trợ: JPG, PNG, WEBP</span>
              </div>
            ) : (
              <div className="teacher-modal__preview-container">
                <img src={posterPreview} alt="Preview" className="teacher-modal__preview-image" />
                <button 
                  type="button" 
                  className="teacher-modal__preview-change"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  <span className="material-symbols-outlined">edit</span>
                  Đổi ảnh
                </button>
              </div>
            )}
          </div>

          <div className="teacher-modal__footer">
            <button 
              type="button" 
              className="teacher-btn-secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="teacher-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Tạo lớp học'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
