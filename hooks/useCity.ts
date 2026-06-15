"use client";
import { useState } from "react";
import { City } from "@/types";
import { CITIES } from "@/constants";

export const useCity = () => {
  const [selectedCity, setSelectedCity] = useState<City>(
    CITIES.find((c) => c.available) ?? CITIES[0]
  );
  const [cityOpen, setCityOpen] = useState(false);

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
    cities: CITIES,
  };
};