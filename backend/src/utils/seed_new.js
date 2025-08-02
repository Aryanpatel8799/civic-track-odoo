require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Issue = require('../models/Issue');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Issue.deleteMany({});
    console.log('Cleared existing data...');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@civictrack.com',
      password: 'Admin@123',
      phone: '9999999999',
      role: 'admin'
    });
    await adminUser.save();
    console.log('Admin user created...');

    // Create realistic users with diverse profiles
    const userData = [
      { username: 'rajeshthakor', email: 'rajesh.thakor@gmail.com', phone: '9876543210', role: 'user' },
      { username: 'priyadesai', email: 'priya.desai@yahoo.com', phone: '9876543211', role: 'user' },
      { username: 'amitshah', email: 'amit.shah@outlook.com', phone: '9876543212', role: 'user' },
      { username: 'kavitaparmar', email: 'kavita.parmar@gmail.com', phone: '9876543213', role: 'user' },
      { username: 'vikasjoshi', email: 'vikas.joshi@email.com', phone: '9876543214', role: 'user' },
      { username: 'neetapatel', email: 'neeta.patel@gmail.com', phone: '9876543215', role: 'user' },
      { username: 'hardikgupta', email: 'hardik.gupta@yahoo.com', phone: '9876543216', role: 'user' },
      { username: 'ritashah', email: 'rita.shah@outlook.com', phone: '9876543217', role: 'user' },
      { username: 'jayeshpatel', email: 'jayesh.patel@gmail.com', phone: '9876543218', role: 'user' },
      { username: 'manishadesai', email: 'manisha.desai@email.com', phone: '9876543219', role: 'user' },
      { username: 'rohitagarwal', email: 'rohit.agarwal@gmail.com', phone: '9876543220', role: 'user' },
      { username: 'sunitalakhi', email: 'sunita.lakhi@yahoo.com', phone: '9876543221', role: 'user' },
      { username: 'vikramdave', email: 'vikram.dave@outlook.com', phone: '9876543222', role: 'user' },
      { username: 'deepikamehta', email: 'deepika.mehta@gmail.com', phone: '9876543223', role: 'user' },
      { username: 'anilkumar', email: 'anil.kumar@email.com', phone: '9876543224', role: 'user' }
    ];

    const users = [];
    for (const userInfo of userData) {
      const user = new User({
        username: userInfo.username,
        email: userInfo.email,
        password: 'User@123',
        phone: userInfo.phone,
        role: userInfo.role
      });
      await user.save();
      users.push(user);
    }
    console.log(`${users.length} regular users created...`);

    // Expanded sample coordinates for Ahmedabad and nearby areas
    const locations = [
      { coordinates: [72.5714, 23.0225], address: 'Navrangpura, Ahmedabad, Gujarat' },
      { coordinates: [72.5584, 23.0323], address: 'Vastrapur, Ahmedabad, Gujarat' },
      { coordinates: [72.5397, 23.0258], address: 'SG Highway, Ahmedabad, Gujarat' },
      { coordinates: [72.5877, 23.0395], address: 'CG Road, Ahmedabad, Gujarat' },
      { coordinates: [72.5746, 23.0504], address: 'Paldi, Ahmedabad, Gujarat' },
      { coordinates: [72.6369, 23.0047], address: 'Satellite, Ahmedabad, Gujarat' },
      { coordinates: [72.5200, 23.0300], address: 'Bopal, Ahmedabad, Gujarat' },
      { coordinates: [72.5500, 22.9970], address: 'Maninagar, Ahmedabad, Gujarat' },
      { coordinates: [72.6200, 23.0100], address: 'Naranpura, Ahmedabad, Gujarat' },
      { coordinates: [72.5900, 23.0600], address: 'Ellis Bridge, Ahmedabad, Gujarat' },
      { coordinates: [72.5400, 23.0100], address: 'Gurukul, Ahmedabad, Gujarat' },
      { coordinates: [72.6100, 23.0200], address: 'Jodhpur, Ahmedabad, Gujarat' },
      { coordinates: [72.5650, 23.0450], address: 'Law Garden, Ahmedabad, Gujarat' },
      { coordinates: [72.5800, 23.0150], address: 'Ghatlodia, Ahmedabad, Gujarat' },
      { coordinates: [72.5300, 23.0350], address: 'Science City Road, Ahmedabad, Gujarat' }
    ];

    // More detailed and realistic issue templates
    const issueTemplates = [
      {
        title: 'Deep pothole causing vehicle damage near bus stop',
        description: 'There is a massive pothole approximately 3 feet wide and 1 foot deep near the BRTS bus stop. Multiple vehicles have been damaged and it\'s causing severe traffic congestion during peak hours. The pothole has been growing larger due to recent rains.',
        category: 'Road'
      },
      {
        title: 'Non-functional street lights creating safety hazard',
        description: 'All 4 street lights on this stretch have been non-functional for over 2 weeks. This has made the area extremely unsafe for pedestrians, especially women and elderly people during evening hours. There have been reports of chain snatching incidents.',
        category: 'Lighting'
      },
      {
        title: 'Garbage accumulation blocking drainage system',
        description: 'Large amounts of household and commercial waste have been dumped illegally, blocking the main drainage outlet. This is causing water logging during rains and creating a breeding ground for mosquitoes. The smell is unbearable for nearby residents.',
        category: 'Cleanliness'
      },
      {
        title: 'Major water pipeline burst flooding residential area',
        description: 'A main water supply pipeline has burst, causing severe flooding in the residential area. Clean drinking water is being wasted at an alarming rate, and the flooding is damaging nearby houses and vehicles. Emergency repair is needed.',
        category: 'Water'
      },
      {
        title: 'Dangerous open manhole without safety barriers',
        description: 'An open manhole cover has been missing for several days without any warning signs or safety barriers. This poses extreme danger to pedestrians and two-wheeler riders, especially during night hours. Immediate safety measures are required.',
        category: 'Safety'
      },
      {
        title: 'Damaged road divider causing accidents',
        description: 'The concrete road divider has been severely damaged with sharp metal rods exposed. Multiple accidents have occurred as vehicles scrape against the damaged section. This is particularly dangerous for two-wheelers and cyclists.',
        category: 'Road'
      },
      {
        title: 'Broken traffic signal causing traffic chaos',
        description: 'The main traffic signal at this busy intersection has been malfunctioning for 3 days. Traffic police are not always present, leading to massive traffic jams and increased risk of accidents during peak hours.',
        category: 'Safety'
      },
      {
        title: 'Overflowing public dustbin attracting stray animals',
        description: 'The public dustbin has been overflowing for over a week, attracting stray dogs and crows. The scattered garbage is blocking the footpath and creating unhygienic conditions for pedestrians and nearby shopkeepers.',
        category: 'Cleanliness'
      },
      {
        title: 'Continuous water leakage from municipal pipeline',
        description: 'There is a continuous water leakage from a municipal pipeline joint, creating a muddy and slippery area. The leaked water is also causing damage to the road surface and creating mosquito breeding spots.',
        category: 'Water'
      },
      {
        title: 'Faulty park lighting affecting evening walkers',
        description: 'Most of the lights in the public park are either not working or providing very dim illumination. This is discouraging people from using the park for evening walks and exercise, affecting community health and recreation.',
        category: 'Lighting'
      },
      {
        title: 'Illegal construction blocking public footpath',
        description: 'A commercial establishment has extended their construction onto the public footpath, forcing pedestrians to walk on the busy road. This is particularly dangerous for school children and elderly people.',
        category: 'Safety'
      },
      {
        title: 'Broken water meter causing billing disputes',
        description: 'The community water meter has been damaged and showing incorrect readings for the past month. This is causing billing disputes with the water department and affecting the entire residential complex.',
        category: 'Water'
      },
      {
        title: 'Uneven road surface damaging vehicles',
        description: 'Recent road construction work has left the surface extremely uneven with height differences of 6-8 inches. This is causing damage to vehicle suspensions and making it difficult for senior citizens to walk.',
        category: 'Road'
      },
      {
        title: 'Public toilet in unhygienic condition',
        description: 'The public toilet facility has been in extremely poor condition with no water supply and broken fixtures. The unhygienic conditions are forcing people to use open areas, creating further sanitation problems.',
        category: 'Cleanliness'
      },
      {
        title: 'Flickering street lights causing eye strain',
        description: 'Several street lights are continuously flickering, causing eye strain and headaches for residents. The irregular lighting is also creating visibility issues for drivers and increasing accident risks.',
        category: 'Lighting'
      }
    ];

    // Create diverse issues with realistic data
    const statuses = ['Reported', 'In Progress', 'Resolved'];
    const priorities = ['Low', 'Medium', 'High'];
    
    for (let i = 0; i < 45; i++) { // Creating 45 issues across 15 users
      const template = issueTemplates[i % issueTemplates.length];
      const location = locations[i % locations.length];
      const user = users[i % users.length];
      
      // Add some random variation to coordinates for realistic spread
      const coordinates = [
        location.coordinates[0] + (Math.random() - 0.5) * 0.005, // Smaller variation for same city
        location.coordinates[1] + (Math.random() - 0.5) * 0.005
      ];

      // Realistic status distribution
      let status;
      const random = Math.random();
      if (random < 0.4) status = 'Reported';      // 40% new issues
      else if (random < 0.7) status = 'In Progress'; // 30% in progress  
      else status = 'Resolved';                    // 30% resolved

      // Determine if issue should be anonymous
      const isAnonymous = Math.random() < 0.15; // 15% anonymous
      
      const issue = new Issue({
        title: template.title,
        description: template.description,
        category: template.category,
        user: isAnonymous ? null : user._id, // Only set user if not anonymous
        isAnonymous: isAnonymous,
        location: {
          type: 'Point',
          coordinates: coordinates
        },
        address: location.address,
        status: status,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        spamVotes: Math.floor(Math.random() * 2), // Mostly 0-1 spam votes
        upvotes: Math.floor(Math.random() * 25) + 1, // 1-25 upvotes
        views: Math.floor(Math.random() * 100) + 10, // 10-109 views
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Random date within last 60 days
        lastStatusUpdate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Status update within last 30 days
      });

      await issue.save();
    }

    console.log('Sample issues created...');
    
    // Update user statistics
    for (const user of users) {
      const userIssueCount = await Issue.countDocuments({ user: user._id });
      await User.findByIdAndUpdate(user._id, { issuesReported: userIssueCount });
    }
    
    console.log(`
🌱 Comprehensive seed data created successfully!

👤 Admin Account:
   Email: admin@civictrack.com
   Password: Admin@123

👥 Test Users (15 users):
   Email: rajesh.thakor@gmail.com, priya.desai@yahoo.com, amit.shah@outlook.com, etc.
   Password: User@123 (for all users)

📍 Created 45 realistic civic issues across Ahmedabad locations
📊 Issue Distribution:
   - Road issues: Potholes, damaged roads, traffic problems
   - Lighting: Street lights, park lighting, traffic signals
   - Water: Pipeline bursts, leakages, meter issues  
   - Cleanliness: Garbage, public toilets, drainage
   - Safety: Open manholes, construction hazards, security

🎯 Status Distribution:
   - 40% Reported (new issues)
   - 30% In Progress (being addressed)
   - 30% Resolved (completed)

🗃️  All data is ready for comprehensive testing!
    `);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
