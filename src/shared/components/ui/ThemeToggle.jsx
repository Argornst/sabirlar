// Native <button role="switch"> intentionally used instead of the shared
// <Button> primitive (design-system §2.7). This is a skeuomorphic switch
// with inline SVG illustration (clouds + stars + sun/moon), not a regular
// action button — pill + knob + decorations would fight .ui-button cascade.
export default function ThemeToggle({ theme, onToggle }) {
  const isLight = theme === "light";
  const label = isLight ? "Koyu temaya geç" : "Açık temaya geç";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      className={`ui-theme-toggle ui-theme-toggle--${theme}`}
      onClick={onToggle}
      title={label}
      aria-label={label}
    >
      {/* Sky decoration layer — clouds (light) + stars (dark), behind knob */}
      <svg
        className="ui-theme-toggle__sky"
        viewBox="0 0 80 36"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <g className="ui-theme-toggle__clouds">
          <g transform="translate(38 10)">
            <ellipse cx="3" cy="6" rx="3" ry="2.5" fill="#fff" opacity="0.85" />
            <ellipse cx="7" cy="4" rx="4" ry="3" fill="#fff" opacity="0.95" />
            <ellipse cx="12" cy="6" rx="3.5" ry="2.5" fill="#fff" opacity="0.85" />
            <ellipse cx="9" cy="7.5" rx="6" ry="2" fill="#fff" opacity="0.9" />
          </g>
          <g transform="translate(56 18) scale(0.7)">
            <ellipse cx="3" cy="6" rx="3" ry="2.5" fill="#fff" opacity="0.8" />
            <ellipse cx="7" cy="4" rx="4" ry="3" fill="#fff" opacity="0.9" />
            <ellipse cx="12" cy="6" rx="3.5" ry="2.5" fill="#fff" opacity="0.8" />
            <ellipse cx="9" cy="7.5" rx="6" ry="2" fill="#fff" opacity="0.85" />
          </g>
          <g transform="translate(46 22) scale(0.55)">
            <ellipse cx="3" cy="6" rx="3" ry="2.5" fill="#fff" opacity="0.75" />
            <ellipse cx="7" cy="4" rx="4" ry="3" fill="#fff" opacity="0.85" />
            <ellipse cx="12" cy="6" rx="3.5" ry="2.5" fill="#fff" opacity="0.75" />
            <ellipse cx="9" cy="7.5" rx="6" ry="2" fill="#fff" opacity="0.8" />
          </g>
        </g>
        <g className="ui-theme-toggle__stars">
          <circle cx="8" cy="6" r="0.8" fill="#fff" opacity="0.85" />
          <circle cx="14" cy="12" r="0.5" fill="#fff" opacity="0.6" />
          <circle
            cx="20"
            cy="8"
            r="1.2"
            fill="#fff"
            opacity="0.95"
            className="ui-theme-toggle__star--twinkle-1"
          />
          <circle cx="26" cy="22" r="0.7" fill="#fff" opacity="0.7" />
          <circle
            cx="32"
            cy="14"
            r="0.5"
            fill="#fff"
            opacity="0.6"
            className="ui-theme-toggle__star--twinkle-2"
          />
          <circle cx="36" cy="26" r="0.9" fill="#fff" opacity="0.8" />
          <circle cx="42" cy="6" r="0.6" fill="#fff" opacity="0.65" />
          <circle
            cx="50"
            cy="20"
            r="0.8"
            fill="#fff"
            opacity="0.75"
            className="ui-theme-toggle__star--twinkle-3"
          />
          <circle cx="58" cy="10" r="0.5" fill="#fff" opacity="0.6" />
          <circle cx="64" cy="26" r="0.7" fill="#fff" opacity="0.7" />
          <path
            d="M22,16 L23,18 L25,19 L23,20 L22,22 L21,20 L19,19 L21,18 Z"
            fill="#fff"
            opacity="0.95"
            className="ui-theme-toggle__star--twinkle-4"
          />
          <path
            d="M54,28 L55,29.5 L56.5,30 L55,30.5 L54,32 L53,30.5 L51.5,30 L53,29.5 Z"
            fill="#fff"
            opacity="0.9"
          />
        </g>
      </svg>

      {/* Knob with sun/moon overlay details (body comes from knob bg) */}
      <span className="ui-theme-toggle__knob">
        <svg
          className="ui-theme-toggle__sun"
          viewBox="0 0 32 32"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="11" cy="11" r="4" fill="#fff" opacity="0.25" />
        </svg>
        <svg
          className="ui-theme-toggle__moon"
          viewBox="0 0 32 32"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="12" cy="12" r="2" fill="#64748b" opacity="0.4" />
          <circle cx="20" cy="18" r="1.6" fill="#64748b" opacity="0.35" />
          <circle cx="14" cy="22" r="1.2" fill="#64748b" opacity="0.3" />
          <circle cx="11" cy="11" r="4" fill="#fff" opacity="0.18" />
        </svg>
      </span>
    </button>
  );
}
