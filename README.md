# Blog Battle - Monorepo

Blog yazılarını turnuva tarzında eşleştirip gerçek zamanlı oylama yapabileceğiniz bir platform.

## 🚀 Özellikler

- **Kimlik Doğrulama**: JWT cookie tabanlı kayıt, giriş ve çıkış
- **Blog Yazıları**: Kategori ve resimlerle blog yazıları oluşturma
- **Turnuvalar**: 4 yazıdan yarı final eşleşmeleri oluşturma
- **Gerçek Zamanlı Oylama**: Socket.IO ile canlı yüzde güncellemeleri
- **Otomatik Final**: İki yarı final kapandığında otomatik final eşleşmesi
- **Sonuçlar**: Tamamlanan eşleşmeleri ve kazananları görme
- **Admin Paneli**: Manuel eşleşme oluşturma ve oy yönetimi

## 🛠️ Teknoloji Stack'i

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

## 📁 Proje Yapısı

```
blogbattle/
├── backend/
│   ├── src/
│   │   ├── server.js          # Ana sunucu dosyası
│   │   ├── db.js             # Veritabanı bağlantısı
│   │   ├── config.js         # Ortam konfigürasyonu
│   │   ├── middleware/
│   │   │   ├── auth.js       # JWT kimlik doğrulama
│   │   │   └── admin.js      # Admin yetki kontrolü
│   │   ├── models/
│   │   │   ├── User.js       # Kullanıcı modeli
│   │   │   ├── Post.js       # Yazı modeli
│   │   │   ├── Match.js      # Eşleşme modeli
│   │   │   └── Vote.js       # Oy modeli
│   │   ├── routes/
│   │   │   ├── auth.routes.js    # Kimlik doğrulama rotaları
│   │   │   ├── post.routes.js    # Yazı rotaları
│   │   │   └── match.routes.js   # Eşleşme rotaları
│   │   └── utils/
│   │       ├── bracket.js        # Turnuva yönetimi
│   │       └── pickNextMatch.js  # Eşleşme seçimi
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── store.js      # Redux store
│   │   │   └── api.js        # API konfigürasyonu
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   └── authSlice.js
│   │   │   ├── posts/
│   │   │   │   └── postsApi.js
│   │   │   └── match/
│   │   │       └── matchApi.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── VotePair.jsx
│   │   │   └── WinnerBadge.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── NewPost.jsx
│   │   │   ├── Vote.jsx
│   │   │   ├── Results.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── .env
└── README.md
```

## 🚀 Kurulum Talimatları

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

MongoDB'nin sisteminizde çalıştığından emin olun:

#### Windows için:
```bash
# MongoDB servisini başlatın
net start MongoDB

# Veya MongoDB Compass kullanın
```

#### macOS/Linux için:
```bash
# MongoDB'yi başlatın
mongod

# Veya servis olarak
sudo systemctl start mongod
```

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

## 📡 API Endpoint'leri

### Kimlik Doğrulama
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Mevcut kullanıcı bilgisi
- `POST /api/auth/logout` - Kullanıcı çıkışı

### Yazılar
- `POST /api/posts` - Yeni yazı oluştur
- `GET /api/posts` - Tüm yazıları getir
- `GET /api/posts/:id` - ID'ye göre yazı getir
- `DELETE /api/posts/:id` - Yazıyı sil

### Eşleşmeler
- `POST /api/matches/seed` - 4 yazıdan yarı final oluştur
- `GET /api/matches/next` - Sonraki mevcut eşleşmeyi getir
- `POST /api/matches/:id/vote` - Eşleşmede oy ver
- `GET /api/matches/active/:bracketId` - Aktif eşleşmeleri getir
- `GET /api/matches/completed/:bracketId` - Tamamlanan eşleşmeleri getir

### Admin Endpoint'leri
- `POST /api/matches/admin/create` - Manuel eşleşme oluştur
- `GET /api/matches/admin/brackets` - Tüm turnuvaları getir
- `POST /api/matches/admin/reset-votes/:matchId` - Eşleşme oylarını sıfırla
- `DELETE /api/matches/admin/match/:matchId` - Eşleşmeyi sil

