import React, { useEffect, useState } from "react";
import { View, Text, BackHandler, Platform } from "react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import * as IntentLauncher from "expo-intent-launcher";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundTask from 'expo-background-task';
import API from "../lib/api";



const TASK_NAME = "SEND_LOCATION";

// Define task globally
TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.log("❌ Background task error:", error);
    return;
  }

  if (data) {
    const { locations } = data;
    const userId = await AsyncStorage.getItem("userId");

    if (userId && locations?.length > 0) {
      const { latitude, longitude } = locations[0].coords;

      await API.post("/live-location", {
        userId,
        latitude,
        longitude,
      });

      console.log("📡 Location sent:", latitude, longitude);
    }
  }
});

// Helper to start tracking
export async function startBackgroundLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();

  if (status !== "granted" || bgStatus !== "granted") {
    console.log("❌ Location permissions denied");
    return;
  }

  await Location.startLocationUpdatesAsync(TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: 120000, // every 2 minutes
    distanceInterval: 0,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "NdiNche Security",
      notificationBody: "Your location is being tracked for safety.",
    },
  });

  console.log("✅ Background location started");
}

export default function CheckStatusScreen() {
  const [dots, setDots] = useState("");

  // 🔹 Animate "..."
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Handle back button → background
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        BackHandler.exitApp(); // send app to background
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  // 🔹 Auto minimize after 1 minute (Android only)
  useEffect(() => {
    if (Platform.OS === "android") {
      const timer = setTimeout(() => {
        IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.MAIN
        );
      }, 60000); // 1 min
      return () => clearTimeout(timer);
    }
  }, []);

  // 🔹 Register background location task
  useEffect(() => {
    
      startBackgroundLocation();
    
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, color: "black" }}>
        Live tracking started{dots}
      </Text>
    </View>
  );
}
