# Quick Start Guide

## Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm start
```

### 3. Run on Your Device
- **iOS**: Press `i` in the terminal or scan QR code with Camera app
- **Android**: Press `a` in the terminal or scan QR code with Expo Go app
- **Web**: Press `w` in the terminal

### 4. Test the App
1. Browse the list of doctors
2. Tap on a doctor to see their availability
3. Select an available time slot
4. Confirm your booking
5. View your bookings from the home screen

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Project Structure Overview

- `src/screens/` - Main app screens
- `src/components/` - Reusable UI components  
- `src/services/` - API and storage logic
- `src/utils/` - Helper functions
- `src/context/` - State management
- `src/types/` - TypeScript definitions

## Common Issues

### Metro Bundler Issues
```bash
# Clear cache and restart
npm start -- --reset-cache
```

### iOS Simulator Not Opening
- Make sure Xcode is installed
- Run `xcode-select --install` if needed

### Android Emulator Issues
- Ensure Android Studio is installed
- Start an emulator before running `npm start`

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines
- Review test files in `src/**/__tests__/` for examples
