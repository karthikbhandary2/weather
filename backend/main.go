package main

import (
	"fmt"
	"net/http"
	"io"
	"log"
	"encoding/json"
	"time"
	"os"
)

func main() {
	const serverPort = ":3333"
	http.HandleFunc("/", getWeatherData)
	fmt.Printf("Server is running on port %s\n", serverPort)
	log.Fatal(http.ListenAndServe(serverPort, nil))
}

type GeoLocation struct {
    IP            string `json:"ip"`
    City          string `json:"city"`
    Country       string `json:"country"`
    CountryRegion string `json:"countryRegion"`
    Continent     string `json:"continent"`
    Latitude      string `json:"latitude"`
    Longitude     string `json:"longitude"`
    Timezone      string `json:"timezone"`
    PostalCode    string `json:"postalCode"`
    Region        string `json:"region"`
}

func getGeolocation() (*GeoLocation, error) {
    client := &http.Client{Timeout: 5 * time.Second}

    resp, err := client.Get("https://geo.kamero.ai/api/geo")
    if err != nil {
        return nil, fmt.Errorf("request failed: %w", err)
    }
    defer resp.Body.Close()

    var geo GeoLocation
    if err := json.NewDecoder(resp.Body).Decode(&geo); err != nil {
        return nil, fmt.Errorf("decode failed: %w", err)
    }

    return &geo, nil
}

func getWeatherData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	
	if r.Method == "OPTIONS" {
		return
	}
	
	geo, err := getGeolocation()
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
	city := r.URL.Path[1:]
	if city == "" {
		city = geo.City
	}
	resp, err := http.Get(fmt.Sprintf("https://api.openweathermap.org/data/2.5/weather?q=%s&appid=%s", city, os.Getenv("OPENWEATHER_API_KEY")))
	if err != nil {
		http.Error(w, "Failed to fetch weather data", http.StatusInternalServerError)
		fmt.Printf("Error fetching weather data: %v\n", err)
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Failed to read weather data", http.StatusInternalServerError)
		fmt.Printf("Error reading response body: %v\n", err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}