## 🔌 Socket.IO Olayları

### İstemci → Sunucu
- `join-user` - Kullanıcı odasına katıl
- `join-bracket` - Turnuva odasına katıl

### Sunucu → İstemci
- `match:update` - Gerçek zamanlı oy güncellemeleri
- `match:closed` - Eşleşme kapanış bildirimi
- `final:created` - Final eşleşmesi oluşturuldu bildirimi
- `bracket:created` - Yeni turnuva oluşturuldu bildirimi

## 📱 Kullanım Akışı

1. **Kayıt/Giriş**: Hesap oluşturun veya giriş yapın
2. **Yazı Oluştur**: Başlık, içerik, kategori ve resimlerle blog yazıları ekleyin
3. **Turnuva Başlat**: Ana sayfada 4 yazı seçerek yarı final eşleşmeleri oluşturun
4. **Oyla**: Oyla sayfasına giderek aktif eşleşmelere katılın
5. **Gerçek Zamanlı Güncellemeler**: Canlı oy yüzdelerini ve eşleşme kapanışlarını görün
6. **Sonuçları Gör**: Sonuçlar sayfasında tamamlanan eşleşmeleri ve kazananları kontrol edin

## 🔑 Temel Özellikler

- **Kullanıcı Başına Tek Oy**: Kullanıcılar her eşleşmede sadece bir kez oy verebilir
- **Oy Limiti**: Eşleşmeler oy limitine ulaştığında otomatik olarak kapanır (varsayılan: 10)
- **Otomatik Final**: İki yarı final kapandığında otomatik olarak final eşleşmesi oluşturulur
- **Gerçek Zamanlı Güncellemeler**: Oy yüzdeleri Socket.IO ile canlı güncellenir
- **Responsive Tasarım**: Masaüstü ve mobil cihazlarda çalışır
- **Admin Paneli**: Manuel eşleşme oluşturma ve oy yönetimi

## 🛠️ Geliştirme

### Backend Geliştirme
```bash
cd backend
npm run dev  # nodemon ile otomatik yeniden başlatma
```

### Frontend Geliştirme
```bash
cd frontend
npm run dev  # Vite dev server ile hot reload
```

### Production Build
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
```

## 🚨 Sorun Giderme

### Yaygın Sorunlar

1. **MongoDB Bağlantı Hatası**
   - MongoDB'nin çalıştığından emin olun
   - Backend/.env'deki MONGO_URI'yi kontrol edin

2. **CORS Hataları**
   - Backend/.env'deki CLIENT_ORIGIN'in frontend URL'i ile eşleştiğini doğrulayın
   - İsteklerde credentials'ların dahil edildiğini kontrol edin

3. **Socket.IO Bağlantı Sorunları**
   - Backend'in doğru portta çalıştığından emin olun
   - Frontend/.env'deki VITE_API_BASE'i kontrol edin

4. **Kimlik Doğrulama Sorunları**
   - Tarayıcı çerezlerini temizleyin
   - Backend/.env'deki JWT_SECRET'i kontrol edin
   - httpOnly çerezlerin etkin olduğundan emin olun

### Loglar
- Backend logları terminalde görüntülenir
- Frontend logları tarayıcı konsolunda mevcuttur
- Socket.IO olayları debug için loglanır

## 📋 Kurulum Kontrol Listesi

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

## 🎯 Test Senaryoları

1. **Kullanıcı Kaydı**: Yeni hesap oluşturun
2. **Blog Yazısı**: Kategori ve resimle yazı ekleyin
3. **Turnuva Oluştur**: 4 yazıdan turnuva başlatın
4. **Oylama**: Aktif eşleşmede oy verin
5. **Gerçek Zamanlı**: Oy yüzdelerinin canlı güncellendiğini görün
6. **Admin Panel**: Admin olarak giriş yapın ve eşleşme yönetin

## 📄 Lisans

Bu proje açık kaynak kodludur ve MIT Lisansı altında mevcuttur.

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

**Blog Battle ile eğlenceli turnuvalar düzenleyin!** 🏆⚔️
