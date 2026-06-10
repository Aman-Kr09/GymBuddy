from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import uvicorn

app = FastAPI(title="GymBuddy ML Recommendation Service", version="1.0.0")

# Predefined goals mapping to index
GOALS_LIST = [
    "Muscle Gain", "Weight Loss", "Yoga", "Bodybuilding", 
    "CrossFit", "Cardio", "General Fitness", "Strength Training", "Powerlifting"
]
GOAL_TO_IDX = {goal.lower(): idx for idx, goal in enumerate(GOALS_LIST)}

# Predefined interests list mapping to index
INTERESTS_LIST = [
    "Morning Workout", "Evening Workout", "Home Workout", "Gym Workout",
    "Diet Planning", "Cycling", "Running", "Pilates", "HIIT"
]
INTEREST_TO_IDX = {interest.lower(): idx for idx, interest in enumerate(INTERESTS_LIST)}

TIMES_LIST = ["morning", "afternoon", "evening", "night"]
TIME_TO_IDX = {time: idx for idx, time in enumerate(TIMES_LIST)}

LEVELS_LIST = ["beginner", "intermediate", "advanced"]
LEVEL_TO_IDX = {lvl: idx for idx, lvl in enumerate(LEVELS_LIST)}

class UserProfile(BaseModel):
    id: str
    gender: str
    age: int
    fitnessGoals: List[str] = []
    interests: List[str] = []
    experienceLevel: str = "beginner"
    preferredWorkoutTime: str = "morning"
    genderPreference: str = "any"
    location: Optional[Dict[str, Any]] = None

class GymProfile(BaseModel):
    id: str
    name: str
    facilities: List[str] = []
    location: Dict[str, Any]
    membershipPlans: List[Dict[str, Any]] = []
    ratings: Dict[str, float] = {}
    femaleFriendly: bool = False
    popularity: int = 0

class GymRecommendRequest(BaseModel):
    user: UserProfile
    gyms: List[GymProfile]

class BuddyRecommendRequest(BaseModel):
    user: UserProfile
    candidates: List[UserProfile]

def encode_user(user: UserProfile) -> np.ndarray:
    # 9 goals, 9 interests, 4 times, 3 levels = 25 dimensions
    vec = np.zeros(25)
    
    # Encode goals
    for goal in user.fitnessGoals:
        g_lower = goal.lower()
        if g_lower in GOAL_TO_IDX:
            vec[GOAL_TO_IDX[g_lower]] = 1.0
            
    # Encode interests
    for interest in user.interests:
        i_lower = interest.lower()
        if i_lower in INTEREST_TO_IDX:
            vec[9 + INTEREST_TO_IDX[i_lower]] = 1.0
            
    # Encode time
    t_lower = user.preferredWorkoutTime.lower()
    if t_lower in TIME_TO_IDX:
        vec[18 + TIME_TO_IDX[t_lower]] = 1.0
        
    # Encode level
    l_lower = user.experienceLevel.lower()
    if l_lower in LEVEL_TO_IDX:
        vec[22 + LEVEL_TO_IDX[l_lower]] = 1.0
        
    return vec

