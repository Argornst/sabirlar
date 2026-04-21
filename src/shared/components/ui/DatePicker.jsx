import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import "../../styles/date-picker.css";

const WEEKDAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTH_NAMES = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

const DROPDOWN_ESTIMATED_HEIGHT = {
  sm: 300,
  md: 336,
};

const DROPDOWN_MIN_WIDTH = {
  sm: 268,
  md: 284,
};

const DROPDOWN_MAX_WIDTH = {
  sm: 300,
  md: 320,
};

const VIEWPORT_GUTTER = 8;
const CONTROL_GAP = 8;

function pad(value) {
  return String(value).padStart(2, "0");
}

function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function parseDateKey(value) {
  if (!value || typeof value !== "string") return null;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return null;

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDisplayDate(value) {
  const date = parseDateKey(value);

  if (!date) return "";

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getCalendarDays(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const mondayBasedOffset = firstWeekday === 0 ? 6 : firstWeekday - 1;

  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - mondayBasedOffset);

  const days = [];
  const cursor = new Date(gridStart);

  for (let index = 0; index < 42; index += 1) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function isSameDay(a, b) {
  return (
    a?.getFullYear?.() === b?.getFullYear?.() &&
    a?.getMonth?.() === b?.getMonth?.() &&
    a?.getDate?.() === b?.getDate?.()
  );
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function addDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return new Date(
    nextDate.getFullYear(),
    nextDate.getMonth(),
    nextDate.getDate()
  );
}

function getStartOfWeek(date) {
  const currentDay = date.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  return addDays(date, mondayOffset);
}

function getEndOfWeek(date) {
  return addDays(getStartOfWeek(date), 6);
}

function addMonths(date, amount) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + amount);
  return new Date(
    nextDate.getFullYear(),
    nextDate.getMonth(),
    nextDate.getDate()
  );
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function setMonthKeepingDay(date, month) {
  const year = date.getFullYear();
  const nextDay = Math.min(date.getDate(), getDaysInMonth(year, month));
  return new Date(year, month, nextDay);
}

function setYearKeepingDay(date, year) {
  const month = date.getMonth();
  const nextDay = Math.min(date.getDate(), getDaysInMonth(year, month));
  return new Date(year, month, nextDay);
}

function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildYearOptions({
  viewDate,
  minDate,
  maxDate,
  rangeBefore = 10,
  rangeAfter = 10,
}) {
  const currentYear = viewDate.getFullYear();
  const startYear = minDate
    ? minDate.getFullYear()
    : currentYear - rangeBefore;
  const endYear = maxDate
    ? maxDate.getFullYear()
    : currentYear + rangeAfter;

  const years = [];

  for (let year = startYear; year <= endYear; year += 1) {
    years.push(year);
  }

  return years;
}

function resolvePresetDateValue(presetValue, today, selectedDate) {
  if (typeof presetValue === "function") {
    return presetValue({
      today,
      selectedDate,
    });
  }

  if (presetValue === "today") {
    return toDateKey(today);
  }

  if (presetValue === "tomorrow") {
    return toDateKey(addDays(today, 1));
  }

  if (presetValue === "yesterday") {
    return toDateKey(addDays(today, -1));
  }

  if (typeof presetValue === "string") {
    return presetValue;
  }

  return "";
}

const DEFAULT_PRESETS = [
  { label: "Temizle", action: "clear", variant: "ghost" },
  { label: "Bugün", value: "today", variant: "primary" },
];

export default function DatePicker({
  name,
  value,
  defaultValue = "",
  onChange,
  placeholder = "gg.aa.yyyy",
  disabled = false,
  className = "",
  min,
  max,
  size = "md",
  placement = "auto",
  presets = DEFAULT_PRESETS,
  yearRangeBefore = 10,
  yearRangeAfter = 10,
}) {
  const rootRef = useRef(null);
  const dropdownRef = useRef(null);
  const dayButtonRefs = useRef({});

  const safeSize = size === "sm" ? "sm" : "md";
  const safePlacement =
    placement === "top" || placement === "bottom" ? placement : "auto";

  const isControlled = value !== undefined;
  const actualValue = isControlled ? value || "" : defaultValue || "";

  const selectedDate = useMemo(() => parseDateKey(actualValue), [actualValue]);
  const minDate = useMemo(() => parseDateKey(min), [min]);
  const maxDate = useMemo(() => parseDateKey(max), [max]);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(selectedDate || today);
  const [focusedDate, setFocusedDate] = useState(selectedDate || today);
  const [dropdownStyle, setDropdownStyle] = useState({
    top: 0,
    left: 0,
    width: DROPDOWN_MIN_WIDTH[safeSize],
  });
  const [openDirection, setOpenDirection] = useState("bottom");

  const calendarDays = useMemo(() => getCalendarDays(viewDate), [viewDate]);
  const displayValue = formatDisplayDate(actualValue);

  const yearOptions = useMemo(
    () =>
      buildYearOptions({
        viewDate,
        minDate,
        maxDate,
        rangeBefore: yearRangeBefore,
        rangeAfter: yearRangeAfter,
      }),
    [viewDate, minDate, maxDate, yearRangeBefore, yearRangeAfter]
  );

  useEffect(() => {
    if (!selectedDate) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      setViewDate(selectedDate);
      setFocusedDate(selectedDate);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [selectedDate]);

  function emitChange(nextValue) {
    onChange?.({
      target: {
        name,
        value: nextValue,
      },
    });
  }

  function isDateDisabled(date) {
    const normalized = normalizeDate(date);

    if (minDate && normalized < minDate) return true;
    if (maxDate && normalized > maxDate) return true;

    return false;
  }

  function getNearestEnabledDate(date, step = 1, limit = 366) {
    let candidate = normalizeDate(date);
    let guard = 0;

    while (isDateDisabled(candidate) && guard < limit) {
      candidate = addDays(candidate, step);
      guard += 1;
    }

    return candidate;
  }

  function syncViewWithFocus(date) {
    if (
      date.getFullYear() !== viewDate.getFullYear() ||
      date.getMonth() !== viewDate.getMonth()
    ) {
      setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }

  const updateDropdownPosition = useCallback(() => {
    if (!rootRef.current) return;

    const rect = rootRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    const preferredWidth = Math.max(
      DROPDOWN_MIN_WIDTH[safeSize],
      Math.min(DROPDOWN_MAX_WIDTH[safeSize], rect.width)
    );
    const maxWidth = Math.min(
      preferredWidth,
      viewportWidth - VIEWPORT_GUTTER * 2
    );

    const left = clamp(
      rect.left + scrollX,
      VIEWPORT_GUTTER,
      viewportWidth - maxWidth - VIEWPORT_GUTTER
    );

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const shouldOpenTop =
      safePlacement === "top"
        ? true
        : safePlacement === "bottom"
        ? false
        : spaceBelow < DROPDOWN_ESTIMATED_HEIGHT[safeSize] &&
          spaceAbove > spaceBelow &&
          spaceAbove >= 220;

    const measuredHeight =
      dropdownRef.current?.offsetHeight ||
      DROPDOWN_ESTIMATED_HEIGHT[safeSize];

    const top = shouldOpenTop
      ? rect.top + scrollY - measuredHeight - CONTROL_GAP
      : rect.bottom + scrollY + CONTROL_GAP;

    setOpenDirection(shouldOpenTop ? "top" : "bottom");
    setDropdownStyle({
      top: Math.max(scrollY + VIEWPORT_GUTTER, top),
      left,
      width: maxWidth,
    });
  }, [safePlacement, safeSize]);

  useLayoutEffect(() => {
    if (!isOpen) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      updateDropdownPosition();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isOpen, viewDate, updateDropdownPosition]);

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event) {
      const clickedInsideRoot = rootRef.current?.contains(event.target);
      const clickedInsideDropdown = dropdownRef.current?.contains(event.target);

      if (!clickedInsideRoot && !clickedInsideDropdown) {
        setIsOpen(false);
      }
    }

    function handleWindowChange() {
      updateDropdownPosition();
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleWindowChange);
    window.addEventListener("scroll", handleWindowChange, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleWindowChange);
      window.removeEventListener("scroll", handleWindowChange, true);
    };
  }, [isOpen, updateDropdownPosition]);

  useEffect(() => {
    if (!isOpen || !focusedDate) return;

    const key = toDateKey(focusedDate);
    const element = dayButtonRefs.current[key];

    if (element) {
      element.focus();
    }
  }, [isOpen, focusedDate, calendarDays]);

  function handleOpen() {
    if (disabled) return;

    const baseDate = selectedDate || today;
    const nextFocusedDate = isDateDisabled(baseDate)
      ? getNearestEnabledDate(baseDate, 1)
      : baseDate;

    setFocusedDate(nextFocusedDate);
    setViewDate(
      new Date(nextFocusedDate.getFullYear(), nextFocusedDate.getMonth(), 1)
    );
    setIsOpen(true);
  }

  function handleToggle() {
    if (disabled) return;

    if (!isOpen) {
      handleOpen();
      return;
    }

    setIsOpen(false);
  }

  function handleSelectDate(date) {
    if (isDateDisabled(date)) return;
    emitChange(toDateKey(date));
    setFocusedDate(date);
    setIsOpen(false);
  }

  function handleClear() {
    emitChange("");
    setFocusedDate(today);
    setIsOpen(false);
  }


  function goPrevMonth() {
    const nextView = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    setViewDate(nextView);
  }

  function goNextMonth() {
    const nextView = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    setViewDate(nextView);
  }

  function moveFocus(nextDate) {
    const direction = nextDate >= focusedDate ? 1 : -1;
    const safeDate = isDateDisabled(nextDate)
      ? getNearestEnabledDate(nextDate, direction)
      : nextDate;

    setFocusedDate(safeDate);
    syncViewWithFocus(safeDate);
  }

  function handleControlKeyDown(event) {
    if (disabled) return;

    if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      handleOpen();
    }
  }

  function handleDayKeyDown(event) {
    if (!focusedDate) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelectDate(focusedDate);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveFocus(addDays(focusedDate, -1));
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveFocus(addDays(focusedDate, 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(addDays(focusedDate, -7));
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus(addDays(focusedDate, 7));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      moveFocus(getStartOfWeek(focusedDate));
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      moveFocus(getEndOfWeek(focusedDate));
      return;
    }

    if (event.key === "PageUp") {
      event.preventDefault();
      moveFocus(addMonths(focusedDate, -1));
      return;
    }

    if (event.key === "PageDown") {
      event.preventDefault();
      moveFocus(addMonths(focusedDate, 1));
    }
  }

  function handleMonthSelectChange(event) {
    const nextMonth = Number(event.target.value);
    const baseDate = focusedDate || selectedDate || today;
    const nextDate = setMonthKeepingDay(baseDate, nextMonth);
    const safeDate = isDateDisabled(nextDate)
      ? getNearestEnabledDate(nextDate, 1)
      : nextDate;

    setViewDate(new Date(safeDate.getFullYear(), safeDate.getMonth(), 1));
    setFocusedDate(safeDate);
  }

  function handleYearSelectChange(event) {
    const nextYear = Number(event.target.value);
    const baseDate = focusedDate || selectedDate || today;
    const nextDate = setYearKeepingDay(baseDate, nextYear);
    const safeDate = isDateDisabled(nextDate)
      ? getNearestEnabledDate(nextDate, 1)
      : nextDate;

    setViewDate(new Date(safeDate.getFullYear(), safeDate.getMonth(), 1));
    setFocusedDate(safeDate);
  }

  function handlePresetClick(preset) {
    if (preset.action === "clear") {
      handleClear();
      return;
    }

    const resolvedValue = resolvePresetDateValue(
      preset.value,
      today,
      selectedDate
    );

    const resolvedDate = parseDateKey(resolvedValue);

    if (!resolvedDate || isDateDisabled(resolvedDate)) return;

    setViewDate(resolvedDate);
    setFocusedDate(resolvedDate);
    emitChange(toDateKey(resolvedDate));
    setIsOpen(false);
  }

  const dropdownNode = isOpen
    ? createPortal(
        <div
          ref={dropdownRef}
          className={[
            "ui-date-picker__portal",
            openDirection === "top"
              ? "ui-date-picker__portal--top"
              : "ui-date-picker__portal--bottom",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            top: `${dropdownStyle.top}px`,
            left: `${dropdownStyle.left}px`,
            width: `${dropdownStyle.width}px`,
          }}
        >
          <div
            className={[
              "ui-date-picker__dropdown",
              "ui-date-picker__dropdown--portal",
              `ui-date-picker__dropdown--${safeSize}`,
            ].join(" ")}
            role="dialog"
            aria-label="Tarih seçici"
          >
            <div className="ui-date-picker__header">
              <button
                type="button"
                className="ui-date-picker__nav"
                onClick={goPrevMonth}
                aria-label="Önceki ay"
              >
                ‹
              </button>

              <div className="ui-date-picker__header-selects">
                <select
                  className="ui-date-picker__select"
                  value={viewDate.getMonth()}
                  onChange={handleMonthSelectChange}
                  aria-label="Ay seç"
                >
                  {MONTH_NAMES.map((monthLabel, index) => (
                    <option key={monthLabel} value={index}>
                      {monthLabel}
                    </option>
                  ))}
                </select>

                <select
                  className="ui-date-picker__select ui-date-picker__select--year"
                  value={viewDate.getFullYear()}
                  onChange={handleYearSelectChange}
                  aria-label="Yıl seç"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="ui-date-picker__nav"
                onClick={goNextMonth}
                aria-label="Sonraki ay"
              >
                ›
              </button>
            </div>

            <div className="ui-date-picker__weekdays">
              {WEEKDAY_LABELS.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>

            <div className="ui-date-picker__grid">
              {calendarDays.map((date) => {
                const key = toDateKey(date);
                const isCurrentMonth = date.getMonth() === viewDate.getMonth();
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isTodayCell = isSameDay(date, today);
                const isDisabled = isDateDisabled(date);
                const isFocused = focusedDate && isSameDay(date, focusedDate);

                return (
                  <button
                    key={key}
                    ref={(element) => {
                      if (element) {
                        dayButtonRefs.current[key] = element;
                      } else {
                        delete dayButtonRefs.current[key];
                      }
                    }}
                    type="button"
                    className={[
                      "ui-date-picker__day",
                      isCurrentMonth ? "" : "ui-date-picker__day--outside",
                      isSelected ? "ui-date-picker__day--selected" : "",
                      isTodayCell ? "ui-date-picker__day--today" : "",
                      isDisabled ? "ui-date-picker__day--disabled" : "",
                      isFocused ? "ui-date-picker__day--focused" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleSelectDate(date)}
                    onKeyDown={handleDayKeyDown}
                    onMouseEnter={() => {
                      if (!isDisabled) {
                        setFocusedDate(date);
                      }
                    }}
                    tabIndex={isFocused ? 0 : -1}
                    disabled={isDisabled}
                    aria-selected={Boolean(isSelected)}
                    aria-label={new Intl.DateTimeFormat("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(date)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="ui-date-picker__footer">
              {(Array.isArray(presets) ? presets : DEFAULT_PRESETS).map((preset) => (
                <button
                  key={`${preset.label}-${preset.action || preset.value}`}
                  type="button"
                  className={[
                    "ui-date-picker__action",
                    preset.variant === "primary"
                      ? "ui-date-picker__action--primary"
                      : "ui-date-picker__action--ghost",
                  ].join(" ")}
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div
        ref={rootRef}
        className={[
          "ui-date-picker",
          `ui-date-picker--${safeSize}`,
          isOpen ? "ui-date-picker--open" : "",
          disabled ? "ui-date-picker--disabled" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <input type="hidden" name={name} value={actualValue} readOnly />

        <button
          type="button"
          className="ui-date-picker__control"
          onClick={handleOpen}
          onKeyDown={handleControlKeyDown}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          <span
            className={[
              "ui-date-picker__value",
              displayValue ? "" : "ui-date-picker__value--placeholder",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {displayValue || placeholder}
          </span>

          <span
            className="ui-date-picker__icon"
            onClick={(event) => {
              event.stopPropagation();
              handleToggle();
            }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M8 3v3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M16 3v3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M4 9h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <rect
                x="4"
                y="5"
                width="16"
                height="15"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </span>
        </button>
      </div>

      {dropdownNode}
    </>
  );
}