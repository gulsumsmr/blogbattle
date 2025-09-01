# Blog Battle - Monorepo

Blog yazılarını turnuva tarzında eşleştirip gerçek zamanlı oylama yapabileceğiniz bir platform.

## Özellikler

- **Kimlik Doğrulama**: JWT cookie tabanlı kayıt, giriş ve çıkış
- **Blog Yazıları**: Kategori ve resimlerle blog yazıları oluşturma
- **Turnuvalar**: 4 yazıdan yarı final eşleşmeleri oluşturma
- **Gerçek Zamanlı Oylama**: Socket.IO ile canlı yüzde güncellemeleri
- **Otomatik Final**: İki yarı final kapandığında otomatik final eşleşmesi
- **Sonuçlar**: Tamamlanan eşleşmeleri ve kazananları görme
- **Admin Paneli**: Manuel eşleşme oluşturma ve oy yönetimi

## Teknoloji Stack'i

### Backend
- **Node.js** + Express
- **MongoDB** + Mongoose
- **JWT** kimlik doğrulama (httpOnly cookie)
- **Socket.IO** gerçek zamanlı güncellemeler için
- **bcryptjs** şifre hashleme

### Frontend
- **React** + Vite
- **Redux Toolkit** + RTK Query
- **TailwindCSS** stil için
- **Socket.IO Client** gerçek zamanlı güncellemeler için
- **React Router** navigasyon için

## Kurulum Talimatları

### Gereksinimler
- **Node.js** (v16 veya üzeri)
- **MongoDB** (yerel veya bulut)
- **npm** veya **yarn**

### 1. Projeyi Klonlayın ve Bağımlılıkları Yükleyin

```bash
# Projeyi klonlayın
git clone <repository-url>
cd blogbattle

# Backend bağımlılıklarını yükleyin
cd backend
npm install

# Frontend bağımlılıklarını yükleyin
cd ../frontend
npm install
```

### 2. Ortam Konfigürasyonu

#### Backend (.env)
```bash
cd backend
# .env dosyası oluşturun
```

`backend/.env` dosyasını düzenleyin:
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/blog_battle
JWT_SECRET=your-super-secret-key-change-this
CLIENT_ORIGIN=http://localhost:5173
VOTE_LIMIT=10
```

#### Frontend (.env)
```bash
cd frontend
# .env dosyası oluşturun
```

`frontend/.env` dosyasını düzenleyin:
```env
VITE_API_BASE=http://localhost:4000
```

### 3. MongoDB'yi Başlatın

MongoDB'nin sisteminizde çalıştığından emin olun.

### 4. Uygulamayı Çalıştırın

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Uygulama şu adreslerde erişilebilir olacak:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

## Kullanım Akışı

1. **Kayıt/Giriş**: Hesap oluşturun veya giriş yapın
2. **Yazı Oluştur**: Başlık, içerik, kategori ve resimlerle blog yazıları ekleyin
3. **Turnuva Başlat**: Ana sayfada 4 yazı seçerek yarı final eşleşmeleri oluşturun
4. **Oyla**: Oyla sayfasına giderek aktif eşleşmelere katılın
5. **Gerçek Zamanlı Güncellemeler**: Canlı oy yüzdelerini ve eşleşme kapanışlarını görün
6. **Sonuçları Gör**: Sonuçlar sayfasında tamamlanan eşleşmeleri ve kazananları kontrol edin

## Temel Özellikler

- **Kullanıcı Başına Tek Oy**: Kullanıcılar her eşleşmede sadece bir kez oy verebilir
- **Oy Limiti**: Eşleşmeler oy limitine ulaştığında otomatik olarak kapanır (varsayılan: 10)
- **Otomatik Final**: İki yarı final kapandığında otomatik olarak final eşleşmesi oluşturulur
- **Gerçek Zamanlı Güncellemeler**: Oy yüzdeleri Socket.IO ile canlı güncellenir
- **Responsive Tasarım**: Masaüstü ve mobil cihazlarda çalışır
- **Admin Paneli**: Manuel eşleşme oluşturma ve oy yönetimi


##  Kurulum Kontrol Listesi

- [ ] Node.js yüklendi (v16+)
- [ ] MongoDB çalışıyor
- [ ] Proje klonlandı
- [ ] Backend bağımlılıkları yüklendi (`npm install`)
- [ ] Frontend bağımlılıkları yüklendi (`npm install`)
- [ ] Backend .env dosyası oluşturuldu
- [ ] Frontend .env dosyası oluşturuldu
- [ ] Backend çalışıyor (`npm run dev`)
- [ ] Frontend çalışıyor (`npm run dev`)
- [ ] http://localhost:5173 açılıyor
- [ ] http://localhost:4000 API erişilebilir

## Proje Görselleri
<img width="1912" height="909" alt="image" src="https://github.com/user-attachments/assets/f1b3909a-c248-43e9-9a99-56c03fa3ee64" />
<img width="1915" height="898" alt="image" src="https://github.com/user-attachments/assets/01f0884f-f55f-4092-8302-56298c25e4f8" />
<img width="1907" height="893" alt="image" src="https://github.com/user-attachments/assets/82459ce9-9e7d-458b-b2e2-a5a9972fcdac" />
<img width="1912" height="903" alt="image" src="https://github.com/user-attachments/assets/ac04cea8-d003-4e2d-b229-f38d61143f1d" />
<img width="1912" height="901" alt="image" src="https://github.com/user-attachments/assets/580238b9-dbb1-4209-b353-db954f5f8d84" />
<img width="1905" height="880" alt="image" src="https://github.com/user-attachments/assets/14751d38-4ec5-49ea-a0cf-625a8f478b62" />
<img width="1919" height="897" alt="image" src="https://github.com/user-attachments/assets/28b73b87-addc-4d88-895a-c1401b150ea5" />
<img width="1915" height="907" alt="image" src="https://github.com/user-attachments/assets/4f802e6a-57a9-458b-a083-9ff41c84ba5f" />
<img width="1906" height="895" alt="image" src="https://github.com/user-attachments/assets/b4fc0ad9-8dd7-4c41-b7ec-7477ecbef408" />










