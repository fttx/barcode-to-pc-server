import { Injectable } from '@angular/core';

/**
 * AudioProvider provides shared functionality for playing sound effects
 * throughout the application
 */
@Injectable()
export class AudioProvider {

  /**
   * Plays a sound file from the assets/audio directory
   * @param filename The name of the audio file (without path)
   * @param volume Optional volume level (0.0 to 1.0, default: 1.0)
   */
  playSound(filename: string, volume: number = 1.0): void {
    try {
      let audio = new Audio();
      audio.src = `assets/audio/${filename}`;
      audio.volume = volume;
      audio.load();
      audio.play().catch(err => {
        // Silently handle audio play errors (e.g., user hasn't interacted with page yet)
        console.debug(`Could not play ${filename}:`, err);
      });
    } catch (err) {
      console.debug(`Error creating audio for ${filename}:`, err);
    }
  }
}
