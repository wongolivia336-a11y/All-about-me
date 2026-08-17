# Speaker audio

Put a file called `now-playing.mp3` in this folder and the Marshall on the desk
will play it. Until then, pressing play says so instead of failing silently.

Two things worth knowing:

**Autoplay is blocked.** Every browser refuses audio that starts without a user
gesture, so playback can only ever begin from the play button. That suits the
room — nothing here happens until you touch an object.

**Licensing applies to public sites.** Streaming a commercial track from your
own page is not the same as listening to it. Your own recordings, licensed
production music, or a link out to the playlist on a service that holds the
rights all avoid the problem. The NetEase link in `src/data/links.ts` is the
safe way to share what you actually listen to.
