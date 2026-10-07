// ========================================
// Weather Dashboard
// Vanilla JavaScript (ES6+)
// ========================================

"use strict";

/* ========================================
   1. DOM references
   ======================================== */

const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");

const dashboard = document.getElementById("dashboard");
const emptyState = document.getElementById("empty-state");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const errorText = document.getElementById("error-text");

const currentEl = document.getElementById("current");
const currentCity = document.getElementById("current-city");
const currentDate = document.getElementById("current-date");
const currentIcon = document.getElementById("current-icon");
const currentTemp = document.getElementById("current-temp");
const currentCondition = document.getElementById("current-condition");
const currentFeels = document.getElementById("current-feels");
const currentHumidity = document.getElementById("current-humidity");
const currentWind = document.getElementById("current-wind");

const forecastEl = document.getElementById("forecast");
const forecastGrid = document.getElementById("forecast-grid");

/* ========================================
   2. API functions
   ======================================== */

// Convert a city name into coordinates using the Open-Meteo geocoding API.
async function getCoordinates(city) {
    const url =
        "https://geocoding-api.open-meteo.com/v1/search" +
        `?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Geocoding service is unavailable. Please try again.");
    }

    const data = await response.json();

    // No results means the city name could not be found.
    if (!data.results || data.results.length === 0) {
        throw new Error(`We couldn't find "${city}". Check the spelling and try again.`);
    }

    const place = data.results[0];
    return {
        latitude: place.latitude,
        longitude: place.longitude,
        name: place.name,
        country: place.country,
    };
}

// Fetch current weather and daily forecast for the given coordinates.
async function getWeather(latitude, longitude) {
    const url =
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${latitude}&longitude=${longitude}` +
        "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" +
        "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
        "&timezone=auto" +
        "&forecast_days=5";

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Weather service is unavailable. Please try again.");
    }

    return response.json();
}

/* ========================================
   3. Data processing / helper functions
   ======================================== */

// Convert a WMO weather code into a readable condition and an emoji icon.
function getWeatherInfo(code) {
    if (code === 0) return { condition: "Clear sky", icon: "☀️" };
    if (code === 1) return { condition: "Mainly clear", icon: "🌤️" };
    if (code === 2) return { condition: "Partly cloudy", icon: "⛅" };
    if (code === 3) return { condition: "Overcast", icon: "☁️" };
    if (code === 45 || code === 48) return { condition: "Fog", icon: "🌫️" };

    if (code >= 51 && code <= 57) return { condition: "Drizzle", icon: "🌦️" };

    if (code >= 61 && code <= 67) return { condition: "Rain", icon: "🌧️" };
    if (code >= 80 && code <= 82) return { condition: "Rain showers", icon: "🌧️" };

    if (code >= 71 && code <= 77) return { condition: "Snow", icon: "❄️" };
    if (code === 85 || code === 86) return { condition: "Snow showers", icon: "🌨️" };

    if (code === 95) return { condition: "Thunderstorm", icon: "⛈️" };
    if (code === 96 || code === 99) return { condition: "Thunderstorm with hail", icon: "⛈️" };

    return { condition: "Unknown", icon: "❓" };
}

// Build a Date from a "YYYY-MM-DD" string, treated as UTC so the
// displayed weekday never shifts because of the viewer's timezone.
function dateFromString(dateString) {
    return new Date(`${dateString}T00:00:00Z`);
}

// Format the full date, e.g. "Monday, January 1, 2024".
function formatFullDate(dateString) {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    }).format(dateFromString(dateString));
}

// Format just the weekday, e.g. "Monday".
function formatWeekday(dateString) {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        timeZone: "UTC",
    }).format(dateFromString(dateString));
}

// Format a shorter date, e.g. "Jan 1".
function formatShortDate(dateString) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
    }).format(dateFromString(dateString));
}

// Round a temperature value and add the degree symbol.
function formatTemp(value) {
    return `${Math.round(value)}°`;
}

/* ========================================
   4. Loading / error handling
   ======================================== */

// Hide every result section and show the loading spinner.
function showLoading() {
    emptyState.hidden = true;
    errorEl.hidden = true;
    currentEl.hidden = true;
    forecastEl.hidden = true;
    loadingEl.hidden = false;
    dashboard.setAttribute("aria-busy", "true");
}

// Hide the loading spinner.
function hideLoading() {
    loadingEl.hidden = true;
    dashboard.setAttribute("aria-busy", "false");
}

// Show a user-friendly error message and hide stale content.
function showError(message) {
    hideLoading();
    emptyState.hidden = true;
    currentEl.hidden = true;
    forecastEl.hidden = true;
    errorText.textContent = message;
    errorEl.hidden = false;
}

/* ========================================
   5. UI rendering functions
   ======================================== */

// Render the current weather card from an API response + place data.
function renderCurrentWeather(weather, place) {
    const current = weather.current;
    const info = getWeatherInfo(current.weather_code);
    const today = weather.current.time.split("T")[0];

    // Prefer the full place name returned by the geocoding API.
    currentCity.textContent = place.country ? `${place.name}, ${place.country}` : place.name;
    currentDate.textContent = formatFullDate(today);
    currentIcon.textContent = info.icon;
    currentTemp.textContent = formatTemp(current.temperature_2m);
    currentCondition.textContent = info.condition;
    currentFeels.textContent = formatTemp(current.apparent_temperature);
    currentHumidity.textContent = `${current.relative_humidity_2m}%`;
    currentWind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;

    currentEl.hidden = false;
}

// Build the 5 forecast cards dynamically from the daily forecast data.
function renderForecast(weather) {
    const daily = weather.daily;
    forecastGrid.innerHTML = ""; // clear any previous cards

    for (let i = 0; i < daily.time.length; i++) {
        const dateString = daily.time[i];
        const info = getWeatherInfo(daily.weather_code[i]);

        const card = document.createElement("article");
        card.className = "forecast-card";

        card.innerHTML = `
            <p class="forecast-card__day">${formatWeekday(dateString)}</p>
            <p class="forecast-card__date">${formatShortDate(dateString)}</p>
            <p class="forecast-card__icon" aria-hidden="true">${info.icon}</p>
            <p class="forecast-card__condition">${info.condition}</p>
            <p class="forecast-card__temps">
                <span class="forecast-card__max">${formatTemp(daily.temperature_2m_max[i])}</span>
                <span class="forecast-card__min">${formatTemp(daily.temperature_2m_min[i])}</span>
            </p>
        `;

        forecastGrid.appendChild(card);
    }

    forecastEl.hidden = false;
}

/* ========================================
   6. Search flow
   ======================================== */

// Full flow: geocode the city, fetch its weather, then render the UI.
async function searchWeather(city) {
    showLoading();

    try {
        const place = await getCoordinates(city);
        const weather = await getWeather(place.latitude, place.longitude);

        hideLoading();
        renderCurrentWeather(weather, place);
        renderForecast(weather);
    } catch (error) {
        // Network failures and our own thrown errors both land here.
        const message =
            error instanceof TypeError
                ? "Network error. Check your connection and try again."
                : error.message;
        showError(message);
    }
}

/* ========================================
   7. Event listeners
   ======================================== */

// Handles both the Search button and the Enter key (form submit).
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        showError("Please enter a city name before searching.");
        return;
    }

    searchWeather(city);
});
