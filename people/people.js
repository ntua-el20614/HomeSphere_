import * as THREE from '../three/build/three.module.js';
import { chris } from './chris.js';
import { leo } from './leo.js';

function isDesktop() {
  const ua = navigator.userAgent.toLowerCase();
  const isMobile = /android|iphone|ipad|ipod|mobile|tablet/i.test(ua);
  return !isMobile;
}

export async function createPeople(scene) {
  const devices = [];
  /*
  if (!isDesktop()) {
    console.log('Mobile/tablet detected – skipping people load.');
    return { devices }; // return empty if not desktop
  }*/

  // Group all people into one container
  const peopleGroup = new THREE.Group();
  scene.add(peopleGroup);

  // Load each person
  const chrisData = await chris(scene);
  devices.push(...chrisData.devices);

  const leoData = await leo(scene);
  devices.push(...leoData.devices);

  return { devices };
}
