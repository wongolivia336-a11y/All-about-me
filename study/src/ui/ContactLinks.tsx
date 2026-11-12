import { CONTACT_EMAIL, CONTACT_PHONE, GITHUB_USER, LINKEDIN_URL, WECHAT_CONTACT_URL, WECHAT_OFFICIAL_URL, XIAOHONGSHU_URL } from "../data/links";
import { useLanguage } from "../i18n";

type ChannelId = "github" | "email" | "linkedin" | "official" | "wechat" | "xiaohongshu" | "phone";

function ChannelIcon({ id }: { id: ChannelId }) {
  if (id === "github") {
    return <path fill="currentColor" stroke="none" d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.08c-3.1.67-3.76-1.32-3.76-1.32-.5-1.29-1.24-1.63-1.24-1.63-1.02-.7.08-.69.08-.69 1.12.08 1.7 1.15 1.7 1.15 1 1.7 2.61 1.21 3.25.93.1-.72.39-1.21.71-1.49-2.48-.28-5.08-1.24-5.08-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.58 10.58 0 0 1 5.55 0c2.1-1.44 3.04-1.14 3.04-1.14.61 1.54.23 2.68.12 2.96.71.78 1.14 1.78 1.14 3.01 0 4.28-2.6 5.23-5.09 5.5.4.35.75 1.03.75 2.08v3.06c0 .3.2.65.76.54A11.1 11.1 0 0 0 12 .9Z" />;
  }
  if (id === "email") {
    return <><path d="M3.5 5.5h17v13h-17z" /><path d="m4 6 8 6 8-6" /></>;
  }
  if (id === "linkedin") {
    return <path fill="currentColor" stroke="none" d="M4.1 8.9h3.25v10.7H4.1zM5.72 3.6a1.89 1.89 0 1 1-.02 3.78 1.89 1.89 0 0 1 .02-3.78ZM9.2 8.9h3.12v1.46h.05c.44-.83 1.5-1.7 3.09-1.7 3.3 0 3.91 2.18 3.91 5.02v5.92h-3.25v-5.25c0-1.25-.02-2.86-1.74-2.86s-2.01 1.36-2.01 2.77v5.34H9.2z" />;
  }
  if (id === "official") {
    return <><path d="M3.2 4.4h12.6v9.1H8.4l-4.5 3.1V4.4Z" /><path d="M8.2 8.95h.01M11.1 8.95h.01M14 8.95h.01" strokeWidth="2.2" strokeLinecap="round" /><path d="M11.2 16.7h5l4 2.4v-9h-2.1" /></>;
  }
  if (id === "wechat") {
    return <><path d="M14.4 3.2c-4.1 0-7.4 2.6-7.4 5.8 0 1.1.4 2.1 1.1 2.9-.1.8-.4 1.6-.9 2.4 1.1-.2 2.1-.7 2.8-1.2.8.3 1.6.4 2.4.4 4.1 0 7.4-2.6 7.4-5.8s-3.3-5.8-7.4-5.8Z" /><path d="M9.2 10.2c-3.7 0-6.6 2.3-6.6 5.2 0 1.6.9 3 2.3 3.9-.1.9-.4 1.6-.8 2.3 1-.2 2-.6 2.7-1.2.7.2 1.5.3 2.4.3 1.9 0 3.6-.6 4.8-1.7" /><path d="M11.2 7.8h.01M16 7.8h.01M7.2 15.4h.01M10.8 15.4h.01" strokeWidth="2" strokeLinecap="round" /></>;
  }
  if (id === "xiaohongshu") {
    return <text x="12" y="15.4" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="Arial, sans-serif" fontSize="7.2" fontWeight="700">RED</text>;
  }
  return <><path d="M7.3 3.5 10 7.3 8.2 9.1a14.7 14.7 0 0 0 6.7 6.7l1.8-1.8 3.8 2.7-.9 3.1c-.2.6-.8 1-1.5 1C10.2 20.1 3.9 13.8 3.2 5.9c-.1-.7.3-1.3 1-1.5l3.1-.9Z" /></>;
}

export function ContactLinks() {
  const { copy } = useLanguage();
  const channels: { id: ChannelId; label: string; href: string | null }[] = [
    { id: "github", label: copy.githubOpen, href: `https://github.com/${GITHUB_USER}` },
    { id: "email", label: copy.emailContact, href: `mailto:${CONTACT_EMAIL}` },
    { id: "linkedin", label: copy.linkedinContact, href: LINKEDIN_URL },
    { id: "official", label: copy.officialAccountContact, href: WECHAT_OFFICIAL_URL },
    { id: "wechat", label: copy.wechatContact, href: WECHAT_CONTACT_URL },
    { id: "xiaohongshu", label: copy.xiaohongshuContact, href: XIAOHONGSHU_URL },
    { id: "phone", label: copy.phoneContact, href: CONTACT_PHONE ? `tel:${CONTACT_PHONE.replace(/[^+\d]/g, "")}` : null },
  ];

  return (
    <div className="archive__social-note">
      <p>{copy.socialLinkLead}</p>
      <div className="archive__social-links" role="group" aria-label={copy.socialLinksLabel}>
        {channels.map(({ id, label, href }) => (
          href ? (
            <a
              className="archive__social-link"
              key={id}
              href={href}
              target={href.startsWith("https://") ? "_blank" : undefined}
              rel={href.startsWith("https://") ? "noreferrer" : undefined}
              aria-label={label}
              title={label}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <ChannelIcon id={id} />
              </svg>
            </a>
          ) : (
            <button
              className="archive__social-link archive__social-link--pending"
              key={id}
              type="button"
              disabled
              aria-label={`${label}. ${copy.contactLinkPending}`}
              title={copy.contactLinkPending}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <ChannelIcon id={id} />
              </svg>
            </button>
          )
        ))}
      </div>
    </div>
  );
}
