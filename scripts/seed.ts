/* eslint-disable @typescript-eslint/no-require-imports */
// Seed script for SafePulse Firebase
// Run: npx tsx scripts/seed.ts

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
});
const db = getFirestore();

async function seed() {
  console.log('Connected to Firebase. Seeding...');

  // Delete existing collections
  const collections = ['users', 'voices', 'voice_votes', 'voice_comments', 'voice_reposts', 'reports', 'neighborhoods', 'patterns', 'filed_311'];
  for (const col of collections) {
    const snapshot = await db.collection(col).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    if (!snapshot.empty) await batch.commit();
  }

  // ─── NEIGHBORHOODS ───
  const neighborhoods = [
    {
      slug: 'downtown-hamilton',
      name: 'Downtown Hamilton',
      bounds: {
        type: 'Polygon',
        coordinates: [[
          [-79.88, 43.26], [-79.86, 43.26], [-79.86, 43.25], [-79.88, 43.25], [-79.88, 43.26]
        ]],
      },
      healthScore: { overall: 72, infrastructure: 65, safety: 78 },
      reportCount7d: 23,
      voiceCount7d: 45,
      trendDirection: 'stable',
      lastUpdated: new Date(),
    },
    {
      slug: 'james-st-north',
      name: 'James St North',
      bounds: {
        type: 'Polygon',
        coordinates: [[
          [-79.87, 43.27], [-79.86, 43.27], [-79.86, 43.26], [-79.87, 43.26], [-79.87, 43.27]
        ]],
      },
      healthScore: { overall: 68, infrastructure: 60, safety: 74 },
      reportCount7d: 18,
      voiceCount7d: 32,
      trendDirection: 'declining',
      lastUpdated: new Date(),
    },
    {
      slug: 'barton-village',
      name: 'Barton Village',
      bounds: {
        type: 'Polygon',
        coordinates: [[
          [-79.85, 43.27], [-79.83, 43.27], [-79.83, 43.26], [-79.85, 43.26], [-79.85, 43.27]
        ]],
      },
      healthScore: { overall: 58, infrastructure: 52, safety: 65 },
      reportCount7d: 31,
      voiceCount7d: 28,
      trendDirection: 'declining',
      lastUpdated: new Date(),
    },
    {
      slug: 'westdale',
      name: 'Westdale',
      bounds: {
        type: 'Polygon',
        coordinates: [[
          [-79.92, 43.26], [-79.90, 43.26], [-79.90, 43.25], [-79.92, 43.25], [-79.92, 43.26]
        ]],
      },
      healthScore: { overall: 85, infrastructure: 82, safety: 88 },
      reportCount7d: 8,
      voiceCount7d: 20,
      trendDirection: 'improving',
      lastUpdated: new Date(),
    },
    {
      slug: 'crown-point',
      name: 'Crown Point',
      bounds: {
        type: 'Polygon',
        coordinates: [[
          [-79.83, 43.25], [-79.81, 43.25], [-79.81, 43.24], [-79.83, 43.24], [-79.83, 43.25]
        ]],
      },
      healthScore: { overall: 75, infrastructure: 70, safety: 80 },
      reportCount7d: 14,
      voiceCount7d: 25,
      trendDirection: 'stable',
      lastUpdated: new Date(),
    },
  ];
  
  for (const n of neighborhoods) {
    await db.collection('neighborhoods').doc(n.slug).set(n);
  }

  // ─── USERS ───
  const users = [
    { role: 'resident', neighborhood: 'downtown-hamilton', displayName: 'Sarah Chen', email: 'sarah@demo.com', avatarUrl: null, settings: { handsFreeEnabled: false }, createdAt: new Date(), updatedAt: new Date() },
    { role: 'resident', neighborhood: 'downtown-hamilton', displayName: 'Marcus Williams', email: 'marcus@demo.com', avatarUrl: null, settings: { handsFreeEnabled: false }, createdAt: new Date(), updatedAt: new Date() },
    { role: 'resident', neighborhood: 'downtown-hamilton', displayName: 'Priya Patel', email: 'priya@demo.com', avatarUrl: null, settings: { handsFreeEnabled: false }, createdAt: new Date(), updatedAt: new Date() },
    { role: 'resident', neighborhood: 'james-st-north', displayName: 'Jordan Rivera', email: 'jordan@demo.com', avatarUrl: null, settings: { handsFreeEnabled: false }, createdAt: new Date(), updatedAt: new Date() },
    { role: 'resident', neighborhood: 'barton-village', displayName: 'Emily Zhang', email: 'emily@demo.com', avatarUrl: null, settings: { handsFreeEnabled: false }, createdAt: new Date(), updatedAt: new Date() },
    { role: 'leader', neighborhood: 'downtown-hamilton', displayName: 'Alex Torres (Leader)', email: 'leader@demo.com', avatarUrl: null, settings: { handsFreeEnabled: true }, createdAt: new Date(), updatedAt: new Date() },
    { role: 'leader', neighborhood: 'james-st-north', displayName: 'Kim Nguyen (Leader)', email: 'leader2@demo.com', avatarUrl: null, settings: { handsFreeEnabled: false }, createdAt: new Date(), updatedAt: new Date() },
  ];
  
  const userIds = ['demo-resident-1', 'demo-resident-2', 'demo-resident-3', 'demo-resident-4', 'demo-resident-5', 'demo-leader-1', 'demo-leader-2'];
  for (let i = 0; i < users.length; i++) {
    await db.collection('users').doc(userIds[i]).set(users[i]);
  }

  // ─── VOICES ───
  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000);

  const voices = [
    { userId: 'demo-resident-1', neighborhood: 'downtown-hamilton', type: 'post', caption: 'Massive pothole on King Street near James — my bike wheel literally got stuck in it. Someone is going to get hurt.', mediaKind: 'text', location: { type: 'Point', coordinates: [-79.8711, 43.2557] }, locationApprox: { cellId: 'dpz8gx', label: 'near King & James' }, aiSummary: 'Large pothole on King Street posing injury risk to cyclists', severity: 'high', upvotes: 12, commentCount: 5, repostCount: 3, feedScore: 2.8, hidden: false, flagCount: 0, flaggedBy: [], expiresAt: null, createdAt: hoursAgo(2) },
    { userId: 'demo-resident-2', neighborhood: 'downtown-hamilton', type: 'post', caption: 'The streetlight at Main and Bay has been out for 3 weeks now. Walking home at night feels unsafe.', mediaKind: 'text', location: { type: 'Point', coordinates: [-79.8690, 43.2540] }, locationApprox: { cellId: 'dpz8gw', label: 'near Main & Bay' }, aiSummary: 'Broken streetlight creating unsafe walking conditions at night', severity: 'medium', upvotes: 8, commentCount: 3, repostCount: 1, feedScore: 1.9, hidden: false, flagCount: 0, flaggedBy: [], expiresAt: null, createdAt: hoursAgo(5) },
    { userId: 'demo-resident-3', neighborhood: 'downtown-hamilton', type: 'story', caption: 'Water is literally pooling at the bus stop on King near Wellington. Pedestrians are getting splashed by every passing car.', mediaKind: 'text', location: { type: 'Point', coordinates: [-79.8750, 43.2555] }, locationApprox: { cellId: 'dpz8gv', label: 'near King & Wellington' }, aiSummary: 'Standing water at bus stop causing splash hazard for pedestrians', severity: 'medium', upvotes: 6, commentCount: 2, repostCount: 0, feedScore: 1.5, hidden: false, flagCount: 0, flaggedBy: [], expiresAt: new Date(now.getTime() + 20 * 3600000), createdAt: hoursAgo(4) },
    { userId: 'demo-resident-1', neighborhood: 'downtown-hamilton', type: 'post', caption: 'Shoutout to the volunteers who cleaned up Gore Park this morning! The community comes together when it matters.', mediaKind: 'text', location: { type: 'Point', coordinates: [-79.8700, 43.2560] }, locationApprox: { cellId: 'dpz8gx', label: 'near Gore Park' }, aiSummary: 'Community volunteer cleanup effort at Gore Park', severity: null, upvotes: 15, commentCount: 7, repostCount: 4, feedScore: 2.5, hidden: false, flagCount: 0, flaggedBy: [], expiresAt: null, createdAt: hoursAgo(8) },
    { userId: 'demo-resident-4', neighborhood: 'downtown-hamilton', type: 'story', caption: 'Fire truck blocking York Blvd for the past 20 minutes — looks like a gas leak at one of the buildings. Stay away from the area!', mediaKind: 'text', location: { type: 'Point', coordinates: [-79.8720, 43.2580] }, locationApprox: { cellId: 'dpz8gx', label: 'near York Blvd' }, aiSummary: 'Possible gas leak emergency on York Blvd with fire response', severity: 'critical', upvotes: 22, commentCount: 12, repostCount: 8, feedScore: 4.2, hidden: false, flagCount: 0, flaggedBy: [], expiresAt: new Date(now.getTime() + 18 * 3600000), createdAt: hoursAgo(1) },
    { userId: 'demo-resident-5', neighborhood: 'barton-village', type: 'post', caption: 'Third car accident this month at the Barton/Wentworth intersection. We need a traffic light there, not just a stop sign.', mediaKind: 'text', location: { type: 'Point', coordinates: [-79.8500, 43.2630] }, locationApprox: { cellId: 'dpzbcx', label: 'near Barton & Wentworth' }, aiSummary: 'Repeated car accidents at intersection suggest need for traffic light', severity: 'high', upvotes: 18, commentCount: 9, repostCount: 5, feedScore: 3.1, hidden: false, flagCount: 0, flaggedBy: [], expiresAt: null, createdAt: hoursAgo(3) },
  ];

  const voiceIds: string[] = [];
  for (const v of voices) {
    const voiceRef = db.collection('voices').doc();
    voiceIds.push(voiceRef.id);
    await voiceRef.set({
      ...v,
      mediaUrl: null,
      linkedReportId: null,
      updatedAt: v.createdAt,
    });
  }

  // ─── REPORTS ───
  const reports = [
    { userId: 'demo-resident-1', neighborhood: 'downtown-hamilton', location: { type: 'Point', coordinates: [-79.8711, 43.2557] }, locationApprox: { cellId: 'dpz8gx', label: 'near King & James' }, category: 'infrastructure', subcategory: 'pothole', severity: 'high', description: 'Large pothole approximately 30cm wide and 10cm deep on King Street near James intersection.', aiSummary: 'Dangerous pothole in cycling lane on King Street near James', imageUrl: null, imageAnalysis: null, status: 'acknowledged', upvotes: 14, feedScore: 3.0, corroborationCount: 3, linkedVoiceId: voiceIds[0], autoFiled311: false, confirmationNumber311: null, filedBy: null, flagCount: 0, hidden: false, createdAt: hoursAgo(2) },
    { userId: 'demo-resident-2', neighborhood: 'downtown-hamilton', location: { type: 'Point', coordinates: [-79.8690, 43.2540] }, locationApprox: { cellId: 'dpz8gw', label: 'near Main & Bay' }, category: 'infrastructure', subcategory: 'broken_streetlight', severity: 'medium', description: 'Streetlight at Main and Bay St has been non-functional for 3 weeks.', aiSummary: 'Non-functional streetlight creating dark block at Main & Bay', imageUrl: null, imageAnalysis: null, status: 'new', upvotes: 8, feedScore: 2.0, corroborationCount: 2, linkedVoiceId: voiceIds[1], autoFiled311: false, confirmationNumber311: null, filedBy: null, flagCount: 0, hidden: false, createdAt: hoursAgo(5) },
    { userId: 'demo-resident-4', neighborhood: 'downtown-hamilton', location: { type: 'Point', coordinates: [-79.8720, 43.2580] }, locationApprox: { cellId: 'dpz8gx', label: 'near York Blvd' }, category: 'safety', subcategory: 'gas_leak', severity: 'critical', description: 'Strong gas smell detected near 45 York Blvd. Fire department is on scene.', aiSummary: 'Active gas leak emergency requiring evacuation on York Blvd', imageUrl: null, imageAnalysis: null, status: 'in_progress', upvotes: 25, feedScore: 5.0, corroborationCount: 5, linkedVoiceId: null, autoFiled311: true, confirmationNumber311: 'CITY-H7X9K2', filedBy: 'demo-leader-1', flagCount: 0, hidden: false, createdAt: hoursAgo(1) },
    { userId: 'demo-resident-5', neighborhood: 'barton-village', location: { type: 'Point', coordinates: [-79.8500, 43.2630] }, locationApprox: { cellId: 'dpzbcx', label: 'near Barton & Wentworth' }, category: 'safety', subcategory: 'traffic_hazard', severity: 'high', description: 'Third collision this month at Barton & Wentworth intersection.', aiSummary: 'Recurring collision hotspot at Barton & Wentworth needs traffic signal', imageUrl: null, imageAnalysis: null, status: 'acknowledged', upvotes: 20, feedScore: 3.5, corroborationCount: 4, linkedVoiceId: null, autoFiled311: false, confirmationNumber311: null, filedBy: null, flagCount: 0, hidden: false, createdAt: hoursAgo(3) },
  ];

  const reportIds: string[] = [];
  for (const r of reports) {
    const reportRef = db.collection('reports').doc();
    reportIds.push(reportRef.id);
    await reportRef.set({ ...r, updatedAt: r.createdAt });
  }

  // ─── VOICE COMMENTS ───
  const comments = [
    { voiceId: voiceIds[0], userId: 'demo-resident-2', text: 'I saw this too! Almost wiped out on my bike yesterday.', createdAt: hoursAgo(1.5) },
    { voiceId: voiceIds[0], userId: 'demo-resident-3', text: 'Someone put a cone next to it but it keeps getting knocked over', createdAt: hoursAgo(1) },
    { voiceId: voiceIds[4], userId: 'demo-resident-1', text: 'I can smell it from my apartment on Cannon. Stay safe everyone!', createdAt: hoursAgo(0.8) },
  ];
  
  for (const c of comments) {
    await db.collection('voice_comments').doc().set(c);
  }

  // ─── PATTERNS ───
  const patterns = [
    { neighborhood: 'downtown-hamilton', type: 'trend', description: 'Pothole reports near King & James up 200% week-over-week.', relatedReportIds: [reportIds[0]], relatedVoiceIds: [voiceIds[0]], severity: 'high', w0Count: 6, w1Count: 2, detectedAt: hoursAgo(1), acknowledged: false },
    { neighborhood: 'barton-village', type: 'anomaly', description: 'Unusual spike in traffic safety reports at Barton & Wentworth.', relatedReportIds: [reportIds[3]], relatedVoiceIds: [voiceIds[5]], severity: 'critical', w0Count: 3, w1Count: 0, detectedAt: hoursAgo(3), acknowledged: false },
  ];
  
  for (const p of patterns) {
    await db.collection('patterns').doc().set(p);
  }

  console.log('✅ Seed complete!');
  console.log(`   - ${users.length} users`);
  console.log(`   - ${voiceIds.length} voices`);
  console.log(`   - ${reportIds.length} reports`);
  console.log(`   - ${neighborhoods.length} neighborhoods`);
  console.log(`   - ${patterns.length} patterns`);
  console.log(`   - ${comments.length} comments`);

  process.exit(0);
}

seed().catch(console.error);
