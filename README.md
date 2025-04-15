# EnergyRacer

A gamified energy drink consumption tracking application that helps users monitor their caffeine intake while earning achievements.

## Description

EnergyRacer is a modern web application built with Next.js and Supabase that gamifies the tracking of energy drink consumption. Users can log their energy drinks to log their consumption, track their caffeine intake, and earn achievements based on their consumption patterns.

Currently this only works in Finland

### Key Features

- Real-time caffeine tracking
- Achievement system with various categories
- User profile management
- Dark/light theme support
- Responsive design

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/JuhoTheOhjelmoija/EnergyRacer.git
cd EnergyRacer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   Write your supabase_url ja anom_key a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

## Usage

1. Register or log in to your account
2. Track your consumption and achievements
3. View your progress in the dashboard
4. Check your achievements in the achievements page

## Technologies

- **Frontend:**
  - Next.js 14
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui
  - React QR Scanner

- **Backend:**
  - Supabase
  - PostgreSQL
  - Row Level Security

- **Authentication:**
  - Supabase Auth

## Project Structure

```
EnergyRacer/
├── app/                    # Next.js app directory
│   ├── achievements/       # Achievements page
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
├── lib/                   # Utility functions
├── public/                # Static assets
├── supabase/             # Database migrations
└── types/                # TypeScript type definitions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/) 
