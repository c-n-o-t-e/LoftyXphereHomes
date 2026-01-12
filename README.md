# LoftyXphereHomes - Premium Shortlet Website

A production-ready website for LoftyXphereHomes, a premium shortlet apartment rental brand in Nigeria.

## 🚀 Features

- **Premium Design**: Clean, luxury aesthetic with smooth animations
- **Responsive**: Mobile-first design that works on all devices
- **SEO Optimized**: Complete metadata, sitemap, and robots.txt
- **Fast Performance**: Optimized images, fonts, and code splitting
- **Form Validation**: Robust forms with Zod and React Hook Form
- **Type Safe**: Full TypeScript implementation
- **Scalable**: Easy to add new apartments and features

## 🛠 Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **ShadCN/UI** (Form, Modal, Carousel, Navigation)
- **Framer Motion** (Animations)
- **React Hook Form** + **Zod** (Form validation)
- **next/image** (Optimized images)

## 📁 Project Structure

```
├── app/
│   ├── apartments/          # Apartment listing and detail pages
│   ├── about/              # About page
│   ├── booking/            # Booking page with inquiry form
│   ├── contact/            # Contact page
│   ├── gallery/            # Image gallery
│   ├── terms/              # Terms & conditions
│   ├── privacy/            # Privacy policy
│   ├── layout.tsx          # Root layout with Navbar & Footer
│   ├── page.tsx            # Homepage
│   ├── sitemap.ts          # SEO sitemap
│   └── robots.ts            # SEO robots.txt
├── components/
│   ├── ui/                 # ShadCN UI components
│   ├── Navbar.tsx          # Navigation bar
│   ├── Footer.tsx           # Footer component
│   ├── Hero.tsx             # Homepage hero section
│   ├── ApartmentCard.tsx    # Apartment card component
│   ├── TrustSignals.tsx     # Trust signals section
│   ├── TestimonialSlider.tsx # Testimonials carousel
│   ├── AmenitiesSection.tsx  # Amenities display
│   ├── BookingInquiryForm.tsx # Booking inquiry form
│   └── ContactForm.tsx       # Contact form
├── lib/
│   ├── data/
│   │   ├── apartments.ts    # Apartment data
│   │   └── testimonials.ts  # Testimonial data
│   ├── types.ts             # TypeScript types
│   └── constants.ts         # App constants
└── public/
    └── apartments/          # Apartment images
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your configuration:
   - `NEXT_PUBLIC_SITE_URL`: Your website URL
   - `NEXT_PUBLIC_DEFAULT_BOOKING_URL`: Default booking platform URL
   - Apartment-specific booking URLs (optional)

4. **Add apartment images:**
   - Place apartment images in `public/apartments/`
   - Follow naming convention: `{city}-{id}-{number}.jpg`
   - Example: `abuja-01-1.jpg`, `lagos-01-1.jpg`

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🏗 Building for Production

```bash
npm run build
```

The production build will be in the `.next` directory.

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 📸 Adding New Apartments

Edit `lib/data/apartments.ts` and add a new apartment object:

```typescript
{
  id: "lofty-city-04",
  name: "Lofty City Suite",
  shortDescription: "Description here",
  location: { city: "Lagos", area: "Victoria Island" },
  pricePerNight: 50000,
  images: ["/apartments/city-04-1.jpg", ...],
  amenities: [...],
  houseRules: [...],
  capacity: 2,
  beds: 1,
  baths: 1,
  rating: 4.8,
  reviews: 25,
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_CITY_04,
}
```

## 🎨 Customization

### Colors & Styling

Edit `app/globals.css` to customize the color scheme and styling.

### Fonts

Fonts are configured in `app/layout.tsx`. Currently using:
- **Inter** (primary)
- **Playfair Display** (accent/luxury)

### Components

All reusable components are in the `components/` directory. Modify as needed.

## 📊 Analytics Setup (Optional)

### Google Analytics

1. Uncomment the Google Analytics section in `app/layout.tsx`
2. Add `NEXT_PUBLIC_GA_ID` to your `.env.local`
3. Replace with your Google Analytics ID

### PostHog

1. Uncomment the PostHog section in `app/layout.tsx`
2. Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.local`

## 🔒 Environment Variables

See `.env.example` for all available environment variables.

## 📄 Pages

- `/` - Homepage with hero, featured apartments, trust signals, testimonials
- `/apartments` - All apartment listings
- `/apartments/[id]` - Individual apartment details
- `/booking` - Booking page with redirect and inquiry form
- `/about` - About us page
- `/contact` - Contact form
- `/gallery` - Image gallery with lightbox
- `/terms` - Terms & conditions
- `/privacy` - Privacy policy

## 🐛 Troubleshooting

### Images not showing

- Ensure images are in `public/apartments/`
- Check image paths match the `images` array in apartment data
- Verify image file names match exactly (case-sensitive)

### Forms not submitting

- Forms currently log to console (implement API endpoint)
- Check browser console for validation errors
- Ensure all required fields are filled

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [ShadCN/UI](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion/)

## 📝 License

This project is proprietary and confidential.

## 🤝 Support

For support, email info@loftyxpherehomes.com or call +234 800 000 0000.

---

Built with ❤️ for LoftyXphereHomes
