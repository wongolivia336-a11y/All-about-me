import { useEffect, useState } from "react";
import { GITHUB_USER, deskAccounts } from "../data/links";
import { focus } from "../interaction/studyStore";

interface Profile {
  avatar_url: string;
  name: string | null;
  login: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  html_url: string;
}

interface Repo {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  html_url: string;
}

/**
 * Live GitHub, fetched straight from the browser.
 *
 * The unauthenticated REST API allows 60 requests per hour *per visitor IP*,
 * so each visitor gets their own budget and two calls per page view is not
 * close to the limit. No token, no backend, no build step — and no risk of
 * showing a cached snapshot while claiming it is live.
 */
export function GitHubPanel() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const base = "https://api.github.com";

    Promise.all([
      fetch(`${base}/users/${GITHUB_USER}`).then((r) => {
        if (r.status === 403) throw new Error("GitHub 接口调用频率超限，稍后再试");
        if (!r.ok) throw new Error(`GitHub ${r.status}`);
        return r.json();
      }),
      fetch(`${base}/users/${GITHUB_USER}/repos?sort=updated&per_page=6`).then(
        (r) => (r.ok ? r.json() : []),
      ),
    ])
      .then(([p, rs]) => {
        if (!alive) return;
        setProfile(p);
        setRepos(rs);
      })
      .catch((e) => alive && setError(e.message));

    return () => {
      alive = false;
    };
  }, []);

  const linkedin = deskAccounts.find((a) => a.id === "linkedin");

  return (
    <aside className="panel panel--wide">
      <button className="panel__close" onClick={() => focus(null)} aria-label="返回房间">
        ✕
      </button>

      <p className="panel__kicker">Web · GitHub</p>
      <h2 className="panel__title">代码与网页</h2>

      {error && <p className="panel__body">{error}</p>}
      {!profile && !error && <p className="panel__body">正在读取 GitHub…</p>}

      {profile && (
        <>
          <div className="gh__head">
            <img className="gh__avatar" src={profile.avatar_url} alt="" width={56} height={56} />
            <div>
              <p className="gh__name">{profile.name ?? profile.login}</p>
              <p className="gh__meta">
                {profile.public_repos} repos · {profile.followers} followers
              </p>
            </div>
            <span className="gh__live">LIVE</span>
          </div>

          {profile.bio && <p className="panel__body">{profile.bio}</p>}

          <ul className="panel__list">
            {repos?.map((repo) => (
              <li key={repo.id}>
                <a className="gh__repo" href={repo.html_url} target="_blank" rel="noreferrer">
                  <span className="panel__item-title">{repo.name}</span>
                  {repo.description && <span className="gh__desc">{repo.description}</span>}
                </a>
                <span className="panel__item-meta">
                  {repo.language ?? "—"}
                  {repo.stargazers_count > 0 && ` · ★${repo.stargazers_count}`}
                </span>
              </li>
            ))}
          </ul>

          <a className="panel__cta" href={profile.html_url} target="_blank" rel="noreferrer">
            打开 GitHub 主页
          </a>
        </>
      )}

      <p className="panel__note">
        {linkedin?.href ? (
          <a href={linkedin.href} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        ) : (
          <>LinkedIn 链接待补 — 它没有公开 API，只能静态跳转</>
        )}
      </p>
    </aside>
  );
}
