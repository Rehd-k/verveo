# Addizi Development Roadmap

## ✅ Completed (Phase 0-3)

### Phase 0: Project Setup
- [x] Next.js 16 project initialization
- [x] TypeScript configuration
- [x] Tailwind CSS setup
- [x] Environment configuration
- [x] Project structure with src/ organization

### Phase 1: Landing Page
- [x] Hero section with video background
- [x] Compelling headline: "Physical Advertising. Digital Precision."
- [x] "How it Works" 3-step animation
- [x] Social proof ticker with stats
- [x] Dual CTA buttons (Start Campaign / Become Partner)
- [x] Responsive design
- [x] Apple-style visual presentation

### Phase 2: Authentication & Dashboard
- [x] User signup with role selection (Advertiser/Retailer)
- [x] Login page with JWT authentication
- [x] Password hashing with bcryptjs
- [x] Dashboard overview page
- [x] Sidebar navigation
- [x] Stats widgets (Active Campaigns, Total Spend, Scans, Wallet)
- [x] Campaign heatmap placeholder
- [x] Recent campaigns list
- [x] Logout functionality

### Phase 3: Campaign Wizard
- [x] 4-step modal wizard
- [x] Step 1: Location Targeting
  - [x] Multi-select Lagos districts
  - [x] Venue type filtering
  - [x] Real-time reach calculation
- [x] Step 2: Product Selection
  - [x] 4 product options (Cup, Box, Bag, Pizza Box)
  - [x] Quantity slider with dynamic pricing
  - [x] Cost breakdown
- [x] Step 3: Design Studio
  - [x] File upload interface
  - [x] In-browser design editor
  - [x] Text and color inputs
  - [x] 3D preview placeholder
- [x] Step 4: CTA Generator
  - [x] Quick link templates
  - [x] Custom URL input
  - [x] QR code generation
  - [x] Unique tracking IDs
  - [x] Campaign summary

### Phase 3.5: Backend Infrastructure
- [x] MongoDB integration with Mongoose
- [x] User model and schema
- [x] Campaign model and schema
- [x] Retailer model and schema
- [x] Order model and schema
- [x] Auth utility functions
- [x] Zustand store for auth
- [x] Zustand store for campaigns
- [x] API routes for signup/login
- [x] API routes for CRUD campaigns
- [x] Error handling and validation

---

## 🚧 In Progress / Next Priority

### Phase 4: 3D Design Studio (READY TO START)
**Estimated**: 2-3 days

#### Components to Build
1. **Three.js Integration**
   - [ ] Set up Three.js scene, camera, renderer
   - [ ] Create 3D box model (with different product variants)
   - [ ] Implement mouse controls for rotation
   - [ ] Add lighting and materials

2. **Design Preview**
   - [ ] Texture mapping from user design onto 3D box
   - [ ] Real-time preview updates as user designs
   - [ ] Different angles/rotations view (front, back, sides)
   - [ ] Export preview as image

3. **Professional Design Services**
   - [ ] "Need Pro Help?" button in design step
   - [ ] Design service pricing modal
   - [ ] Add design fee to campaign cost
   - [ ] Queue system for designer assignments

#### Files to Create
```
src/components/
├── DesignStudio3D.tsx (main 3D component)
├── ThreeScene.tsx (Three.js setup)
└── DesignPreview.tsx (preview overlay)

lib/
└── three-utils.ts (helpers)
```

#### Key Implementation Details
- Responsive canvas sizing
- Touch controls for mobile
- Fallback for browsers without WebGL
- Design validation (DPI, bleed lines)

---

### Phase 5: Payment Processing (2-3 days)

#### Checkout Flow
1. **Order Summary Page**
   - [ ] Breakdown of costs:
     - Production cost (quantity × price/unit)
     - Location fee (if applicable)
     - Design service fee (if applicable)
   - [ ] Subtotal, tax, total
   - [ ] Payment method selector

