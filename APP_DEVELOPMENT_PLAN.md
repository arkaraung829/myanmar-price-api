# Myanmar Price Pro - Complete Mobile App Development Plan

## App Overview

**App Name:** Myanmar Price Pro (မြန်မာဈေးနှုန်း)
**Tagline:** Real-time Gold, Currency & Fuel Prices
**Target Users:** 5+ Million Myanmar users
**Platforms:** iOS & Android

---

## Phase 1: Core Features (MVP)

### 1.1 Screens & Features

| Screen | Features |
|--------|----------|
| **Splash Screen** | App logo, loading animation |
| **Home Dashboard** | Quick view of all prices |
| **Currency Exchange** | Official + Market rates, converter |
| **Gold Prices** | 16 Pae, 15 Pae, World price |
| **Fuel Prices** | By brand, by location |
| **Settings** | Language, notifications, theme |

### 1.2 Must-Have Features

- [ ] Real-time price updates
- [ ] Price change indicators (↑↓)
- [ ] Currency converter calculator
- [ ] Price history charts (7 days, 30 days)
- [ ] Favorite currencies
- [ ] Push notifications for price alerts
- [ ] Offline mode (cached data)
- [ ] Myanmar + English language
- [ ] Dark/Light theme

---

## Phase 2: Advanced Features

### 2.1 Premium Features

- [ ] Price alerts (notify when USD > 4000)
- [ ] Historical data (90 days, 1 year)
- [ ] Export data (PDF, Excel)
- [ ] Widgets (iOS/Android home screen)
- [ ] Apple Watch / WearOS support
- [ ] Ad-free experience

### 2.2 Social Features

- [ ] Share prices to social media
- [ ] Price comparison between days
- [ ] News feed (market news)
- [ ] Community predictions

---

## Phase 3: Monetization

| Method | Implementation |
|--------|----------------|
| **Ads** | Banner ads, Interstitial (between screens) |
| **Premium** | $0.99/month for ad-free + alerts |
| **API Access** | Sell API access to businesses |

---

## Technical Architecture

### Frontend (Mobile App)

```
Framework: Flutter (iOS + Android from single codebase)
State Management: Riverpod or BLoC
Local Storage: Hive or SQLite
Charts: fl_chart
Notifications: Firebase Cloud Messaging
```

### Backend (Already Built!)

```
API: Cloudflare Workers (mm-price-api.mmpriceapi.workers.dev)
Data Sources: CBM + MarketPricePro
Caching: 10 minutes
```

---

## Design System

### Colors

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Primary | #2563EB (Blue) | #3B82F6 |
| Success | #16A34A (Green) | #22C55E |
| Danger | #DC2626 (Red) | #EF4444 |
| Background | #FFFFFF | #1F2937 |
| Text | #1F2937 | #F9FAFB |

### Typography

| Element | Font | Size |
|---------|------|------|
| Title | Pyidaungsu (Myanmar) | 24sp |
| Price | SF Pro / Roboto | 32sp Bold |
| Body | System Default | 16sp |

---

## App Screens Wireframes

### Home Dashboard
```
┌─────────────────────────────────┐
│  🇲🇲 Myanmar Price Pro     ⚙️  │
├─────────────────────────────────┤
│  Last Updated: 2:30 PM          │
├─────────────────────────────────┤
│  ┌─────────────────────────────┐│
│  │ 💵 USD/MMK                  ││
│  │ Buy: 3,920  Sell: 4,020     ││
│  │ ▲ +20 (0.5%)                ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ 🥇 Gold (16 Pae)            ││
│  │ 6,900,000 MMK               ││
│  │ ▼ -50,000 (0.7%)            ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ ⛽ Octane 92                 ││
│  │ 2,525 MMK/L                 ││
│  │ ─ No change                 ││
│  └─────────────────────────────┘│
├─────────────────────────────────┤
│  🏠    💱    🥇    ⛽    ⚙️    │
└─────────────────────────────────┘
```

---

# DEVELOPMENT PROMPTS

## Prompt 1: Project Setup

