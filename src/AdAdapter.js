export default class AdAdapter {
    constructor() {
        this.network = this.detectNetwork();
        console.log('AdAdapter initialized. Network:', this.network);
    }

    detectNetwork() {
        try {
            if (typeof window === 'undefined') return 'browser';
            if (typeof window.mraid !== 'undefined') return 'mraid';
            if (typeof window.FbPlayableAd !== 'undefined') return 'facebook';
            if (typeof window.dapi !== 'undefined') return 'ironsource';
        } catch (error) {
            console.warn('AdAdapter detect failed:', error);
        }
        return 'browser';
    }

    gameReady() {
        try {
            console.log('AdAdapter: Game Ready');
            if (this.network === 'mraid' && typeof window.mraid !== 'undefined') {
                if (window.mraid.getState() === 'loading') {
                    window.mraid.addEventListener('ready', () => {
                        console.log('MRAID Ready');
                    });
                }
            }
        } catch (error) {
            console.warn('AdAdapter gameReady failed:', error);
        }
    }

    gameStarted() {
        try {
            console.log('AdAdapter: Game Started');
        } catch (error) {
            console.warn('AdAdapter gameStarted failed:', error);
        }
    }

    gameEnded() {
        try {
            console.log('AdAdapter: Game Ended');
        } catch (error) {
            console.warn('AdAdapter gameEnded failed:', error);
        }
    }

    install() {
        console.log('AdAdapter: User clicked Install');

        try {
            const storeUrl = 'https://play.google.com/store/apps/details?id=com.example.neonrunner';

            switch (this.network) {
                case 'mraid':
                    if (window.mraid) window.mraid.open(storeUrl);
                    break;
                case 'facebook':
                    if (window.FbPlayableAd) window.FbPlayableAd.onCTAClick();
                    break;
                case 'ironsource':
                    if (window.dapi) window.dapi.openStoreUrl();
                    break;
                default:
                    window.open(storeUrl, '_blank');
                    break;
            }
        } catch (error) {
            console.error('AdAdapter install failed:', error);
            // Fallback
            window.open('https://play.google.com/store/apps/details?id=com.example.neonrunner', '_blank');
        }
    }
}