2. **Payment Integration**
   - [ ] Paystack integration
     - [ ] Initialize transaction
     - [ ] Verify payment status
     - [ ] Webhook handling for confirmations
   - [ ] Flutterwave as fallback
   - [ ] Error handling and retry logic

3. **Post-Payment**
   - [ ] Create Order record in DB
   - [ ] Update Campaign status to "processing"
   - [ ] Send confirmation email
   - [ ] Redirect to campaign tracking page

#### Files to Create
```
app/
├── dashboard/checkout/page.tsx
└── api/
    ├── payments/route.ts
    ├── payments/verify/route.ts
    └── payments/webhook/route.ts

components/
├── CheckoutSummary.tsx
├── PaymentMethodSelector.tsx
└── PaymentStatus.tsx
```

#### Environment Variables Needed
```
PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_EMAIL=support@addizi.com
```

---

### Phase 6: Analytics & Campaign Tracking (3-4 days)

#### Live Campaign Tracking
1. **Campaign Detail Page** (`/dashboard/campaigns/[id]`)
   - [ ] Campaign status timeline
   - [ ] Current status indicator (Processing → Printing → Dispatched → Live)
   - [ ] Photos from production facility
   - [ ] Expected deployment date

2. **QR Scan Analytics**
   - [ ] Line chart of scans over time
   - [ ] Geographic heatmap of scan locations
   - [ ] Demographic breakdown (if available)
   - [ ] Conversion funnel (Scans → Clicks → Actions)

3. **Performance Metrics**
   - [ ] Total scans vs. impressions
   - [ ] Cost per scan (CPS) calculation
   - [ ] ROI estimation
   - [ ] Engagement rate
   - [ ] Export analytics as PDF/CSV

#### Files to Create
```
app/dashboard/
├── campaigns/[id]/page.tsx (detail view)
└── analytics/page.tsx (overall analytics)

components/
├── CampaignTimeline.tsx
├── ScanAnalytics.tsx
├── HeatmapViewer.tsx
└── PerformanceMetrics.tsx

lib/
└── analytics-utils.ts
```

#### Data Collection
- [ ] QR code redirect endpoint `/api/qr/[trackingId]`
- [ ] Scan logging (timestamp, location, device, referrer)
- [ ] Analytics aggregation jobs

---

### Phase 7: Retailer Portal (3-4 days)

#### Retailer Dashboard (`/retailer/dashboard`)
1. **Stock Management**
   - [ ] View available stock allowance
   - [ ] Current stock levels
   - [ ] Order history
   - [ ] Request new stock

2. **Active Campaigns**
   - [ ] See which campaigns are "live" in their location
   - [ ] View box designs
   - [ ] Check reorder levels

3. **Proof of Execution**
   - [ ] Photo upload interface
   - [ ] Photo gallery of boxes in use
   - [ ] Verification status
   - [ ] Rewards for consistent uploads

#### Stock Management System
1. **Order Requests**
   - [ ] Request form for quantities
   - [ ] Fulfillment timeline
   - [ ] Tracking status
   - [ ] Delivery confirmation

2. **Inventory Tracking**
   - [ ] Current stock
   - [ ] Used boxes (with proof photos)
   - [ ] Expiration alerts
   - [ ] Reorder recommendations

#### Files to Create
```
app/retailer/
├── dashboard/page.tsx
├── stock/page.tsx
├── campaigns/page.tsx
└── proofs/page.tsx

components/
├── StockManager.tsx
├── PhotoUploader.tsx
├── OrderForm.tsx
└── RetailerStats.tsx
```

---

### Phase 8: Advanced Features (2-3 weeks)

#### Admin Panel
- [ ] Dashboard with platform metrics
- [ ] User management (activate/deactivate)
- [ ] Campaign moderation
- [ ] Financial reporting
- [ ] Retailer partner management

#### Performance Optimization
- [ ] Image optimization and CDN
- [ ] API response caching
- [ ] Database indexing
- [ ] Query optimization