```
Create a new Flutter project for a Myanmar market prices app with the following structure:

Project name: myanmar_price_pro
Package name: com.mmprices.app

Setup:
1. Flutter 3.x with null safety
2. Riverpod for state management
3. Dio for API calls
4. Hive for local storage
5. fl_chart for price charts
6. Firebase for notifications
7. Easy Localization for Myanmar/English

Create the folder structure:
lib/
├── main.dart
├── app/
│   ├── app.dart
│   └── router.dart
├── core/
│   ├── constants/
│   ├── theme/
│   └── utils/
├── data/
│   ├── models/
│   ├── repositories/
│   └── services/
├── presentation/
│   ├── screens/
│   ├── widgets/
│   └── providers/
└── l10n/
    ├── en.json
    └── my.json
```

---

## Prompt 2: API Service

```
Create a PriceApiService class in Flutter that connects to my Cloudflare Worker API.

Base URL: https://mm-price-api.mmpriceapi.workers.dev

Endpoints:
- GET /currency - Market exchange rates
- GET /currency/official - CBM official rates
- GET /gold - Gold prices
- GET /fuel - Fuel prices
- GET /all - All prices combined

Requirements:
1. Use Dio for HTTP requests
2. Add error handling with custom exceptions
3. Add request caching (5 minutes)
4. Add retry logic (3 attempts)
5. Create data models for each response:
   - CurrencyRate (code, buy, sell, date, change)
   - GoldPrice (name, nameMm, price, date, change)
   - FuelPrice (name, price, date, brand)
6. Return typed responses using freezed/json_serializable
7. Add offline support - return cached data if no internet
```

---

## Prompt 3: Data Models

```
Create Dart data models using freezed and json_serializable for:

1. CurrencyRate
   - String code (USD, EUR, etc.)
   - String name (United States Dollar)
   - String nameMm (အမေရိကန် ဒေါ်လာ)
   - double buyRate
   - double sellRate
   - double change (difference from yesterday)
   - double changePercent
   - DateTime updatedAt
   - bool isFavorite

2. GoldPrice
   - String id
   - String name (16 Pae Gold)
   - String nameMm (၁၆ ပဲရည်)
   - double price
   - double change
   - double changePercent
   - String unit (per tical)
   - DateTime updatedAt

3. FuelPrice
   - String id
   - String name (Octane 92)
   - String brand (PTT, PUMA, etc.)
   - double price
   - String unit (per liter)
   - String location
   - DateTime updatedAt

4. PriceAlert
   - String id
   - String type (currency/gold/fuel)
   - String itemCode
   - String condition (above/below)
   - double targetPrice
   - bool isActive
   - DateTime createdAt

Include toJson, fromJson, and copyWith methods.
```

---

## Prompt 4: Theme & Design System

```
Create a complete Flutter theme system for Myanmar Price Pro app:

1. Colors:
   - Primary: Blue (#2563EB)
   - Success/Up: Green (#16A34A)
   - Danger/Down: Red (#DC2626)
   - Warning: Orange (#F59E0B)
   - Background Light: #F3F4F6
   - Background Dark: #111827
   - Card Light: #FFFFFF
   - Card Dark: #1F2937

2. Typography:
   - Use Pyidaungsu font for Myanmar text
   - Use SF Pro / Roboto for numbers
   - Headline: 24sp bold
   - Price Large: 32sp bold
   - Price Medium: 24sp semibold
   - Body: 16sp regular
   - Caption: 12sp

3. Components:
   - PriceCard widget with:
     - Icon, title, price
     - Change indicator (green up arrow / red down arrow)
     - Tap animation
   - Custom AppBar with gradient
   - Bottom Navigation with 5 tabs
   - Pull to refresh indicator
   - Skeleton loading placeholders

4. Create both light and dark themes
5. Support dynamic theme switching
6. Save theme preference to local storage
```

---

## Prompt 5: Home Dashboard Screen

