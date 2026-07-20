"use client";
import { useState, useEffect } from "react";
import { City } from "@/types";
import { useCities } from "@/hooks/useCities";

export const useCity = () => {
  const { cities } = useCities();
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cityOpen, setCityOpen] = useState(false);

  useEffect(() => {
    if (!selectedCity && cities.length > 0) {
      setSelectedCity(cities.find((c) => c.available) ?? cities[0]);
    }
  }, [cities, selectedCity]);

  const selectCity = (city: City) => {
    if (city.available) {
      setSelectedCity(city);
      setCityOpen(false);
    }
  };

  return {
    selectedCity,
    cityOpen,
    setCityOpen,
    selectCity,
    cities,
  };
};