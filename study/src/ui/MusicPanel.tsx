import { phoneApps } from "../data/links";
import { focus, useMusicState } from "../interaction/studyStore";
import { useLanguage } from "../i18n";

/**
 * The speaker.
 *
 * Browsers block audio that starts without a user gesture, so playback only
 * ever begins from this button — which suits the room, where nothing happens
 * until you touch an object.
 */
export function MusicPanel() {
  const { copy } = useLanguage();
  const { musicPlaying, musicUnavailable, setMusicPlaying, volume, setVolume } =
    useMusicState();
  const netease = phoneApps.find((a) => a.id === "netease");

  return (
    <aside className="panel">
      <button className="panel__close" onClick={() => focus(null)} aria-label={copy.closePanel}>
        ✕
      </button>

      <p className="panel__kicker">{copy.musicKicker}</p>
      <h2 className="panel__title">{copy.musicTitle}</h2>
      <p className="panel__body">{copy.musicBody}</p>

      <button
        className="panel__cta panel__cta--button"
        onClick={() => setMusicPlaying(!musicPlaying)}
      >
        {musicPlaying ? copy.pause : copy.play}
      </button>

      {/* the cat's meow rides the same setting, so one control covers the room */}
      <label className="volume">
        <span className="volume__label">{copy.volume}</span>
        <input
          className="volume__slider"
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(volume * 100)}
          onChange={(e) => setVolume(Number(e.target.value) / 100)}
          aria-label={copy.volume}
        />
        <span className="volume__value">{Math.round(volume * 100)}</span>
      </label>

      {musicUnavailable && (
        <p className="panel__note panel__note--warn">{copy.audioMissing}</p>
      )}

      {netease?.href ? (
        <a className="panel__note-link" href={netease.href} target="_blank" rel="noreferrer">
          {copy.openPlaylist}
        </a>
      ) : (
        <p className="panel__note">{copy.playlistMissing}</p>
      )}

      <p className="panel__note">
        {copy.musicRights}
      </p>
    </aside>
  );
}
