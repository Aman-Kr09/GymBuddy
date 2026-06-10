import dotenv from 'dotenv';

dotenv.config();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Get gym recommendations from Python ML microservice
 * @param {Object} user 
 * @param {Array} gyms 
 * @returns {Promise<Array|null>} list of recommended gym IDs with scores, or null if service offline
 */
export const getMLGymRecommendations = async (user, gyms) => {
  try {
    const formattedUser = {
      id: user._id.toString(),
      gender: user.gender || 'male',
      age: user.age || 25,
      fitnessGoals: user.fitnessGoals || [],
      interests: user.interests || [],
      experienceLevel: user.experienceLevel || 'beginner',
      preferredWorkoutTime: user.preferredWorkoutTime || 'morning',
      genderPreference: user.genderPreference || 'any',
      location: user.location ? {
        coordinates: user.location.coordinates || [0, 0]
      } : null
    };

    const formattedGyms = gyms.map(gym => ({
      id: gym._id.toString(),
      name: gym.name,
      facilities: gym.facilities || [],
      location: {
        coordinates: gym.location?.coordinates || [0, 0]
      },
      membershipPlans: gym.membershipPlans || [],
      ratings: {
        overall: gym.ratings?.overall || 0,
        facilities: gym.ratings?.facilities || 0,
        trainers: gym.ratings?.trainers || 0,
        cleanliness: gym.ratings?.cleanliness || 0,
        environment: gym.ratings?.environment || 0,
      },
      femaleFriendly: gym.femaleFriendly || false,
      popularity: gym.popularity || 0
    }));

    const response = await fetch(`${ML_SERVICE_URL}/recommend/gyms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: formattedUser,
        gyms: formattedGyms
      }),
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });

    if (!response.ok) {
      throw new Error(`ML Service responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.gyms; // Array of { id, recommendationScore }
  } catch (error) {
    console.warn('⚠️ ML service recommendation failed, using Node.js fallback:', error.message);
    return null;
  }
};

/**
 * Get buddy recommendations from Python ML microservice
 * @param {Object} user 
 * @param {Array} candidates 
 * @returns {Promise<Array|null>} list of buddy IDs with scores/distances, or null if service offline
 */
export const getMLBuddyRecommendations = async (user, candidates) => {
  try {
    const formattedUser = {
      id: user._id.toString(),
      gender: user.gender || 'male',
      age: user.age || 25,
      fitnessGoals: user.fitnessGoals || [],
      interests: user.interests || [],
      experienceLevel: user.experienceLevel || 'beginner',
      preferredWorkoutTime: user.preferredWorkoutTime || 'morning',
      genderPreference: user.genderPreference || 'any',
      location: user.location ? {
        coordinates: user.location.coordinates || [0, 0]
      } : null
    };

    const formattedCandidates = candidates.map(c => ({
      id: c._id.toString(),
      gender: c.gender || 'male',
      age: c.age || 25,
      fitnessGoals: c.fitnessGoals || [],
      interests: c.interests || [],
      experienceLevel: c.experienceLevel || 'beginner',
      preferredWorkoutTime: c.preferredWorkoutTime || 'morning',
      genderPreference: c.genderPreference || 'any',
      location: c.location ? {
        coordinates: c.location.coordinates || [0, 0]
      } : null
    }));

    const response = await fetch(`${ML_SERVICE_URL}/recommend/buddies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: formattedUser,
        candidates: formattedCandidates
      }),
      signal: AbortSignal.timeout(2000)
    });

    if (!response.ok) {
      throw new Error(`ML Service responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.buddies; // Array of { id, compatibility, distance }
  } catch (error) {
    console.warn('⚠️ ML service buddy recommendation failed, using Node.js fallback:', error.message);
    return null;
  }
};
