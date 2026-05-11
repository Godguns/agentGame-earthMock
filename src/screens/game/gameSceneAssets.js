export const GAME_SCENE_ASSETS = {
  ipad: "https://i.imgant.com/v2/5sh5jII.png",
  iphone: "https://i.imgant.com/v2/RzOwmIE.png",
  ipod: "https://i.imgant.com/v2/zk63zxN.png",
  pc: "https://i.imgant.com/v2/D6XQ04F.png",
  phoneAppChat: "https://i.imgant.com/v2/pE8pu5I.jpeg",
  phoneAppBank: "https://i.imgant.com/v2/VLBu5Kn.jpeg",
  phoneAppPlayer: "https://i.imgant.com/v2/ZJVxO8V.jpeg",
  baseLampOff: "https://i.imgant.com/v2/gWQDlU8.png",
  baseLampOn: "https://i.imgant.com/v2/nZBnBis.png",
  weatherCloudy: "https://i.imgant.com/v2/DtJQp19.jpeg",
  weatherSunny: "https://i.imgant.com/v2/SY0lPqn.jpeg",
  weatherSunset: "https://i.imgant.com/v2/8wXpaIa.jpeg",
  weatherSnow: "https://i.imgant.com/v2/nVu5WRX.jpeg",
  weatherNight: "https://i.imgant.com/v2/0vedPeD.png",
  weatherRain: "https://i.imgant.com/v2/6SqafUq.jpeg",
};

export const GAME_SCENE_PRELOAD_URLS = [
  GAME_SCENE_ASSETS.ipad,
  GAME_SCENE_ASSETS.iphone,
  GAME_SCENE_ASSETS.ipod,
  GAME_SCENE_ASSETS.pc,
  GAME_SCENE_ASSETS.phoneAppChat,
  GAME_SCENE_ASSETS.phoneAppBank,
  GAME_SCENE_ASSETS.phoneAppPlayer,
  GAME_SCENE_ASSETS.baseLampOff,
  GAME_SCENE_ASSETS.baseLampOn,
  GAME_SCENE_ASSETS.weatherCloudy,
  GAME_SCENE_ASSETS.weatherSunny,
  GAME_SCENE_ASSETS.weatherSunset,
  GAME_SCENE_ASSETS.weatherSnow,
  GAME_SCENE_ASSETS.weatherNight,
  GAME_SCENE_ASSETS.weatherRain,
];

let preloadPromise = null;

function preloadImage(url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.loading = "eager";
    image.onload = () => resolve(url);
    image.onerror = () => resolve(url);
    image.src = url;
  });
}

export function preloadGameSceneAssets() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (!preloadPromise) {
    preloadPromise = Promise.all(
      GAME_SCENE_PRELOAD_URLS.map((url) => preloadImage(url)),
    ).then(() => undefined);
  }

  return preloadPromise;
}