```
Create the Home Dashboard screen for Myanmar Price Pro app:

Requirements:
1. App bar with:
   - App logo and name
   - Settings icon button
   - Last updated time

2. Pull-to-refresh functionality

3. Summary cards showing:
   - USD/MMK rate with change indicator
   - Gold price (16 Pae) with change
   - Fuel price (Octane 92) with change

4. Quick action buttons:
   - Currency Converter
   - Price Alerts
   - Share Prices

5. "View All" sections for:
   - Top Currencies (USD, EUR, SGD, THB, CNY)
   - Gold Prices
   - Fuel Prices

6. Bottom navigation bar:
   - Home (selected)
   - Currency
   - Gold
   - Fuel
   - Settings

7. State management:
   - Loading state with skeleton
   - Error state with retry button
   - Empty state
   - Success state with data

8. Auto-refresh every 5 minutes
9. Show cached data if offline with "Offline" indicator
```

---

## Prompt 6: Currency Exchange Screen

```
Create the Currency Exchange screen with these features:

1. Segmented control: "Market Rate" / "Official Rate"

2. Currency list showing:
   - Country flag icon
   - Currency code (USD)
   - Currency name (US Dollar / အမေရိကန် ဒေါ်လာ)
   - Buy rate
   - Sell rate
   - Change indicator with percentage
   - Favorite star button

3. Search bar to filter currencies

4. Sort options:
   - By name (A-Z)
   - By rate (High to Low)
   - By change (Most changed)
   - Favorites first

5. Currency detail bottom sheet:
   - Large price display
   - 7-day price chart
   - Buy/Sell spread
   - Historical high/low
   - "Set Alert" button
   - "Add to Favorites" button

6. Floating action button for Currency Converter

7. Pull-to-refresh

8. Persist favorites to local storage
```

---

## Prompt 7: Currency Converter

```
Create a Currency Converter screen/modal:

1. Two currency selectors:
   - From: MMK (default)
   - To: USD (default)

2. Amount input field:
   - Numeric keyboard
   - Thousand separators (1,000,000)
   - Clear button

3. Swap button to switch currencies

4. Real-time conversion as user types

5. Show both buy and sell rates:
   - "If you BUY: 1 USD = 4,020 MMK"
   - "If you SELL: 1 USD = 3,920 MMK"

6. Quick amount buttons:
   - 100, 500, 1000, 5000, 10000

7. Recent conversions history (last 10)

8. Share conversion result

9. Works offline using cached rates
```

---

## Prompt 8: Gold Prices Screen

```
Create the Gold Prices screen:

1. Header card showing:
   - Current 16 Pae gold price (large)
   - Change from yesterday
   - World gold price in USD/oz

2. Gold type tabs:
   - 16 Pae (ရွှေ ၁၆ပဲရည်)
   - 15 Pae (ရွှေ ၁၅ပဲရည်)
   - World Price

3. Price chart:
   - Line chart showing 7 days
   - Toggle: 7D / 30D / 90D / 1Y
   - Touch to see specific day's price

4. Price table:
   - Association price
   - Market price
   - Buy/Sell spread

5. Gold calculator:
   - Input weight (grams, tical, pae)
   - Show total value in MMK

6. Price history list:
   - Date
   - Price
   - Change indicator

7. Set price alert button
```

---

## Prompt 9: Fuel Prices Screen

```
Create the Fuel Prices screen:

1. Fuel type filter tabs:
   - All
   - Octane 92
   - Octane 95
   - Diesel
   - Premium Diesel

2. Brand filter dropdown:
   - All Brands
   - PTT
   - PUMA
   - Max Energy
   - etc.

3. Price cards showing:
   - Fuel type icon
   - Fuel name
   - Price per liter
   - Brand logo
   - Change indicator

4. Compare view:
   - Side by side brand comparison
   - Highlight cheapest option

5. Location-based prices (future):
   - Show prices by city/region

6. Price trend chart:
   - 30-day fuel price history

7. Fuel calculator:
   - Input liters needed
   - Show total cost
   - Compare across brands
```

---

## Prompt 10: Settings Screen

```
Create the Settings screen:

1. Appearance section:
   - Theme toggle (Light/Dark/System)
   - Language selector (English/Myanmar)

2. Notifications section:
   - Enable/disable push notifications
   - Price alert notifications
   - Daily summary notification toggle
   - Notification time picker

3. Data section:
   - Default currency (for converter)
   - Auto-refresh interval (1/5/15/30 min)
   - Clear cache button
   - Cache size display

4. Price Alerts:
   - List of active alerts
   - Add new alert
   - Edit/delete existing alerts

5. About section:
   - App version
   - Rate app button
   - Share app button
   - Privacy policy link
   - Terms of service link
   - Contact support

6. Account section (if implementing auth):
   - Sign in/Sign up
   - Sync across devices
   - Premium subscription status

7. Developer section (debug mode):
   - API endpoint
   - Last sync time
   - Error logs
```

