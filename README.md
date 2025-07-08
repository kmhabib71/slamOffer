# SlamOffer - AI-Powered Grand Slam Offer Generator

A sophisticated AI-powered platform that generates compelling grand slam offers for businesses using advanced language models. Built with Next.js, MongoDB, and NextAuth.

## 🚀 Features

- **AI-Powered Offer Generation**: Create comprehensive business offers using advanced AI
- **Interactive Mindmap View**: Visualize your offer components in an interactive mindmap
- **PDF Export**: Export offers to professional PDF documents
- **Subscription Management**: Flexible pricing tiers with credit-based system
- **Admin Panel**: Comprehensive admin dashboard for platform management
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB Atlas
- **AI Integration**: OpenAI GPT models
- **PDF Generation**: jsPDF, React-PDF
- **UI Components**: Framer Motion, Headless UI, Lucide Icons
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Google OAuth credentials
- OpenAI API key

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/slamoffer.git
   cd slamoffer
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   # MongoDB Configuration
   MONGODB_URI=your_mongodb_connection_string

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key

   # Optional: Stripe for payments
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages
│   ├── admin/           # Admin panel
│   ├── dashboard/       # User dashboard
│   └── providers/       # Context providers
├── components/          # React components
│   ├── admin/           # Admin components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard components
│   ├── mindmap/         # Mindmap components
│   ├── pdf/             # PDF generation components
│   └── ui/              # UI components
├── lib/                 # Utility libraries
│   ├── auth.ts          # Authentication utilities
│   ├── mongodb.ts       # MongoDB connection
│   ├── offers.ts        # Offer management
│   └── openai.ts        # OpenAI integration
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── middleware.ts        # NextAuth middleware
```

## 🔐 Authentication Setup

1. **Create Google OAuth Application**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

2. **Configure NextAuth**
   - The app uses NextAuth.js for authentication
   - Google OAuth is configured as the primary provider
   - Session management is handled automatically

## 💾 Database Setup

1. **MongoDB Atlas**
   - Create a MongoDB Atlas cluster
   - Get your connection string
   - Add it to your `.env.local` file

2. **Database Collections**
   The app automatically creates these collections:
   - `users` - User accounts
   - `user_profiles` - User profile data
   - `offers` - Generated offers
   - `admin_users` - Admin user permissions
   - `purchased_offers` - Purchase records

## 🔧 Configuration

### Admin Setup

1. Sign in to the application
2. Navigate to `/admin-setup`
3. Create your first admin user
4. Access the admin panel at `/admin`

### OpenAI Configuration

- The app uses OpenAI's GPT models for offer generation
- Configure your API key in the environment variables
- Adjust model parameters in `src/lib/openai.ts`

## 🚀 Deployment

### Deploy to Vercel

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy your app

### Environment Variables for Production

Make sure to set all required environment variables in your production environment:

- `MONGODB_URI`
- `NEXTAUTH_URL` (your production URL)
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `OPENAI_API_KEY`

## 📊 Usage

### For Users

1. **Sign up** with Google OAuth
2. **Generate offers** by providing business context
3. **Review and customize** generated components
4. **Export to PDF** for professional presentation
5. **Manage offers** in your dashboard

### For Admins

1. **Access admin panel** at `/admin`
2. **View platform statistics** and user activity
3. **Manage settings** and configuration
4. **Monitor system health** and performance

## 🔒 Security

- **Authentication**: Secure Google OAuth integration
- **Data Protection**: All data encrypted in transit and at rest
- **API Security**: Rate limiting and input validation
- **Session Management**: Secure session handling with NextAuth

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@slamoffer.com or join our community forum.

## 🙏 Acknowledgments

- OpenAI for providing the AI models
- The Next.js team for the excellent framework
- MongoDB for the robust database solution
- All contributors and beta testers

---

**Ready to create your Grand Slam Offer?** 🚀

Start the development server and visit [http://localhost:3000](http://localhost:3000) to see the magic!
