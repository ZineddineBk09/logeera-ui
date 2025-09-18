# Database Seeding Scripts

This directory contains scripts to populate your Logeera database with sample data for testing and development.

## 🌱 API-Based Seeding Script

### `seed-database.js`

A comprehensive script that creates realistic test data through API endpoints (not direct database access).

**What it creates:**

- 1 Admin user
- 10 Regular users (with African names)
- 10 Trips (all within Africa continent)
- 20-30 Trip requests between users
- Processes requests: 5 accepted, 3 rejected, 2+ pending

**African cities used:**

- Cairo, Egypt
- Lagos, Nigeria
- Johannesburg, South Africa
- Nairobi, Kenya
- Casablanca, Morocco
- And 10 more major African cities

### How to Run

1. **Start your development server:**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. **Run the seeding script:**

   ```bash
   npm run db:seed-api
   # or
   pnpm db:seed-api
   ```

3. **Set admin role manually:**

   ```bash
   # Connect to your PostgreSQL database and run:
   psql -d logeera -f scripts/set-admin-role.sql
   ```

   Or manually:

   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'admin@logeera.com';
   ```

### Login Credentials

**Admin User:**

- Email: `admin@logeera.com`
- Password: `Password123!`

**Sample Regular Users:**

- Email: `ahmed.hassan1@example.com`
- Email: `fatima.mohamed2@example.com`
- Email: `omar.ali3@example.com`
- Password: `Password123!` (same for all)

### What You'll See

After running the script:

- **Dashboard**: Real user and trip statistics
- **Trips Page**: 10 tripsn cities
- **Admin Panel**: Real data for user and trip management
- **Booking System**: Some trips with confirmed/pending bookings
- **Chat System**: Ready for users to message each other

### Troubleshooting

**Common Issues:**

1. **API Connection Error:**
   - Make sure your development server is running on `http://localhost:3004`
   - Check that all migrations have been applied

2. **Registration Failures:**
   - Ensure database is properly set up
   - Check that all required environment variables are set

3. **Trip Creation Failures:**
   - Verify Google Maps API key is configured
   - Check that the trips API is working

**Reset Database:**

```bash
npm run db:reset
npm run db:seed-api
```

### Script Features

- **Realistic Data**: Uses authentic African names and cities
- **Error Handling**: Graceful handling of API failures
- **Progress Logging**: Detailed console output
- **Rate Limiting**: Built-in delays to avoid overwhelming the API
- **Randomization**: Random trip combinations and request patterns
- **Geographic Accuracy**: All coordinates within Africa (37°32′N to 34°51′15″S)

### Customization

You can modify the script to:

- Change the number of users/trips
- Use different geographic regions
- Adjust request acceptance/rejection ratios
- Add more realistic trip descriptions
- Include different vehicle types and prices

The script is designed to create a realistic testing environment that showcases all the platform features!
