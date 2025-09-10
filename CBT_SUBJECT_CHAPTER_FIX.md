# CBT Subject/Chapter Selection Fix Guide

This guide addresses the "relation 'subjects' does not exist" error and implements the complete CBT syllabus for subject/chapter selection.

## 🐛 Problem Fixed

**Error**: `relation "subjects" does not exist`
**Cause**: Application tried to query subjects/chapters tables that weren't created in the database
**Impact**: Upload functionality failed when users selected subjects and chapters

## ✅ Solution Implemented

### 1. Database Error Handling
- Added graceful fallback when subjects/chapters tables don't exist
- Application now works both with and without normalized subject/chapter tables
- Enhanced error handling with detailed logging

### 2. CBT Syllabus Integration
Updated the application with the complete **CBT Technician Gr I Signal** syllabus:

**Subjects Added:**
- General Awareness
- General Intelligence and Reasoning  
- Basics of Computers and Applications
- Mathematics
- Basic Science and Engineering

**Total Chapters Added:** 84 chapters across all subjects

### 3. UI Improvements
- Updated subject dropdown with CBT-specific subjects
- Added comprehensive chapter suggestions (84 total chapters)
- Maintained custom entry capability for flexibility

## 🚀 How to Fix Your Database

### Option 1: Automated Setup (Recommended)
```bash
# Run the setup script
./scripts/setup-cbt-database.sh
```

### Option 2: Manual Setup
```bash
# Connect to your Neon database and run:
psql "$NEON_DATABASE_URL" -f database/init_cbt_database.sql
```

### Option 3: Neon Console
1. Open your Neon dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `database/init_cbt_database.sql`
4. Execute the script

## 📋 CBT Subjects & Chapters Structure

### General Awareness (9 chapters)
- Current Affairs
- Indian Geography
- Indian Culture & History
- Freedom Struggle
- Indian Polity & Constitution
- Indian Economy
- Environmental Issues (India & World)
- Sports
- Scientific & Technological Developments

### General Intelligence and Reasoning (17 chapters)
- Analogies, Series, Coding & Decoding
- Mathematical Operations, Relationships
- Syllogism, Venn Diagram
- Data Interpretation & Sufficiency
- Analytical Reasoning, Classification
- Statement Analysis (Arguments & Assumptions)

### Basics of Computers and Applications (11 chapters)
- Computer Architecture & Components
- Input/Output/Storage Devices
- Networking & Operating Systems
- MS Office & Data Representation
- Internet, Email & Security

### Mathematics (14 chapters)
- Number System & Operations
- Algebra & Geometry
- Trigonometry & Statistics
- Sets & Probability

### Basic Science and Engineering (33 chapters)
- Physics: Mechanics, Heat, Electricity
- Electronics: Devices, Circuits, Measurements
- Engineering: Microcontrollers, Displays

## 🔧 Technical Changes Made

### Backend (`api/testFileService.js`)
```javascript
// Added table existence check
try {
  await db.query(`SELECT 1 FROM subjects LIMIT 1`);
  tablesExist = true;
} catch (tableErr) {
  console.warn('Subjects/chapters tables do not exist yet');
  tablesExist = false;
}

// Graceful subject/chapter handling
if (tablesExist) {
  // Perform subject/chapter upsert
} else {
  // Store without normalized references
}
```

### Frontend (`components/landing-view.html`)
```html
<!-- Updated with CBT subjects -->
<datalist id="subject-suggestions">
  <option value="General Awareness">
  <option value="General Intelligence and Reasoning">
  <!-- ... all CBT subjects -->
</datalist>

<!-- Updated with 84 CBT chapters -->
<datalist id="chapter-suggestions">
  <option value="Current Affairs">
  <option value="Analogies">
  <!-- ... all CBT chapters -->
</datalist>
```

## ✅ Testing the Fix

### 1. Verify Database Setup
```sql
-- Check subjects
SELECT name FROM subjects ORDER BY name;

-- Check chapters count
SELECT s.name, COUNT(c.id) as chapter_count 
FROM subjects s LEFT JOIN chapters c ON s.id = c.subject_id 
GROUP BY s.name ORDER BY s.name;
```

### 2. Test Upload Functionality
1. Go to your application
2. Select "Upload New File" tab
3. Choose a test file
4. Select subject from dropdown (should show CBT subjects)
5. Select chapter from dropdown (should show relevant chapters)
6. Click "Save to cloud database"
7. Should succeed without "subjects does not exist" error

### 3. Verify Data Storage
```sql
-- Check uploaded files with subjects
SELECT 
    file_name,
    s.name as subject,
    c.name as chapter,
    file_json->>'section' as section
FROM test_files tf
LEFT JOIN subjects s ON tf.subject_id = s.id  
LEFT JOIN chapters c ON tf.chapter_id = c.id
ORDER BY tf.uploaded_at DESC;
```

## 🎯 Benefits

1. **Error Resolution**: "relation 'subjects' does not exist" error fixed
2. **CBT Compliance**: Complete syllabus integration for exam preparation
3. **Flexibility**: Supports both predefined and custom subject/chapter entry
4. **Backward Compatibility**: Works with existing database setups
5. **Performance**: Normalized subject/chapter references for better queries

## 🔄 Migration Notes

- Existing test files continue to work without changes
- New uploads will use normalized subject/chapter references when available
- Custom subjects/chapters are automatically added to the database
- No data loss during the transition

The application now fully supports the CBT Technician Gr I Signal syllabus structure while maintaining flexibility for custom entries.