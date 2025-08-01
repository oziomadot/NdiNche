import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { getToken } from './auth';
import { sendLocation } from './api';

const TASK_NAME = 'background-location-task';

TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  if (error) return;
  const { locations } = data;
  const token = await getToken();
  if (!token) return;

  const loc = locations[0].coords;
  await sendLocation(token, loc.latitude, loc.longitude);
});

export const startLocationUpdates = async () => {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status === 'granted') {
    await Location.startLocationUpdatesAsync(TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 60000, // every 60 seconds
      distanceInterval: 0,
      showsBackgroundLocationIndicator: true,
      pausesUpdatesAutomatically: false,
      foregroundService: {
        notificationTitle: 'NdiNche Tracking Active',
        notificationBody: 'Sending location for rescue',
      },
    });
  }
};