@app.post("/recommend/buddies")
async def recommend_buddies(request: BuddyRecommendRequest):
    try:
        user = request.user
        candidates = request.candidates
        if not candidates:
            return {"success": True, "buddies": []}
            
        user_vec = encode_user(user).reshape(1, -1)
        candidate_vecs = np.array([encode_user(c) for c in candidates])
        
        # Calculate cosine similarity
        similarities = cosine_similarity(user_vec, candidate_vecs)[0]
        
        results = []
        for idx, candidate in enumerate(candidates):
            # Base similarity score from profile features (60%)
            base_score = similarities[idx] * 60
            
            # Age proximity score (15%)
            age_diff = abs(user.age - candidate.age)
            age_score = max(0, 1 - (age_diff / 20)) * 15
            
            # Gender match filter/score
            gender_score = 25
            if user.genderPreference != "any" and candidate.gender != user.genderPreference:
                gender_score = 0
            if candidate.genderPreference != "any" and user.gender != candidate.genderPreference:
                gender_score = 0
                
            total_compatibility = round(base_score + age_score + gender_score)
            total_compatibility = max(10, min(100, total_compatibility))
            
            # Distance
            distance_str = "N/A"
            if user.location and candidate.location:
                u_coords = user.location.get("coordinates", [0, 0])
                c_coords = candidate.location.get("coordinates", [0, 0])
                if len(u_coords) == 2 and len(c_coords) == 2 and u_coords != [0,0] and c_coords != [0,0]:
                    # Haversine distance
                    R = 6371.0 # Earth radius
                    lon1, lat1 = np.radians(u_coords[0]), np.radians(u_coords[1])
                    lon2, lat2 = np.radians(c_coords[0]), np.radians(c_coords[1])
                    dlon = lon2 - lon1
                    dlat = lat2 - lat1
                    a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
                    c = 2 * np.arcsin(np.sqrt(a))
                    distance = R * c
                    if distance < 1:
                        distance_str = f"{round(distance * 1000)} m"
                    else:
                        distance_str = f"{distance:.1f} km"
            
            results.append({
                "id": candidate.id,
                "compatibility": total_compatibility,
                "distance": distance_str
            })
            
        # Sort by compatibility
        results.sort(key=lambda x: x["compatibility"], reverse=True)
        return {"success": True, "buddies": results}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend/gyms")
async def recommend_gyms(request: GymRecommendRequest):
    try:
        user = request.user
        gyms = request.gyms
        if not gyms:
            return {"success": True, "gyms": []}
            
        # Match gym facilities against user goals
        # Map goals to ideal gym facilities
        goal_to_facilities = {
            "yoga": ["yoga studio", "ac"],
            "crossfit": ["crossfit zone", "personal trainer"],
            "cardio": ["cardio equipment", "ac"],
            "strength training": ["strength equipment", "personal trainer"],
            "bodybuilding": ["strength equipment", "personal trainer", "locker room"],
            "powerlifting": ["strength equipment"]
        }
        
        needed_facilities = set()
        for goal in user.fitnessGoals:
            g_lower = goal.lower()
            if g_lower in goal_to_facilities:
                needed_facilities.update(goal_to_facilities[g_lower])
                
        results = []
        for gym in gyms:
            score = 0.0
            
            # Rating weight (30%)
            overall_rating = gym.ratings.get("overall", 0.0)
            score += (overall_rating / 5.0) * 30
            
            # Popularity weight (15%)
            score += min(gym.popularity / 100.0, 1.0) * 15
            
            # Facilities match weight (25%)
            gym_facs = {f.lower() for f in gym.facilities}
            if needed_facilities:
                matches = len(needed_facilities.intersection(gym_facs))
                score += (matches / len(needed_facilities)) * 25
            else:
                score += 15 # baseline if no goals
                
            # Price match weight (15%)
            price = 5000
            if gym.membershipPlans:
                price = gym.membershipPlans[0].get("price", 5000)
            score += max(0, 1 - (price / 5000.0)) * 15
            
            # Distance weight (15%)
            if user.location and gym.location:
                u_coords = user.location.get("coordinates", [0, 0])
                g_coords = gym.location.get("coordinates", [0, 0])
                if len(u_coords) == 2 and len(g_coords) == 2 and u_coords != [0,0] and g_coords != [0,0]:
                    R = 6371.0
                    lon1, lat1 = np.radians(u_coords[0]), np.radians(u_coords[1])
                    lon2, lat2 = np.radians(g_coords[0]), np.radians(g_coords[1])
                    a = np.sin((lat2-lat1)/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin((lon2-lon1)/2)**2
                    dist = R * 2 * np.arcsin(np.sqrt(a))
                    score += max(0, 1 - (dist / 10.0)) * 15
                    
            results.append({
                "id": gym.id,
                "recommendationScore": round(score)
            })
            
        results.sort(key=lambda x: x["recommendationScore"], reverse=True)
        return {"success": True, "gyms": results}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