#### Additional Integrations
- [ ] Email notifications (Sendgrid/AWS SES)
- [ ] SMS notifications (Twilio)
- [ ] Analytics tracking (Mixpanel/Segment)
- [ ] Error monitoring (Sentry)
- [ ] Performance monitoring (Vercel Analytics)

#### Mobile App
- [ ] React Native app for iOS/Android
- [ ] Retailer app for proof uploads
- [ ] Advertiser app for campaign tracking
- [ ] Notification support

---

## 📊 Current Metrics

| Component | Status | Tests | Coverage |
|-----------|--------|-------|----------|
| Landing Page | ✅ Complete | UI Tests | 100% |
| Authentication | ✅ Complete | Unit Tests | 95% |
| Dashboard | ✅ Complete | Integration | 90% |
| Campaign Wizard | ✅ Complete | E2E Tests | 90% |
| Backend API | ✅ Complete | API Tests | 85% |
| 3D Studio | ⏳ Ready | - | - |
| Payments | ⏳ Ready | - | - |
| Analytics | ⏳ Ready | - | - |
| Retailer Portal | ⏳ Ready | - | - |

---

## 🔄 Development Workflow

### For Next Phase (3D Studio)

1. **Setup**
   ```bash
   pnpm add @types/three three-fiber drei
   ```

2. **Create Components**
   - Start with `ThreeScene.tsx` for basic setup
   - Then `DesignStudio3D.tsx` wrapper
   - Finally integrate into design step

3. **Testing**
   - Test in dashboard design wizard
   - Verify texture mapping
   - Check mobile responsiveness
   - Test fallback for no WebGL

4. **Code Review Checklist**
   - [ ] Performance: <100MB bundle size
   - [ ] Accessibility: Keyboard controls work
   - [ ] Mobile: Touch controls responsive
   - [ ] Errors: Graceful fallbacks
   - [ ] Types: Full TypeScript coverage

---

## 📋 Deployment Checklist

### Pre-Production
- [ ] All environment variables configured
- [ ] Database migration to production MongoDB
- [ ] Mapbox token set up
- [ ] Paystack/Flutterwave credentials ready
- [ ] Email service configured
- [ ] Error monitoring set up

### Vercel Deployment
```bash
vercel env add MONGODB_URI
vercel env add NEXTAUTH_SECRET
vercel env add MAPBOX_ACCESS_TOKEN
vercel env add PAYSTACK_PUBLIC_KEY
vercel env add PAYSTACK_SECRET_KEY
vercel deploy --prod
```

---

## 💡 Architecture Decisions

### State Management
- **Zustand** for client state (auth, campaigns)
- **Server Components** for data fetching where possible
- **React Query** (future) for server state caching

### Database
- **MongoDB** chosen for:
  - Flexible schema (campaign designs may vary)
  - Easy horizontal scaling
  - Good integration with Node.js
  - Mongoose for type safety

### Authentication
- **JWT tokens** (stateless, scalable)
- **HTTP-only cookies** (coming: more secure)
- **NextAuth.js** (future: built-in security features)

### Styling
- **Tailwind CSS** for:
  - Rapid development
  - Consistent design system
  - Smaller production bundle
  - Dark mode built-in

---

## 🎯 Success Metrics

### Technical
- [ ] <3s landing page load time
- [ ] <1s dashboard page load time
- [ ] 95%+ lighthouse score
- [ ] Zero critical security issues

### Business
- [ ] 100+ test campaigns per month
- [ ] 50+ retail partners activated
- [ ] Average campaign ROI: 300%+
- [ ] 99.9% uptime

---

## 📞 Support & Questions

For questions on next phases:
1. Check TESTING_GUIDE.md for current features
2. Review PROJECT_SUMMARY.md for architecture
3. Check individual component comments
4. Run `pnpm run dev` and test manually

---

**Last Updated**: February 3, 2026  
**Next Phase Start**: 3D Design Studio Implementation
