# Ihya'us Sunnah School Management System (ISMS)

## Setup Instructions for Local Offline Deployment

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Edge)

### Installation Steps

1. **Extract/Copy the project folder**
   Copy the `ihyaahussunah` folder to your desired location (e.g., `C:\SchoolSystem`)

2. **Open Command Prompt/Terminal**
   Navigate to the project folder:
   ```
   cd ihyaahussunah
   ```

3. **Install Dependencies**
   ```
   npm install
   ```

4. **Generate Prisma Client**
   ```
   npx prisma generate
   ```

5. **Create SQLite Database and Apply Schema**
   ```
   npx prisma db push
   ```

6. **Seed the Database**
   ```
   npx prisma db seed
   ```
   This creates:
   - Default admin account
   - All roles
   - 10 classes
   - 19 Islamic subjects
   - Fee structure
   - Sample data

7. **Build the Application**
   ```
   npm run build
   ```

8. **Start the Server**
   ```
   npm start
   ```

9. **Access the System**
   Open your browser and go to:
   ```
   http://localhost:3000
   ```

### Default Login Credentials

| Username | Password | Role |
|----------|----------|------|
| admin    | admin123 | Super Admin |

### Running in Development Mode
```
npm run dev
```
Access at `http://localhost:3000`

### Quick Start Script
Alternatively, run the setup script:
```
setup.bat
```
This will automate steps 3-8.

### System Architecture
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **UI Framework**: shadcn/ui components
- **Database**: SQLite (stored locally in `prisma/dev.db`)
- **Authentication**: NextAuth.js with credentials provider
- **ORM**: Prisma

### Default Modules
1. Dashboard - Analytics and overview
2. Student Management - CRUD operations
3. Teacher Management - Staff management
4. Class Management - Class organization
5. Subject Management - Islamic curriculum
6. Attendance - Daily attendance tracking
7. Exams & Results - Assessment management
8. Hifz Tracking - Quran memorization progress
9. Character Assessment - Student character evaluation
10. Fees Management - Financial tracking
11. Reports - Printable reports and exports

### Troubleshooting
- **Port already in use**: Change port with `npm start -- -p 3001`
- **Database issues**: Delete `prisma/dev.db` and re-run `npx prisma db push && npx prisma db seed`
- **Build errors**: Ensure all dependencies are installed with `npm install`
