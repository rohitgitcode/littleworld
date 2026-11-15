import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  calculateRewards,
  calculateLevelUp,
  getRankForLevel,
  getXpNeededForLevel,
  getLocalDateString,
  getISOWeekString,
  getDaysBetween,
  generateDailyChallenges,
  generateWeeklyChallenges,
  ACHIEVEMENTS,
  THEMES,
  STORAGE_KEY,
  DEFAULT_SAVE,
} from './rules';

// Safe localStorage loader with auto-fallback on corruption and date-sync
const loadSaveData = () => {
  const today = getLocalDateString();
  const thisWeek = getISOWeekString();

  let state = DEFAULT_SAVE;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1 && typeof parsed === 'object') {
        state = {
          ...DEFAULT_SAVE,
          ...parsed,
          player: { ...DEFAULT_SAVE.player, ...(parsed.player || {}) },
          plays: { ...DEFAULT_SAVE.plays, ...(parsed.plays || {}) },
          personalBests: { ...DEFAULT_SAVE.personalBests, ...(parsed.personalBests || {}) },
          streak: { ...DEFAULT_SAVE.streak, ...(parsed.streak || {}) },
          challenges: { ...DEFAULT_SAVE.challenges, ...(parsed.challenges || {}) },
          cosmetics: { ...DEFAULT_SAVE.cosmetics, ...(parsed.cosmetics || {}) },
          settings: { ...DEFAULT_SAVE.settings, ...(parsed.settings || {}) },
          onboardingCompleted: Boolean(parsed.onboardingCompleted),
          processedRunIds: Array.isArray(parsed.processedRunIds) ? parsed.processedRunIds : [],
        };
      }
    }
  } catch {
    state = DEFAULT_SAVE;
  }

  // Ensure daily & weekly challenges are seeded for today & this week
  const ch = { ...state.challenges };
  if (ch.lastDailyDate !== today || !ch.dailies?.length) {
    ch.lastDailyDate = today;
    ch.dailies = generateDailyChallenges(today);
  }
  if (ch.lastWeeklyWeek !== thisWeek || !ch.weeklies?.length) {
    ch.lastWeeklyWeek = thisWeek;
    ch.weeklies = generateWeeklyChallenges(thisWeek);
  }
  state.challenges = ch;

  return state;
};

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [data, setData] = useState(() => loadSaveData());

  // Save to localStorage whenever data changes
  const persist = useCallback((newData) => {
    setData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch {
      // Storage quota or restriction safety
    }
  }, []);

  // Sync active theme to root document attribute
  useEffect(() => {
    const activeTheme = data.cosmetics?.activeTheme || 'default';
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [data.cosmetics?.activeTheme]);

  // Single entry point called once when any game concludes
  const submitResult = useCallback(({ id, game, stats }) => {
    if (!id || !game) return { error: 'Invalid run submission' };

    // Prevent double rewards for the same run ID
    if (data.processedRunIds.includes(id)) {
      return { alreadyProcessed: true };
    }

    const today = getLocalDateString();
    const thisWeek = getISOWeekString();

    // 1. Calculate XP & Coin rewards
    const { xpEarned, coinsEarned } = calculateRewards(game, stats);

    // 2. Calculate leveling with multi-level burst support
    const levelRes = calculateLevelUp(data.level, data.currentLevelXp, xpEarned);

    // 3. Update personal bests & flag new best
    let newBest = false;
    const currentPBs = { ...data.personalBests };
    const gamePB = { ...(currentPBs[game] || {}) };
    const runScore = stats?.score || 0;

    if (runScore > (gamePB.score || 0)) {
      newBest = true;
      gamePB.score = runScore;
    }

    if (game === 'reaction-reactor') {
      const bestRt = stats?.bestRt || 0;
      if (bestRt > 0 && (!gamePB.bestRt || bestRt < gamePB.bestRt)) {
        gamePB.bestRt = bestRt;
      }
      gamePB.accuracy = Math.max(gamePB.accuracy || 0, stats?.accuracy || 0);
    } else if (game === 'memory-maze') {
      const longest = stats?.longest || stats?.level || 0;
      gamePB.longest = Math.max(gamePB.longest || 0, longest);
      gamePB.level = Math.max(gamePB.level || 0, stats?.level || 0);
    } else if (game === 'pattern-panic') {
      gamePB.correct = Math.max(gamePB.correct || 0, stats?.correct || 0);
      gamePB.accuracy = Math.max(gamePB.accuracy || 0, stats?.accuracy || 0);
    } else if (game === 'tower' || game === 'challenge-tower') {
      const rankOrder = { D: 1, C: 2, B: 3, A: 4, S: 5 };
      if ((rankOrder[stats?.rank] || 0) > (rankOrder[gamePB.rank] || 0)) {
        gamePB.rank = stats?.rank;
      }
    }
    currentPBs[game] = gamePB;

    // 4. Update play counts
    const updatedPlays = {
      ...data.plays,
      [game]: (data.plays[game] || 0) + 1,
    };
    const newGamesPlayed = data.gamesPlayed + 1;

    // 5. Update Streak (consecutive local days)
    const lastDate = data.streak.lastPlayDate;
    let newCurrentStreak = data.streak.current || 0;

    if (!lastDate) {
      newCurrentStreak = 1;
    } else if (lastDate === today) {
      // Already played today, preserve current streak
    } else {
      const daysDiff = getDaysBetween(lastDate, today);
      if (daysDiff === 1) {
        newCurrentStreak += 1;
      } else {
        // Gap of >1 days resets streak only, progress remains intact
        newCurrentStreak = 1;
      }
    }
    const newBestStreak = Math.max(data.streak.best || 0, newCurrentStreak);

    // 6. Update Active Challenges Progress
    let activeDailies = data.challenges.lastDailyDate === today && data.challenges.dailies?.length
      ? [...data.challenges.dailies]
      : generateDailyChallenges(today);

    let activeWeeklies = data.challenges.lastWeeklyWeek === thisWeek && data.challenges.weeklies?.length
      ? [...data.challenges.weeklies]
      : generateWeeklyChallenges(thisWeek);

    let dailyCompleted = 0;

    const advanceChallenges = (list) =>
      list.map((c) => {
        if (c.completed) return c;
        let inc = 0;
        if (c.game === 'any' || c.game === game) {
          if (c.type === 'plays') inc = 1;
          if (c.type === 'score') inc = runScore;
          if (c.type === 'level') inc = stats?.level || 0;
          if (c.type === 'correct') inc = stats?.correct || 0;
        }

        const newProg = c.type === 'score' || c.type === 'level'
          ? Math.max(c.progress, inc)
          : c.progress + inc;

        const isNowDone = newProg >= c.target;
        if (isNowDone && !c.completed) dailyCompleted += 1;

        return {
          ...c,
          progress: newProg,
          completed: isNowDone,
        };
      });

    activeDailies = advanceChallenges(activeDailies);
    activeWeeklies = advanceChallenges(activeWeeklies);

    // 7. Check Achievements
    const unlockedAchievements = [];
    let achievementCoinBonus = 0;
    const updatedAchievements = { ...data.achievements };

    ACHIEVEMENTS.forEach((ach) => {
      if (updatedAchievements[ach.id]) return; // already unlocked

      let unlock = false;
      if (ach.id === 'first_game' && newGamesPlayed >= 1) unlock = true;
      if (ach.id === 'quick_hands' && game === 'reaction-reactor') {
        if (runScore >= 120 || (stats?.bestRt > 0 && stats?.bestRt <= 300)) unlock = true;
      }
      if (ach.id === 'sharp_memory' && game === 'memory-maze' && (stats?.level || 0) >= 5) {
        unlock = true;
      }
      if (ach.id === 'pattern_master' && game === 'pattern-panic' && (stats?.correct || 0) >= 6) {
        unlock = true;
      }
      if (ach.id === 'arcade_veteran' && newGamesPlayed >= 25) unlock = true;
      if (ach.id === 'streak_3' && newCurrentStreak >= 3) unlock = true;
      if (ach.id === 'tower_climber' && (game === 'tower' || game === 'challenge-tower')) unlock = true;
      if (ach.id === 'tower_s_rank' && (game === 'tower' || game === 'challenge-tower') && stats?.rank === 'S') unlock = true;

      if (unlock) {
        updatedAchievements[ach.id] = { unlocked: true, unlockedAt: today };
        unlockedAchievements.push(ach);
        achievementCoinBonus += ach.rewardCoins;
      }
    });

    // 8. Final state construction (Coins and XP never negative/NaN)
    const newTotalCoins = Math.max(0, data.coins + coinsEarned + achievementCoinBonus);
    const newTotalXp = Math.max(0, data.totalXp + xpEarned);

    const nextState = {
      ...data,
      level: levelRes.level,
      currentLevelXp: levelRes.currentXp,
      totalXp: newTotalXp,
      coins: newTotalCoins,
      gamesPlayed: newGamesPlayed,
      plays: updatedPlays,
      personalBests: currentPBs,
      streak: {
        current: newCurrentStreak,
        best: newBestStreak,
        lastPlayDate: today,
      },
      achievements: updatedAchievements,
      challenges: {
        lastDailyDate: today,
        dailies: activeDailies,
        lastWeeklyWeek: thisWeek,
        weeklies: activeWeeklies,
      },
      processedRunIds: [...data.processedRunIds.slice(-99), id], // Store last 100 run IDs
      player: {
        ...data.player,
        title: getRankForLevel(levelRes.level),
      },
    };

    persist(nextState);

    return {
      xpEarned,
      coinsEarned: coinsEarned + achievementCoinBonus,
      leveledUp: levelRes.leveledUp,
      newLevel: levelRes.level,
      levelsGained: levelRes.levelsGained,
      newBest,
      unlockedAchievements,
      dailyCompleted,
    };
  }, [data, persist]);

  // Claim completed challenge coins (claimed once, never twice)
  const claimChallenge = useCallback((instanceId) => {
    let claimedCoinReward = 0;

    const claimFromList = (list) =>
      list.map((c) => {
        if (c.instanceId === instanceId && c.completed && !c.claimed) {
          claimedCoinReward = c.reward;
          return { ...c, claimed: true };
        }
        return c;
      });

    const updatedDailies = claimFromList(data.challenges.dailies || []);
    const updatedWeeklies = claimFromList(data.challenges.weeklies || []);

    if (claimedCoinReward > 0) {
      persist({
        ...data,
        coins: Math.max(0, data.coins + claimedCoinReward),
        challenges: {
          ...data.challenges,
          dailies: updatedDailies,
          weeklies: updatedWeeklies,
        },
      });
      return { success: true, reward: claimedCoinReward };
    }
    return { success: false };
  }, [data, persist]);

  // Buy a theme safely
  const buyTheme = useCallback((themeId) => {
    const theme = THEMES.find((t) => t.id === themeId);
    if (!theme) return { success: false, reason: 'Theme not found' };

    const unlocked = data.cosmetics?.unlockedThemes || ['default'];
    if (unlocked.includes(themeId)) {
      // Already owned, simply select it
      persist({
        ...data,
        cosmetics: {
          ...data.cosmetics,
          activeTheme: themeId,
        },
      });
      return { success: true, alreadyOwned: true };
    }

    // Check balance
    if (data.coins < theme.cost) {
      return { success: false, reason: 'Insufficient coins' };
    }

    // Deduct coins safely, never NaN or negative
    const newCoins = Math.max(0, data.coins - theme.cost);
    const newUnlocked = [...unlocked, themeId];

    persist({
      ...data,
      coins: newCoins,
      cosmetics: {
        unlockedThemes: newUnlocked,
        activeTheme: themeId,
      },
    });

    return { success: true, cost: theme.cost };
  }, [data, persist]);

  // Select an already unlocked theme
  const selectTheme = useCallback((themeId) => {
    const unlocked = data.cosmetics?.unlockedThemes || ['default'];
    if (unlocked.includes(themeId)) {
      persist({
        ...data,
        cosmetics: {
          ...data.cosmetics,
          activeTheme: themeId,
        },
      });
      return true;
    }
    return false;
  }, [data, persist]);

  // Update player profile fields (name, avatar)
  const updatePlayer = useCallback((fields) => {
    persist({
      ...data,
      player: {
        ...data.player,
        ...fields,
      },
    });
  }, [data, persist]);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    persist({
      ...data,
      settings: {
        ...data.settings,
        ...newSettings,
      },
    });
  }, [data, persist]);

  // Complete onboarding
  const completeOnboarding = useCallback((name, avatar) => {
    persist({
      ...data,
      onboardingCompleted: true,
      player: {
        ...data.player,
        name: name || data.player.name,
        avatar: avatar || data.player.avatar,
      },
    });
  }, [data, persist]);

  // Reset to default
  const resetProgress = useCallback(() => {
    persist(DEFAULT_SAVE);
  }, [persist]);

  const value = useMemo(() => ({
    saveData: data,
    player: {
      ...data.player,
      level: data.level,
      coins: data.coins,
      currentLevelXp: data.currentLevelXp,
      xpNeeded: getXpNeededForLevel(data.level),
      totalXp: data.totalXp,
      gamesPlayed: data.gamesPlayed,
      title: getRankForLevel(data.level),
    },
    submitResult,
    claimChallenge,
    buyTheme,
    selectTheme,
    updatePlayer,
    updateSettings,
    completeOnboarding,
    resetProgress,
  }), [data, submitResult, claimChallenge, buyTheme, selectTheme, updatePlayer, updateSettings, completeOnboarding, resetProgress]);

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
