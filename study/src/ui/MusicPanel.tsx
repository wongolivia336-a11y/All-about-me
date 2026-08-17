import { phoneApps } from "../data/links";
import { focus, useStudy } from "../interaction/studyStore";

/**
 * The speaker.
 *
 * Browsers block audio that starts without a user gesture, so playback only
 * ever begins from this button — which suits the room, where nothing happens
 * until you touch an object.
 */
export function MusicPanel() {
  const { musicPlaying, musicUnavailable, setMusicPlaying } = useStudy();
  const netease = phoneApps.find((a) => a.id === "netease");

  return (
    <aside className="panel">
      <button className="panel__close" onClick={() => focus(null)} aria-label="返回房间">
        ✕
      </button>

      <p className="panel__kicker">Music</p>
      <h2 className="panel__title">在听什么</h2>
      <p className="panel__body">
        点一下音箱就开始放。放一个音频文件到 <code>public/audio/now-playing.mp3</code>
        ，这里就会播它。
      </p>

      <button
        className="panel__cta panel__cta--button"
        onClick={() => setMusicPlaying(!musicPlaying)}
      >
        {musicPlaying ? "⏸  暂停" : "▶  播放"}
      </button>

      {musicUnavailable && (
        <p className="panel__note panel__note--warn">
          放不出来——<code>public/audio/now-playing.mp3</code> 还不存在。放一个音频文件进去就能播了。
        </p>
      )}

      {netease?.href ? (
        <a className="panel__note-link" href={netease.href} target="_blank" rel="noreferrer">
          在网易云打开完整歌单 →
        </a>
      ) : (
        <p className="panel__note">网易云歌单链接待补（填在 src/data/links.ts）</p>
      )}

      <p className="panel__note">
        注意：公开网站上播放有版权的音乐同样需要授权，自己的录音或授权素材最稳妥。
      </p>
    </aside>
  );
}
