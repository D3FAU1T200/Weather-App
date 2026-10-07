# Interactive Weather & Forecast Dashboard

A responsive weather dashboard built with HTML5, CSS3, and Vanilla JavaScript.
Search any city to see its current conditions and a 5-day forecast.

## Features

- Search by city/location (Search button or Enter key)
- Current weather: city, date, temperature, condition, icon, feels-like, humidity, wind speed
- Dynamically generated 5-day forecast cards (day, min/max temp, condition, icon)
- Loading indicator while requests are running
- Friendly error handling for empty input, unknown cities, API and network failures
- Responsive layout from ~375px mobile up to 1200px+ desktop
- Accessible, semantic markup with labels and ARIA attributes
- Clean initial empty state (no request on page load)

## Technologies Used

- HTML5
- CSS3 (Grid, Flexbox, CSS variables, media queries)
- Vanilla JavaScript (ES6+, Fetch API, async/await)

## API Used

Open-Meteo (no API key required):

- Geocoding API — converts a city name into latitude/longitude
- Forecast API — returns current weather and daily forecast data

The API timezone is requested so dates display correctly for the searched location.

## How to Run

1. Clone or download the repository.
2. Open `index.html` in any modern browser.

No build step and no dependencies are required.

## Project Structure

```text
weather-dashboard/
│
├── index.html
├── styles.css
├── app.js
├── README.md
├── .gitignore
│
└── assets/
    ├── icons/
    └── images/
```
