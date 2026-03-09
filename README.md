# EVENTORA - Event Management Platform

EVENTORA is a comprehensive event management platform built with Angular (frontend) and Laravel (backend). The platform allows users to create, manage, and participate in events with features like ticket management, payment processing, and real-time communication.

## 🚀 Features

### For Event Organizers
- **Event Management**: Create, edit, and manage events
- **Dashboard**: Analytics and insights for event performance
- **Events Ticket**: Generate and manage event tickets
- **Account Management**: Profile and account settings
- **QR Code Generation**: Automatic QR code generation for tickets

### For Event Participants
- **Event Discovery**: Browse and search for events
- **Ticket Reservations**: Book tickets for events
- **Ticket Management**: View and purchased tickets
- **Account Management**: Profile and account settings

### For Administrators
- **User Management**: Manage all platform users
- **Event Oversight**: Monitor and manage all events
- **Ticket Management**: Oversee ticket sales and distribution
- **Conversation System**: Real-time chat support
- **Analytics Dashboard**: Comprehensive platform analytics

### General Features
- **Authentication System**: Secure login/register with password recovery
- **Payment Integration**: Stripe payment processing
- **Responsive Design**: Mobile-friendly interface
- **Real-time Communication**: Chat system for support
- **Email Notifications**: Automated email communications
- **PDF Generation**: Ticket and receipt generation

## 🏗️ Architecture

### Frontend (Angular 19)
- **Framework**: Angular 19 with TypeScript
- **UI Components**: Angular Material
- **Charts**: ngx-charts for data visualization
- **Payment**: Stripe integration
- **QR Codes**: Angular QR code generation
- **Routing**: Angular Router with route guards

### Backend (Laravel 12)
- **Framework**: Laravel 12 with PHP 8.2+
- **Authentication**: Laravel Sanctum
- **Payment**: Laravel Cashier (stripe-php) 
- **PDF Generation**: DomPDF
- **QR Codes**: Simple QR Code library
- **Email**: Laravel Mail with laravel-imap support
- **Database**: MySQL with Eloquent ORM

## 📁 Project Structure

```
EVENTORA_FIXED/
├── front-angular/          # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   └── about/ 
│   │   │   ├── auth/       
│   │   │   ├── charts/     
│   │   │   └── contact-us/ 
│   │   │   └── event-card/ 
│   │   │   ├── events/    
│   │   │   └── guards/ 
│   │   │   └── home/ 
│   │   │   └── interceptor/ 
│   │   │   └── layouts/    
│   │   │   └── services/ 
│   │   │   ├── user/       
│   │   └── assets/         
│   └── package.json
└── back-laravel-api/       # Laravel backend API
    ├── app/
    │   ├── Console/       
    │   ├── Http/          
    │   ├── Mail/          
    │   ├── Models/        
    │   └── Providers/     
    ├── database/           
    └── composer.json
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PHP 8.2 or higher
- Composer
- MySQL database
- Stripe account (for payments)

### Frontend Setup (Angular)

1. Navigate to the frontend directory:
```bash
cd front-angular
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The Angular app will be available at `http://localhost:4200`

### Backend Setup (Laravel)

1. Navigate to the backend directory:
```bash
cd back-laravel-api
```

2. Install PHP dependencies:
```bash
composer install
```

3. Install Node.js dependencies:
```bash
npm install
```

4. Configure environment:
```bash
cp .env.example .env
php artisan key:generate
```

5. Configure your `.env` file with:
   - Database credentials
   - Stripe API keys
   - Mail configuration
   - App URL

6. Run database migrations:
```bash
php artisan migrate
```

7. Seed the database (optional):
```bash
php artisan db:seed
```

8. Start the development server:
```bash
php artisan serve
```

The Laravel API will be available at `http://localhost:8000`

## 📊 Database Schema

The application uses the following main models:
- **User**: User accounts and authentication
- **Event**: Event information and details
- **Ticket**: Ticket management and sales
- **Payment**: Payment records and transactions
- **Category**: Event categories
- **Conversation/Message**: Chat system

## 🔐 Security Features

- JWT-based authentication with Laravel Sanctum
- Route guards for protected areas
- CSRF protection
- Input validation and sanitization
- Secure payment processing with Stripe
- Password hashing and recovery

**EVENTORA** - Making event management simple and efficient! 🎉 