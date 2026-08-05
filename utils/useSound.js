import { createAudioPlayer } from 'expo-audio';

const completeSound = createAudioPlayer(
    require('../assets/sounds/complete-jvanko_2600-attack-jingle-sound-effect-jvanko-125083.mp3')
);

const levelUpSound = createAudioPlayer(
    require('../assets/sounds/levelup-achievement-unlock-243762.mp3')
);

const statsSound = createAudioPlayer(
    require('../assets/sounds/stats-stadiyodguard-fire-magic-5-378639.mp3')
);

const initSound = createAudioPlayer(
    require('../assets/sounds/init-sound-appear-magic-384915.mp3')
);

export const UseSound = {
    completeHabit: () => {
        completeSound.seekTo(0);
        completeSound.play();
    },

    levelUp: () => {
        levelUpSound.seekTo(0)
        levelUpSound.play()
    },

    stats: () => {
        statsSound.seekTo(0)
        statsSound.play()
    },

    init: () => {
        initSound.seekTo(0)
        statsSound.play()
    }


};