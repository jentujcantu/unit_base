/**
 * API module for communicating with the backend server
 */

const API_BASE_URL = 'http://localhost:4000';

/**
 * Submit a score to the backend
 * @param {string} name - Player name
 * @param {number} score - Player score
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function submitScore(name, score) {
  try {
    const response = await fetch(`${API_BASE_URL}/score`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        name: name.trim(), 
        score: Math.floor(score) 
      })
    });
    
    if (response.ok) {
      console.log(`Score submitted successfully: ${name} - ${score}`);
      return true;
    } else {
      console.error('Failed to submit score:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error submitting score:', error);
    return false;
  }
}

/**
 * Get top 10 scores from the backend
 * @returns {Promise<Array>} Array of score objects with name and score properties
 */
export async function getTopScores() {
  try {
    const response = await fetch(`${API_BASE_URL}/top10`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const scores = await response.json();
    console.log(`Loaded ${scores.length} scores from leaderboard`);
    return scores;
    
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    // Return empty array as fallback
    return [];
  }
}

/**
 * Check if the backend server is reachable
 * @returns {Promise<boolean>} True if server is reachable, false otherwise
 */
export async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/top10`);
    return response.ok;
  } catch (error) {
    console.warn('Backend server not reachable:', error.message);
    return false;
  }
}

/**
 * Get player's rank for a given score (without submitting)
 * @param {number} score - Score to check rank for
 * @returns {Promise<number|null>} Rank (1-based) or null if error
 */
export async function getScoreRank(score) {
  try {
    const scores = await getTopScores();
    if (scores.length === 0) return 1; // First player
    
    // Find where this score would rank
    let rank = 1;
    for (const entry of scores) {
      if (score <= entry.score) {
        rank++;
      } else {
        break;
      }
    }
    
    return rank;
  } catch (error) {
    console.error('Error calculating score rank:', error);
    return null;
  }
}

/**
 * Submit score and get updated leaderboard in one call
 * @param {string} name - Player name
 * @param {number} score - Player score
 * @returns {Promise<Array>} Updated leaderboard or empty array if error
 */
export async function submitScoreAndGetLeaderboard(name, score) {
  const submitResult = await submitScore(name, score);
  
  if (submitResult) {
    // Wait a brief moment for the database to update
    await new Promise(resolve => setTimeout(resolve, 100));
    return await getTopScores();
  } else {
    // Still return leaderboard even if submission failed
    return await getTopScores();
  }
} 