---

## Prompt 11: Push Notifications

```
Implement push notifications using Firebase Cloud Messaging:

1. Setup:
   - Configure Firebase for iOS and Android
   - Request notification permissions
   - Handle foreground/background notifications

2. Notification types:
   - Price alerts (when price crosses threshold)
   - Daily summary (morning price update)
   - Breaking news (major price changes >5%)
   - App updates

3. Price alert logic:
   - Store alerts in local database
   - Check prices every 15 minutes (background)
   - Send local notification when condition met
   - Mark alert as triggered

4. Daily summary:
   - Schedule for 8:00 AM Myanmar time
   - Show: USD, Gold, Fuel prices
   - Change from yesterday

5. Notification UI:
   - Custom notification layout
   - Quick actions (view details, dismiss)
   - Deep link to relevant screen

6. Settings:
   - Enable/disable each notification type
   - Quiet hours setting
   - Notification sound selection
```

---

## Prompt 12: Widgets (Home Screen)

```
Create home screen widgets for iOS and Android:

iOS Widgets (WidgetKit):
1. Small widget (2x2):
   - Single price display (USD or Gold)
   - Price + change indicator
   - Tap to open app

2. Medium widget (4x2):
   - USD + Gold prices
   - Last updated time
   - Tap sections to go to detail

3. Large widget (4x4):
   - USD, EUR, THB, Gold, Fuel
   - Mini chart for USD
   - Refresh button

Android Widgets (Glance):
1. Small widget:
   - USD/MMK rate
   - Auto-updates every 30 min

2. Medium widget:
   - Top 3 currencies
   - Gold price
   - Configurable currencies

3. Large widget:
   - Full dashboard
   - Refresh button
   - Last updated time

Widget features:
- Background refresh
- Tap to open specific screen
- Configuration options
- Dark mode support
```

---

## Prompt 13: Offline Support

```
Implement comprehensive offline support:

1. Local database (Hive):
   - Cache all API responses
   - Store with timestamp
   - Max cache age: 24 hours

2. Offline indicator:
   - Show banner when offline
   - Display cached data age
   - "Last updated X hours ago"

3. Sync strategy:
   - On app open: fetch fresh data
   - Pull to refresh
   - Background refresh (every 15 min)
   - Retry failed requests

4. Offline features:
   - View cached prices
   - Currency converter (cached rates)
   - View favorites
   - View price history (cached)
   - Price alerts (check against cached)

5. Graceful degradation:
   - Show cached data with warning
   - Disable features requiring internet
   - Queue actions for when online

6. Connectivity monitoring:
   - Listen for network changes
   - Auto-refresh when back online
   - Show "Back online" toast
```

---

## Prompt 14: Analytics & Monitoring

```
Implement analytics and error monitoring:

1. Firebase Analytics events:
   - app_open
   - screen_view (with screen name)
   - currency_viewed (currency code)
   - conversion_made (from, to, amount)
   - alert_created (type, condition)
   - alert_triggered
   - share_price
   - theme_changed
   - language_changed

2. User properties:
   - preferred_language
   - theme_preference
   - favorite_currencies_count
   - alerts_count
   - is_premium

3. Firebase Crashlytics:
   - Automatic crash reporting
   - Non-fatal error logging
   - Custom keys for context
   - User ID for tracking

4. Performance monitoring:
   - API response times
   - Screen load times
   - Widget render times

5. Custom dashboard:
   - Daily active users
   - Most viewed currencies
   - Conversion patterns
   - Alert patterns
```

---

## Prompt 15: App Store Optimization

