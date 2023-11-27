import { useEffect, useState } from 'react';
import { Howl } from 'howler';
import ding from '../assets/ding.mp3';
import newMessageSound from '../assets/newMessageSound.mp3';

export const useAudio = (audiosrc: string) => {
  const [audio, setAudio] = useState<Howl | null>(null);

  useEffect(() => {
    const howl = new Howl({
      src: audiosrc,
      onloaderror: (soundId, error) => console.error(soundId, error),
      onplayerror: (soundId, error) => {
        console.error(soundId, error);
        howl.once('unlock', () => howl.play());
      },
    });

    setAudio(howl);

    return () => {
      howl.unload();
    }
  }, []);

  return [audio] as const;
}

export const useDing = () => {
  return useAudio(ding);
}

export const useNewMessageSound = () => {
  return useAudio(newMessageSound);
}
