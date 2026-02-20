export const APP_PATH = {
  main: '/',
  profile: '/profile',
  bonuses: '/bonuses',
  favorites: '/favorites',
  invite: '/invite',
  slots: '/games/:type',
  slot: '/game/:id',
  play: '/game/:id/play',
} as const;

export const AUTH_REQUIRED_PATHS = [APP_PATH.favorites, APP_PATH.invite, APP_PATH.bonuses] as const;