```
Create App Store and Play Store assets:

1. App Icon:
   - 1024x1024 master icon
   - Myanmar Kyat symbol + chart
   - Gold accent color
   - Simple, recognizable

2. Screenshots (6.5" and 5.5"):
   - Home dashboard
   - Currency list
   - Gold prices with chart
   - Currency converter
   - Dark mode variant
   - Myanmar language variant

3. App Store description:
   Title: Myanmar Price Pro - Gold & Currency
   Subtitle: Real-time Exchange Rates

   Description (4000 chars):
   - Key features
   - What makes it different
   - Data sources (official)
   - Free features vs Premium

   Keywords: myanmar, gold price, currency, exchange rate, MMK, USD, ရွှေစျေး, ငွေလဲနှုန်း

4. Play Store:
   - Feature graphic (1024x500)
   - Promo video (30 sec)
   - Short description (80 chars)
   - Full description

5. Localization:
   - English (primary)
   - Myanmar (Burmese)
```

---

## Prompt 16: Testing

```
Create comprehensive tests:

1. Unit tests:
   - API service tests (mock responses)
   - Model parsing tests
   - Business logic tests
   - Currency conversion tests
   - Price change calculations

2. Widget tests:
   - PriceCard renders correctly
   - Currency list shows items
   - Pull to refresh works
   - Error states display
   - Loading states display

3. Integration tests:
   - Full app flow test
   - Navigation between screens
   - Data persistence
   - Theme switching
   - Language switching

4. Golden tests:
   - Screenshot comparison
   - UI consistency across devices

5. Performance tests:
   - List scrolling (60fps)
   - Image loading
   - Memory usage
   - App startup time (<2s)

Test coverage target: 80%
```

---

## Prompt 17: CI/CD Pipeline

```
Setup CI/CD with GitHub Actions:

1. On every push:
   - Run flutter analyze
   - Run flutter test
   - Check code formatting
   - Build APK (debug)

2. On pull request:
   - All above checks
   - Code review required
   - Build both platforms

3. On release tag:
   - Build release APK
   - Build release IPA
   - Sign with certificates
   - Upload to:
     - Google Play (internal track)
     - TestFlight
   - Create GitHub release
   - Generate changelog

4. Environment secrets:
   - ANDROID_KEYSTORE (base64)
   - ANDROID_KEY_PASSWORD
   - IOS_CERTIFICATE
   - IOS_PROVISIONING_PROFILE
   - FIREBASE_CONFIG

5. Versioning:
   - Auto-increment build number
   - Version from pubspec.yaml
```

---

## Prompt 18: Security

```
Implement security best practices:

1. API security:
   - Use HTTPS only
   - Certificate pinning
   - API key obfuscation
   - Request signing

2. Local storage:
   - Encrypt sensitive data
   - Use secure storage for tokens
   - Clear data on logout

3. Code security:
   - Obfuscate release builds
   - Remove debug logs in release
   - No hardcoded secrets
   - Use .env files

4. Network security:
   - Detect rooted/jailbroken devices
   - Prevent screenshot in sensitive areas
   - SSL pinning for API calls

5. Privacy:
   - Minimal data collection
   - Clear privacy policy
   - GDPR compliance
   - Data deletion option
```

---

## Development Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Setup | Week 1 | Project setup, API integration, models |
| Phase 2: Core UI | Week 2-3 | All main screens, navigation |
| Phase 3: Features | Week 4-5 | Converter, charts, favorites |
| Phase 4: Polish | Week 6 | Animations, offline, testing |
| Phase 5: Launch | Week 7 | Store submission, marketing |

---

## Launch Checklist

- [ ] All screens implemented
- [ ] Both languages working
- [ ] Dark mode working
- [ ] Offline mode working
- [ ] Push notifications working
- [ ] Analytics integrated
- [ ] Crash reporting setup
- [ ] App icons for all sizes
- [ ] Screenshots for stores
- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] Test on real devices (5+ devices)
- [ ] Performance optimized
- [ ] Memory leaks fixed
- [ ] App store listing ready
- [ ] TestFlight beta testing done
- [ ] Play Store internal testing done

---

## Post-Launch

1. Monitor crash reports daily
2. Respond to user reviews
3. Fix critical bugs within 24h
4. Weekly feature updates
5. Monthly analytics review
6. A/B test new features
7. User feedback surveys
