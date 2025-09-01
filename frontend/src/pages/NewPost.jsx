import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePostMutation, useGetCategoriesQuery } from '../features/posts/postsApi';

function NewPost() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    imageUrl: ''
  });
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const [createPost, { isLoading }] = useCreatePostMutation();
  const { data: categoriesData } = useGetCategoriesQuery();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear field error when user types
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Başlık gereklidir';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Başlık en az 5 karakter olmalıdır';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Başlık 200 karakterden az olmalıdır';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'İçerik gereklidir';
    } else if (formData.content.length < 20) {
      newErrors.content = 'İçerik en az 20 karakter olmalıdır';
    } else if (formData.content.length > 5000) {
      newErrors.content = 'İçerik 5000 karakterden az olmalıdır';
    }
    
    if (!formData.category) {
      newErrors.category = 'Lütfen bir kategori seçin';
    }
    
    // Validate image URL if provided
    if (formData.imageUrl.trim() && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Lütfen geçerli bir URL girin';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await createPost(formData).unwrap();
        if (window.showToast) {
          window.showToast({
            message: 'Yazı başarıyla oluşturuldu!',
            type: 'success',
            duration: 3000
          });
        }
        navigate('/');
      } catch (error) {
        if (window.showToast) {
          window.showToast({
            message: error.data?.error || 'Yazı oluşturulamadı',
            type: 'error',
            duration: 5000
          });
        }
      }
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 soft-bg">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-4">
            Yeni Yazı
          </h1>
          <p className="text-slate-600 text-lg">
            Düşüncelerinizi paylaşın ve savaşa katılın!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-accent-success mb-2">
              Başlık *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className={`input ${errors.title ? 'border-red-400 ring-red-400' : ''}`}
              placeholder="Yazı başlığını girin"
              maxLength={200}
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-2">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-accent-success mb-2">
              İçerik *
            </label>
            <textarea
              id="content"
              name="content"
              required
              value={formData.content}
              onChange={handleChange}
              className={`input min-h-[200px] resize-y ${errors.content ? 'border-red-400 ring-red-400' : ''}`}
              placeholder="Yazınızın içeriğini yazın..."
              maxLength={5000}
            />
            {errors.content && (
              <p className="text-red-400 text-sm mt-2">{errors.content}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-accent-success mb-2">
              Kategori *
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className={`input ${errors.category ? 'border-red-400 ring-red-400' : ''}`}
            >
              <option value="">Kategori seçin</option>
              <option value="Technology">Teknoloji</option>
              <option value="Travel">Seyahat</option>
              <option value="Food">Yemek</option>
              <option value="Lifestyle">Yaşam Tarzı</option>
              <option value="Sports">Spor</option>
              <option value="Entertainment">Eğlence</option>
              <option value="Business">İş</option>
              <option value="Health">Sağlık</option>
              <option value="Education">Eğitim</option>
              <option value="Other">Diğer</option>
            </select>
            {errors.category && (
              <p className="text-red-400 text-sm mt-2">{errors.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-accent-success mb-2">
              Resim URL'si (isteğe bağlı)
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={handleChange}
              className={`input ${errors.imageUrl ? 'border-red-400 ring-red-400' : ''}`}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-sm text-slate-400 mt-1">
              Yazınızı temsil eden bir resmin URL'sini girin
            </p>
            {errors.imageUrl && (
              <p className="text-red-400 text-sm mt-2">{errors.imageUrl}</p>
            )}
          </div>

          {formData.imageUrl && (
            <div>
              <label className="block text-sm font-medium text-accent-success mb-2">
                Resim Önizleme
              </label>
              <img
                src={formData.imageUrl}
                alt="Önizleme"
                className="w-full h-48 object-cover rounded-lg border-2 border-accent-success/30"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-success"
            >
              {isLoading ? 'Oluşturuluyor...' : 'Yayınla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewPost;
