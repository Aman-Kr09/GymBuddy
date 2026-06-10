import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Gym from './models/Gym.js';
import Review from './models/Review.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Gym.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data');

    // Create Admin
    const admin = await User.create({
      fullName: 'Admin GymBuddy',
      email: 'admin@gymbuddy.com',
      password: 'admin123',
      gender: 'male',
      age: 30,
      mobile: '+91 9999900000',
      role: 'admin',
      fitnessGoals: ['General Fitness'],
      interests: ['Gym Workout'],
      location: { type: 'Point', coordinates: [77.3410, 28.6439], city: 'Ghaziabad', state: 'Uttar Pradesh', locality: 'Vaishali' },
    });
    console.log('✅ Admin created: admin@gymbuddy.com / admin123');

    // Create Sample Users
    const users = await User.create([
      {
        fullName: 'Amit Kumar', email: 'amit@test.com', password: 'test123',
        gender: 'male', age: 26, mobile: '+91 9876543210',
        fitnessGoals: ['Muscle Gain', 'Strength Training'], interests: ['Morning Workout', 'Diet Planning'],
        experienceLevel: 'intermediate', preferredWorkoutTime: 'morning', genderPreference: 'any',
        location: { type: 'Point', coordinates: [77.3380, 28.6400], city: 'Ghaziabad', state: 'UP', locality: 'Vaishali' },
      },
      {
        fullName: 'Sneha Gupta', email: 'sneha@test.com', password: 'test123',
        gender: 'female', age: 24, mobile: '+91 9876543211',
        fitnessGoals: ['Yoga', 'Weight Loss'], interests: ['Evening Workout', 'Cycling'],
        experienceLevel: 'beginner', preferredWorkoutTime: 'evening', genderPreference: 'any',
        location: { type: 'Point', coordinates: [77.3560, 28.6310], city: 'Ghaziabad', state: 'UP', locality: 'Indirapuram' },
      },
      {
        fullName: 'Raj Singh', email: 'raj@test.com', password: 'test123',
        gender: 'male', age: 30, mobile: '+91 9876543212',
        fitnessGoals: ['Bodybuilding', 'Powerlifting'], interests: ['Morning Workout', 'Gym Workout'],
        experienceLevel: 'advanced', preferredWorkoutTime: 'morning', genderPreference: 'any',
        location: { type: 'Point', coordinates: [77.3700, 28.6250], city: 'Ghaziabad', state: 'UP', locality: 'Crossing Republik' },
      },
      {
        fullName: 'Priya Verma', email: 'priya@test.com', password: 'test123',
        gender: 'female', age: 22, mobile: '+91 9876543213',
        fitnessGoals: ['General Fitness', 'Cardio'], interests: ['Running', 'Evening Workout'],
        experienceLevel: 'intermediate', preferredWorkoutTime: 'evening', genderPreference: 'any',
        location: { type: 'Point', coordinates: [77.3250, 28.6350], city: 'Ghaziabad', state: 'UP', locality: 'Raj Nagar' },
      },
      {
        fullName: 'Vikash Tiwari', email: 'vikash@test.com', password: 'test123',
        gender: 'male', age: 28, mobile: '+91 9876543214',
        fitnessGoals: ['CrossFit', 'Fat Loss'], interests: ['Morning Workout', 'Diet Planning'],
        experienceLevel: 'intermediate', preferredWorkoutTime: 'morning', genderPreference: 'any',
        location: { type: 'Point', coordinates: [77.3150, 28.6500], city: 'Ghaziabad', state: 'UP', locality: 'Kaushambi' },
      },
    ]);
    console.log(`✅ ${users.length} sample users created`);

    // Create Gym Owner
    const gymOwner = await User.create({
      fullName: 'Rajesh Fitness', email: 'gymowner@test.com', password: 'test123',
      gender: 'male', age: 35, mobile: '+91 9876543299', role: 'gymOwner',
      fitnessGoals: ['General Fitness'], interests: ['Gym Workout'],
      location: { type: 'Point', coordinates: [77.3410, 28.6439], city: 'Ghaziabad', state: 'UP', locality: 'Vaishali' },
    });
    console.log('✅ Gym owner created: gymowner@test.com / test123');

    // Create Gyms
    const gyms = await Gym.create([
      {
        name: 'Iron Paradise Gym', owner: gymOwner._id,
        description: 'Iron Paradise is a premium fitness destination equipped with world-class machines, certified trainers, and a motivating atmosphere. Whether you\'re a beginner or a seasoned athlete, our gym offers everything you need.',
        facilities: ['AC', 'Parking', 'Personal Trainer', 'Cardio Equipment', 'Strength Equipment', 'Locker Room', 'Shower', 'Wifi'],
        location: { type: 'Point', coordinates: [77.3410, 28.6439], address: 'B-12, Sector 3', city: 'Ghaziabad', state: 'UP' },
        membershipPlans: [
          { name: 'Basic', duration: '1 Month', price: 1500, features: ['Gym Access', 'Locker Room'] },
          { name: 'Standard', duration: '3 Months', price: 4000, features: ['Gym Access', 'Locker Room', 'Cardio Zone', '1 PT Session'] },
          { name: 'Premium', duration: '6 Months', price: 7000, features: ['Full Access', 'Personal Trainer', 'Diet Plan', 'All Classes'] },
          { name: 'Annual', duration: '12 Months', price: 12000, features: ['Full Access', 'Unlimited PT', 'Diet Plan', 'Priority Support'] },
        ],
        trainers: [
          { name: 'Vikram Patel', specialization: 'Strength & Conditioning', experience: '8 years' },
          { name: 'Anita Roy', specialization: 'Yoga & Flexibility', experience: '5 years' },
          { name: 'Rajesh Kumar', specialization: 'CrossFit & HIIT', experience: '6 years' },
        ],
        openingHours: {
          monday: { open: '05:00', close: '22:00' }, tuesday: { open: '05:00', close: '22:00' },
          wednesday: { open: '05:00', close: '22:00' }, thursday: { open: '05:00', close: '22:00' },
          friday: { open: '05:00', close: '22:00' }, saturday: { open: '06:00', close: '20:00' },
          sunday: { open: '07:00', close: '18:00' },
        },
        femaleFriendly: true, hasAC: true, hasParking: true, hasPersonalTrainer: true, hasCardio: true, hasStrength: true,
        contactPhone: '+91 98765 43210', contactEmail: 'info@ironparadise.com', website: 'https://ironparadise.com',
        ratings: { overall: 4.8, facilities: 4.7, trainers: 4.9, cleanliness: 4.6, environment: 4.8, totalReviews: 3 },
        environmentScore: 4.8, popularity: 150, isVerified: true,
      },
      {
        name: 'FitZone Studio', owner: gymOwner._id,
        description: 'A boutique fitness studio focused on group classes, yoga, and personal training in a welcoming environment.',
        facilities: ['AC', 'Yoga Studio', 'Group Classes', 'Shower', 'Locker Room', 'Wifi'],
        location: { type: 'Point', coordinates: [77.3560, 28.6310], address: 'A-5, Main Road', city: 'Ghaziabad', state: 'UP' },
        membershipPlans: [
          { name: 'Basic', duration: '1 Month', price: 2000, features: ['Studio Access', 'Group Classes'] },
          { name: 'Premium', duration: '3 Months', price: 5500, features: ['Full Access', 'All Classes', 'Diet Plan'] },
        ],
        trainers: [{ name: 'Meera Jain', specialization: 'Yoga & Pilates', experience: '7 years' }],
        openingHours: {
          monday: { open: '06:00', close: '21:00' }, tuesday: { open: '06:00', close: '21:00' },
          wednesday: { open: '06:00', close: '21:00' }, thursday: { open: '06:00', close: '21:00' },
          friday: { open: '06:00', close: '21:00' }, saturday: { open: '07:00', close: '19:00' },
          sunday: { open: '08:00', close: '16:00' },
        },
        femaleFriendly: true, hasAC: true, hasParking: false,
        contactPhone: '+91 98765 43211', contactEmail: 'hello@fitzone.com',
        ratings: { overall: 4.6, facilities: 4.5, trainers: 4.7, cleanliness: 4.8, environment: 4.6, totalReviews: 2 },
        environmentScore: 4.6, popularity: 89, isVerified: false,
      },
      {
        name: 'PowerLift Arena', owner: gymOwner._id,
        description: 'Hardcore strength training gym with competition-grade equipment for serious lifters.',
        facilities: ['Strength Equipment', 'Personal Trainer', 'Parking', 'Locker Room'],
        location: { type: 'Point', coordinates: [77.3700, 28.6250], address: 'D-8, Industrial Area', city: 'Ghaziabad', state: 'UP' },
        membershipPlans: [
          { name: 'Monthly', duration: '1 Month', price: 1200, features: ['Gym Access', 'All Equipment'] },
          { name: 'Quarterly', duration: '3 Months', price: 3000, features: ['Gym Access', 'PT Sessions', 'Diet Plan'] },
        ],
        trainers: [{ name: 'Suresh Rathore', specialization: 'Powerlifting', experience: '10 years' }],
        openingHours: {
          monday: { open: '05:30', close: '23:00' }, tuesday: { open: '05:30', close: '23:00' },
          wednesday: { open: '05:30', close: '23:00' }, thursday: { open: '05:30', close: '23:00' },
          friday: { open: '05:30', close: '23:00' }, saturday: { open: '06:00', close: '22:00' },
          sunday: { open: '06:00', close: '20:00' },
        },
        hasParking: true, hasPersonalTrainer: true, hasStrength: true,
        contactPhone: '+91 98765 43212',
        ratings: { overall: 4.5, facilities: 4.3, trainers: 4.8, cleanliness: 4.2, environment: 4.5, totalReviews: 1 },
        environmentScore: 4.5, popularity: 67,
      },
      {
        name: 'CrossFit Box Elite', owner: gymOwner._id,
        description: 'Premier CrossFit facility with certified coaches and a competitive community atmosphere.',
        facilities: ['CrossFit Zone', 'Personal Trainer', 'Shower', 'Locker Room', 'AC', 'Parking'],
        location: { type: 'Point', coordinates: [77.3250, 28.6350], address: 'C-15, Sector 9', city: 'Ghaziabad', state: 'UP' },
        membershipPlans: [
          { name: 'Standard', duration: '1 Month', price: 3000, features: ['CrossFit Classes', 'Open Gym'] },
          { name: 'Elite', duration: '3 Months', price: 8000, features: ['Unlimited Classes', 'Personal Coaching', 'Nutrition Plan'] },
        ],
        trainers: [
          { name: 'Akash Mehra', specialization: 'CrossFit L2', experience: '6 years' },
          { name: 'Kavita Sharma', specialization: 'Olympic Lifting', experience: '4 years' },
        ],
        openingHours: {
          monday: { open: '06:00', close: '22:00' }, tuesday: { open: '06:00', close: '22:00' },
          wednesday: { open: '06:00', close: '22:00' }, thursday: { open: '06:00', close: '22:00' },
          friday: { open: '06:00', close: '22:00' }, saturday: { open: '07:00', close: '20:00' },
          sunday: { open: '08:00', close: '18:00' },
        },
        hasAC: true, hasParking: true, hasPersonalTrainer: true,
        contactPhone: '+91 98765 43213', website: 'https://crossfitelite.com',
        ratings: { overall: 4.9, facilities: 4.8, trainers: 5.0, cleanliness: 4.9, environment: 4.9, totalReviews: 4 },
        environmentScore: 4.9, popularity: 201, isVerified: true,
      },
      {
        name: 'FlexFit Gym', owner: gymOwner._id,
        description: 'Budget-friendly gym with all essential equipment for a complete workout.',
        facilities: ['Cardio Equipment', 'Strength Equipment'],
        location: { type: 'Point', coordinates: [77.3150, 28.6500], address: 'Shop 12, Market Complex', city: 'Ghaziabad', state: 'UP' },
        membershipPlans: [
          { name: 'Monthly', duration: '1 Month', price: 800, features: ['Gym Access'] },
          { name: 'Quarterly', duration: '3 Months', price: 2000, features: ['Gym Access', 'Free Locker'] },
        ],
        openingHours: {
          monday: { open: '06:00', close: '22:00' }, tuesday: { open: '06:00', close: '22:00' },
          wednesday: { open: '06:00', close: '22:00' }, thursday: { open: '06:00', close: '22:00' },
          friday: { open: '06:00', close: '22:00' }, saturday: { open: '06:00', close: '22:00' },
          sunday: { open: '06:00', close: '22:00' },
        },
        hasCardio: true, hasStrength: true,
        contactPhone: '+91 98765 43214',
        ratings: { overall: 4.3, facilities: 4.0, trainers: 4.0, cleanliness: 4.2, environment: 4.3, totalReviews: 1 },
        popularity: 45,
      },
      {
        name: 'Yoga Bliss Studio', owner: gymOwner._id,
        description: 'A peaceful yoga studio offering various styles including Hatha, Vinyasa, Ashtanga, and meditation classes.',
        facilities: ['Yoga Studio', 'AC', 'Shower', 'Wifi', 'Locker Room'],
        location: { type: 'Point', coordinates: [77.3480, 28.6380], address: 'E-20, Sector 1', city: 'Ghaziabad', state: 'UP' },
        membershipPlans: [
          { name: 'Basic', duration: '1 Month', price: 1800, features: ['3 Classes/Week'] },
          { name: 'Unlimited', duration: '1 Month', price: 2800, features: ['Unlimited Classes', 'Meditation Sessions'] },
        ],
        trainers: [{ name: 'Deepa Nair', specialization: 'Hatha & Ashtanga Yoga', experience: '12 years' }],
        openingHours: {
          monday: { open: '05:00', close: '20:00' }, tuesday: { open: '05:00', close: '20:00' },
          wednesday: { open: '05:00', close: '20:00' }, thursday: { open: '05:00', close: '20:00' },
          friday: { open: '05:00', close: '20:00' }, saturday: { open: '06:00', close: '18:00' },
          sunday: { open: '06:00', close: '16:00' },
        },
        femaleFriendly: true, hasAC: true,
        contactPhone: '+91 98765 43215',
        ratings: { overall: 4.7, facilities: 4.6, trainers: 4.9, cleanliness: 4.8, environment: 4.9, totalReviews: 2 },
        environmentScore: 4.9, popularity: 92, isVerified: true,
      },
    ]);
    console.log(`✅ ${gyms.length} gyms created`);

    // Create Sample Reviews
    await Review.create([
      { gym: gyms[0]._id, user: users[0]._id, rating: { overall: 5, facilities: 5, trainers: 5, cleanliness: 4, environment: 5 }, text: 'Best gym in Vaishali! Equipment is top-notch and trainers are super knowledgeable.' },
      { gym: gyms[0]._id, user: users[1]._id, rating: { overall: 5, facilities: 4, trainers: 5, cleanliness: 5, environment: 5 }, text: 'Great facilities and very clean. Love the yoga classes!' },
      { gym: gyms[0]._id, user: users[2]._id, rating: { overall: 4, facilities: 5, trainers: 4, cleanliness: 4, environment: 4 }, text: 'Amazing gym. Could improve parking but everything else is perfect.' },
      { gym: gyms[1]._id, user: users[1]._id, rating: { overall: 5, facilities: 4, trainers: 5, cleanliness: 5, environment: 5 }, text: 'Love the yoga and pilates classes. The instructors are wonderful!' },
      { gym: gyms[3]._id, user: users[4]._id, rating: { overall: 5, facilities: 5, trainers: 5, cleanliness: 5, environment: 5 }, text: 'Best CrossFit box in the city. Coaches really push you to your limits!' },
    ]);
    console.log('✅ Sample reviews created');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('   Admin:     admin@gymbuddy.com / admin123');
    console.log('   Gym Owner: gymowner@test.com / test123');
    console.log('   User:      amit@test.com / test123');
    console.log('   User:      sneha@test.com / test123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
