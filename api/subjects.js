const { validateMethod, sendJsonResponse, sendErrorResponse } = require('./utils');
const db = require('./database');

module.exports = async function handler(req, res) {
  if (!validateMethod(req, res, ['GET'])) return;

  try {
    const { subject, subject_id } = req.query || {};

    // If NEON is configured, return DB-backed subjects with ids and chapters
    if (process.env.NEON_DATABASE_URL) {
      // List subjects
      if (!subject && !subject_id) {
        const rows = await db.query(`SELECT id, name, slug FROM subjects ORDER BY name`);
        // For each subject, fetch chapter count or leave chapters empty for now (frontend will request chapters)
        const subjects = rows.map(r => ({ id: r.id, name: r.name, slug: r.slug }));
        return sendJsonResponse(res, req, { subjects });
      }

      // If subject_id provided, return chapters for that subject
      if (subject_id) {
        const chapters = await db.query(`SELECT id, name, slug FROM chapters WHERE subject_id = $1 ORDER BY position`, [subject_id]);
        return sendJsonResponse(res, req, { chapters: chapters.map(c => ({ id: c.id, name: c.name, slug: c.slug })) });
      }

      // If subject name provided, find by name (case-insensitive) and return its chapters
      if (subject) {
        const s = await db.query(`SELECT id, name, slug FROM subjects WHERE lower(name) = lower($1) LIMIT 1`, [subject]);
        if (!s || s.length === 0) return sendErrorResponse(res, req, new Error('Subject not found'), 404);
        const subjectId = s[0].id;
        const chapters = await db.query(`SELECT id, name, slug FROM chapters WHERE subject_id = $1 ORDER BY position`, [subjectId]);
        return sendJsonResponse(res, req, { subject: s[0].name, chapters: chapters.map(c => ({ id: c.id, name: c.name, slug: c.slug })) });
      }
    }

    // Fallback to static SUBJECTS when no DB available (existing behavior)
    // Keep the original static list to avoid breaking local dev flows
    const SUBJECTS = [
      {
        name: 'General Awareness',
        chapters: [
          'Current Affairs', 'Indian Geography', 'Indian Culture & History', 'Freedom Struggle',
          'Indian Polity & Constitution', 'Indian Economy', 'Environmental Issues (India & World)',
          'Sports', 'Scientific & Technological Developments'
        ]
      },
      {
        name: 'General Intelligence and Reasoning',
        chapters: [
          'Analogies', 'Alphabetical Series', 'Number Series', 'Coding & Decoding', 'Mathematical Operations',
          'Relationships', 'Syllogism', 'Jumbling', 'Venn Diagram', 'Data Interpretation & Sufficiency',
          'Conclusions & Decision Making', 'Similarities & Differences', 'Analytical Reasoning',
          'Classification', 'Directions', 'Statement–Arguments', 'Statement–Assumptions'
        ]
      },
      {
        name: 'Basics of Computers and Applications',
        chapters: [
          'Computer Architecture', 'Input Devices', 'Output Devices', 'Storage Devices', 'Networking',
          'Operating Systems (Windows/Unix/Linux)', 'MS Office', 'Data Representation', 'Internet & Email',
          'Websites & Browsers', 'Computer Virus'
        ]
      },
      {
        name: 'Mathematics',
        chapters: [
          'Number System', 'Rational & Irrational Numbers', 'BODMAS Rule', 'Quadratic Equations',
          'Arithmetic Progression', 'Similar Triangles', 'Pythagoras Theorem', 'Coordinate Geometry',
          'Trigonometric Ratios', 'Heights & Distances', 'Surface Area & Volume', 'Sets',
          'Statistics (Dispersion & SD)', 'Probability'
        ]
      },
      {
        name: 'Basic Science and Engineering',
        chapters: [
          'Units & Measurements', 'Mass Weight Density', 'Work Power Energy', 'Speed & Velocity', 'Heat & Temperature',
          'Electric Charge Field Intensity', 'Electric Potential & Potential Difference', 'Simple Electric Circuits',
          'Conductors & Insulators', 'Ohm’s Law & Limitations', 'Resistances Series & Parallel', 'Specific Resistance',
          'Electric Potential Energy & Power', 'Ampere’s Law', 'Magnetic Force (Charged Particle)',
          'Magnetic Force (Straight Conductor)', 'Electromagnetic Induction', 'Faraday’s Law', 'Electromagnetic Flux',
          'Magnetic Field', 'Magnetic Induction', 'Basic Electronics', 'Digital Electronics', 'Electronic Devices & Circuits',
          'Microcontroller', 'Microprocessor', 'Electronic Measurements', 'Measuring Systems & Principles', 'Range Extension Methods',
          'Cathode Ray Oscilloscope', 'LCD', 'LED Panel', 'Transducers'
        ]
      }
    ];

    const { subject: qsubject } = req.query || {};
    if (qsubject) {
      const found = SUBJECTS.find(s => s.name.toLowerCase() === qsubject.toLowerCase());
      if (!found) {
        return sendErrorResponse(res, req, new Error('Subject not found'), 404);
      }
      return sendJsonResponse(res, req, { subject: found.name, chapters: found.chapters });
    }

    sendJsonResponse(res, req, { subjects: SUBJECTS });
  } catch (error) {
    sendErrorResponse(res, req, error, 500);
  }
};
