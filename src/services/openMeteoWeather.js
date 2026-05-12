const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast";

const RAIN_CODES = new Set([
  51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99,
]);
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);
const CLOUDY_CODES = new Set([1, 2, 3, 45, 48]);

export function getWeatherDisplayName(sceneId) {
  return (
    {
      sunny: "晴天",
      cloudy: "多云",
      sunset: "晚霞",
      rain: "雨天",
      snow: "雪天",
      night: "夜晚",
    }[sceneId] || "多云"
  );
}

function getHourFromWeatherTime(timeValue) {
  if (typeof timeValue !== "string") {
    return 12;
  }

  const match = timeValue.match(/T(\d{2}):/);
  return match ? Number.parseInt(match[1], 10) : 12;
}

function mapWeatherCodeToScene(weatherCode, isDay, timeValue) {
  if (SNOW_CODES.has(weatherCode)) {
    return "snow";
  }

  if (RAIN_CODES.has(weatherCode)) {
    return "rain";
  }

  if (!isDay) {
    return "night";
  }

  const hour = getHourFromWeatherTime(timeValue);
  if ((weatherCode === 0 || weatherCode === 1 || weatherCode === 2) && hour >= 17 && hour < 20) {
    return "sunset";
  }

  if (weatherCode === 0 || weatherCode === 1) {
    return "sunny";
  }

  if (CLOUDY_CODES.has(weatherCode)) {
    return "cloudy";
  }

  return "cloudy";
}

function describeWeather(sceneId, temperature) {
  const temperatureLabel =
    typeof temperature === "number" ? `${Math.round(temperature)}°C` : "温度待同步";

  const copyByScene = {
    sunny: `阳光比较亮，窗外的空气像刚刚醒过来。现在约 ${temperatureLabel}。`,
    cloudy: `云层压得低一些，窗外的节奏显得更安静。现在约 ${temperatureLabel}。`,
    sunset: `傍晚的颜色正在慢慢落下来，像一天还没说完的话。现在约 ${temperatureLabel}。`,
    rain: `雨意很明显，玻璃外像有人替你把情绪说得更轻。现在约 ${temperatureLabel}。`,
    snow: `光线和声音都被雪吃掉了一些，世界像被按低了音量。现在约 ${temperatureLabel}。`,
    night: `夜色已经落稳，房间外的世界只剩下稀薄的轮廓。现在约 ${temperatureLabel}。`,
  };

  return copyByScene[sceneId] || copyByScene.cloudy;
}

export async function fetchLiveWeather(location) {
  if (!location?.latitude || !location?.longitude) {
    throw new Error("Missing location coordinates");
  }

  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: location.timezone || "Asia/Shanghai",
    current: "temperature_2m,apparent_temperature,weather_code,is_day",
  });

  const response = await fetch(`${OPEN_METEO_BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Weather request failed with ${response.status}`);
  }

  const data = await response.json();
  const current = data?.current;
  if (!current) {
    throw new Error("Weather payload is missing current conditions");
  }

  const sceneId = mapWeatherCodeToScene(
    current.weather_code,
    Boolean(current.is_day),
    current.time,
  );

  return {
    sceneId,
    sceneLabel: getWeatherDisplayName(sceneId),
    cityLabel: location.city,
    provinceLabel: location.province,
    locationLabel: location.label || `${location.province} · ${location.city}`,
    temperature: typeof current.temperature_2m === "number" ? current.temperature_2m : null,
    apparentTemperature:
      typeof current.apparent_temperature === "number"
        ? current.apparent_temperature
        : null,
    weatherCode: current.weather_code,
    isDay: Boolean(current.is_day),
    updatedAt: current.time || "",
    mood: describeWeather(sceneId, current.temperature_2m),
  };
}
